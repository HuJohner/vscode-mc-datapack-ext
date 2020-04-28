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

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mc-datapack" is now active!');

	let disposable = vscode.commands.registerCommand('mc-datapack.newDatapack', (uri: vscode.Uri) => {
		let currentPath = uri ? uri.fsPath : undefined;
		let filepath: string;
		if (!currentPath) {
			let editor = vscode.window.activeTextEditor;
			if (editor) {
				currentPath = editor.document.fileName;
			}
	
			if (!currentPath) {
				const workspaceFolders = vscode.workspace.workspaceFolders;
				if (workspaceFolders) {
					currentPath = workspaceFolders[0].uri.toString(true).replace('file:///', '');
				}
			}
	
			if (!currentPath) {
				vscode.window.showErrorMessage('Right clicked on empty context');
				return;
			}
		}
	
		filepath = currentPath;
		let input = vscode.window.showInputBox({
			prompt: 'Enter datapack name'
		});
		input.then(datapackName => {
			if (!datapackName) {
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
					const newFilePath = path.join(dir, "pack.mcmeta");
					if (!description) {
						description = '';
					}
					let packMcMeta = packTemplate.replace('<description>', description);
				
					fs.writeFile(newFilePath, packMcMeta, err => {
						if (err) {
							console.error(err);
							return vscode.window.showErrorMessage("Failed to create MC datapack");
						}
					});
				
					fs.mkdirSync(path.join(dir, 'data'));
					vscode.window.showInformationMessage("Created MC datapack");
				});
			});
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }