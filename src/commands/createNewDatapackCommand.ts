import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const packTemplate =
`{
	"pack": {
		"pack_format": 5,
		"description": "<description>"
	}
}`;

const mcfunctionTemplate =
`##
 # <filename>.mcfunction
 # <namespace>
 #
 # Created by <author>.
##
`;

const jsonTemplate =
`{
    "replace": false,
    "values": [
        "<author>:<namespace>/<filename>"
    ]
}`;

export function run(uri: vscode.Uri) {
    if (!uri) {
        vscode.window.showErrorMessage('No current path available');
        return;
    }
    let filepath = uri.fsPath;

    let input = vscode.window.showInputBox({
        prompt: 'Enter datapack name'
    });
    input.then(datapackName => {
        if (!datapackName) {
            // TODO catch invalid names
            vscode.window.showErrorMessage('Please retry with a valid datapack name');
            return;
        }

        fs.stat(filepath, (err, stats) => {
            let curDir = filepath;
            if (!stats.isDirectory()) {
                curDir = path.dirname(filepath);
            }

            const dir = path.join(curDir, datapackName);
            if (fs.existsSync(dir)) {
                vscode.window.showErrorMessage('This folder already exists. Please retry with a valid datapack name');
                return;
            }

            fs.mkdirSync(dir);

            input = vscode.window.showInputBox({
                prompt: 'Enter datapack description'
            });
            input.then(description => {
                if (!description) {
                    description = '';
                }

                const newFilePath = path.join(dir, "pack.mcmeta");

                fs.writeFile(newFilePath, packTemplate.replace('<description>', description), err => {
                    if (err) {
                        console.error(err);
                        return vscode.window.showErrorMessage("Failed to create MC datapack");
                    }
                });

                input = vscode.window.showInputBox({
                    prompt: 'Enter author name'
                });
                input.then(author => {
                    if (!author) {
                        // TODO catch invalid names
                        vscode.window.showErrorMessage('Please retry with a valid name');
                        return;
                    }

                    input = vscode.window.showInputBox({
                        prompt: 'Enter namespace'
                    });
                    input.then(namespace => {
                        if (!namespace) {
                            // TODO catch invalid names
                            vscode.window.showErrorMessage('Please retry with a valid namespace');
                            return;
                        }
                        namespace = namespace.toLocaleLowerCase();

                        let functionsPath = dir;
                        fs.mkdirSync(functionsPath = path.join(functionsPath, 'data'));
                        fs.mkdirSync(functionsPath = path.join(functionsPath, author.toLocaleLowerCase()));
                        fs.mkdirSync(functionsPath = path.join(functionsPath, 'functions'));
                        fs.mkdirSync(functionsPath = path.join(functionsPath, namespace));
                        fs.writeFile(path.join(functionsPath, "main.mcfunction"), mcfunctionTemplate.replace('<filename>', 'main')
                            .replace('<namespace>', namespace)
                            .replace('<author>', author), err => {
                                if (err) {
                                    console.error(err);
                                    return vscode.window.showErrorMessage("Failed to create MC datapack");
                                }
                            });
                        fs.writeFile(path.join(functionsPath, "reset.mcfunction"), mcfunctionTemplate.replace('<filename>', 'reset')
                        .replace('<namespace>', namespace)
                        .replace('<author>', author), err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage("Failed to create MC datapack");
                            }
                        });

                        let tagsPath = path.join(dir, 'data');
                        fs.mkdirSync(tagsPath = path.join(tagsPath, 'minecraft'));
                        fs.mkdirSync(tagsPath = path.join(tagsPath, 'tags'));
                        fs.mkdirSync(tagsPath = path.join(tagsPath, 'functions'));
                        fs.writeFile(path.join(tagsPath, "tick.json"), jsonTemplate.replace('<filename>', 'main')
                            .replace('<namespace>', namespace)
                            .replace('<author>', author), err => {
                                if (err) {
                                    console.error(err);
                                    return vscode.window.showErrorMessage("Failed to create MC datapack");
                                }
                            });
                        fs.writeFile(path.join(tagsPath, "load.json"), jsonTemplate.replace('<filename>', 'reset')
                        .replace('<namespace>', namespace)
                        .replace('<author>', author), err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage("Failed to create MC datapack");
                            }
                        });

                        vscode.window.showInformationMessage("Created MC datapack");
                    });
                });
            });
        });
    });
}