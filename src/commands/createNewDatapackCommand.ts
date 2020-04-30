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
const tagTemplate =
`{
    "replace": false,
    "values": [
        "<author>:<namespace>/<filename>"
    ]
}`;
const rootTemplate =
`{
    "display": {
        "title": "Installed Datapacks",
        "description": "",
        "icon": {
            "item": "minecraft:knowledge_book"
        },
        "background": "minecraft:textures/block/gray_concrete.png",
        "show_toast": false,
        "announce_to_chat": false
    },
    "criteria": {
        "trigger": {
            "trigger": "minecraft:tick"
        }
    }
}`;
const datapackTemplate =
`{
    "display": {
        "title": "<datapack>",
        "description": "<description>",
        "icon": {
            "item": "minecraft:player_head",
            "nbt": "{SkullOwner: '<author>'}"
        },
        "show_toast": false,
        "announce_to_chat": false
    },
    "parent": "global:root",
    "criteria": {
        "trigger": {
            "trigger": "minecraft:tick"
        }
    }
}`;

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

    // ask for datapack name
    let input = vscode.window.showInputBox({
        prompt: 'Enter datapack name'
    });
    input.then(datapackName => {
        if (!datapackName) {
            return vscode.window.showErrorMessage(ABORT_NEW);
        }

        // get correct current directory
        fs.stat(filepath, (err, stats) => {
            let curDir = filepath;
            if (!stats.isDirectory()) {
                curDir = path.dirname(filepath);
            }

            // check if folder already exists
            const dir = path.join(curDir, datapackName);
            if (fs.existsSync(dir)) {
                return vscode.window.showErrorMessage('This folder already exists. Please retry with a valid datapack name');
            }

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
                fs.writeFile(newFilePath, packTemplate.replace('<description>', description), err => {
                    if (err) {
                        console.error(err);
                        return vscode.window.showErrorMessage(FAILED_NEW);
                    }
                });

                // ask for authors username
                input = vscode.window.showInputBox({
                    prompt: 'Enter author username',
                    validateInput: value => {
                        if (!/^\w{3,16}$/.test(value)) {
                            return `"${value}" is not a valid username`;
                        }
                    }
                });
                input.then(author => {
                    if (!author) {
                        return vscode.window.showErrorMessage(ABORT_STRUCTURE);
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
                            return vscode.window.showErrorMessage(ABORT_STRUCTURE);
                        }
                        namespace = namespace.toLocaleLowerCase();

                        // generate main and reset functions
                        const functionsPath = path.join(dir, `data/${author.toLocaleLowerCase()}/functions/${namespace}`);
                        fs.mkdirSync(functionsPath, { recursive: true });
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

                        fs.writeFile(path.join(globalPath, 'root.json'), rootTemplate, err => {
                            if (err) {
                                console.error(err);
                                return vscode.window.showErrorMessage(FAILED_NEW);
                            }
                        });
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
    });
}