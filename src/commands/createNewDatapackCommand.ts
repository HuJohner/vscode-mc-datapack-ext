import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');

const ABORT_NEW = 'Aborted datapack creation';
const ABORT_STRUCTURE = 'Aborted creation of datapack structure';
const FAILED_NEW = 'Failed to create MC datapack';
const SUCCESS_NEW = 'Created MC datapack';

export function run(uri: vscode.Uri) {
    // get current path
    if (uri === undefined) {
        return vscode.window.showErrorMessage('No current path available');
    }
    let filepath = uri.fsPath;

    // get correct current directory
    let curDir = filepath;
    if (!fs.statSync(curDir).isDirectory()) {
        curDir = path.dirname(filepath);
    }

    // ask for datapack name
    let input = vscode.window.showInputBox({
        prompt: 'Enter datapack name',
        validateInput: value => {
            // check if folder already exists
            if (fs.existsSync(path.join(curDir, value))) {
                return 'This folder already exists. Please retry with a valid datapack name';
            }
        }
    });
    input.then(datapackName => {
        if (!datapackName) {
            return vscode.window.showWarningMessage(ABORT_NEW);
        }
        const dir = path.join(curDir, datapackName);

        // generate datapck folder
        fs.mkdirSync(dir);

        // ask for description
        input = vscode.window.showInputBox({
            prompt: 'Enter datapack description'
        });
        input.then(description => {
            if (!description) {
                description = '';
            }

            // generate mcmeta file
            const newFilePath = path.join(dir, "pack.mcmeta");
            const packTemplate = fs.readFileSync(path.join(Extension.rootPath, 'templates/pack.template'), 'utf8');
            fs.writeFile(newFilePath, packTemplate.replace('<description>', description), err => {
                if (err) {
                    console.error(err);
                    return vscode.window.showErrorMessage(FAILED_NEW);
                }
            });

            // ask for authors username
            input = vscode.window.showInputBox({
                prompt: 'Enter author username',
                value: vscode.workspace.getConfiguration('mc-datapack')['username'],
                validateInput: value => {
                    if (!/^\w{3,16}$/.test(value)) {
                        return `"${value}" is not a valid username`;
                    }
                }
            });
            input.then(author => {
                if (!author) {
                    return vscode.window.showWarningMessage(ABORT_STRUCTURE);
                }

                // ask for namespace
                input = vscode.window.showInputBox({
                    prompt: 'Enter namespace',
                    validateInput: value => {
                        if (!/^[\da-z_-]+$/.test(value)) {
                            return `"${value}" is not a valid namespace. Allowed characters are lowercase letters, numbers, _ and -`;
                        }
                    }
                });
                input.then(namespace => {
                    if (!namespace) {
                        return vscode.window.showWarningMessage(ABORT_STRUCTURE);
                    }
                    namespace = namespace.toLocaleLowerCase();

                    // generate main and reset functions
                    const functionsPath = path.join(dir, `data/${author.toLocaleLowerCase()}/functions/${namespace}`);
                    fs.mkdirSync(functionsPath, { recursive: true });
                    const mcfunctionTemplate = fs.readFileSync(path.join(Extension.rootPath, 'templates/mcfunction.template'), 'utf8');
                    fs.writeFile(path.join(functionsPath, "main.mcfunction"), mcfunctionTemplate.replace('<filename>', 'main')
                        .replace('<namespace>', namespace)
                        .replace('<author>', author), err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage(FAILED_NEW);
                            }
                        });
                    fs.writeFile(path.join(functionsPath, "reset.mcfunction"), mcfunctionTemplate.replace('<filename>', 'reset')
                        .replace('<namespace>', namespace)
                        .replace('<author>', author), err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage(FAILED_NEW);
                            }
                        });

                    // generate tick and load tags
                    const tagsPath = path.join(dir, 'data/minecraft/tags/functions');
                    fs.mkdirSync(tagsPath, { recursive: true });
                    const tagTemplate = fs.readFileSync(path.join(Extension.rootPath, 'templates/tag.template'), 'utf8');
                    fs.writeFile(path.join(tagsPath, "tick.json"), tagTemplate.replace('<filename>', 'main')
                        .replace('<namespace>', namespace)
                        .replace('<author>', author), err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage(FAILED_NEW);
                            }
                        });
                    fs.writeFile(path.join(tagsPath, "load.json"), tagTemplate.replace('<filename>', 'reset')
                        .replace('<namespace>', namespace)
                        .replace('<author>', author), err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage(FAILED_NEW);
                            }
                        });

                    // generate datapack advancement
                    const globalPath = path.join(dir, 'data/global/advancements');
                    fs.mkdirSync(globalPath, { recursive: true });

                    const rootTemplate = fs.readFileSync(path.join(Extension.rootPath, 'templates/root.template'), 'utf8');
                    fs.writeFile(path.join(globalPath, 'root.json'), rootTemplate, err => {
                        if (err) {
                            console.error(err);
                            return vscode.window.showErrorMessage(FAILED_NEW);
                        }
                    });
                    const datapackTemplate = fs.readFileSync(path.join(Extension.rootPath, 'templates/datapack.template'), 'utf8');
                    fs.writeFile(path.join(globalPath, `${namespace}.json`), datapackTemplate.replace('<datapack>', datapackName)
                        .replace('<author>', author)
                        .replace('<description>', description || ''), err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage(FAILED_NEW);
                            }
                        });

                    vscode.window.showInformationMessage(SUCCESS_NEW);
                });
            });
        });
    });
}