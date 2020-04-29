import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import CreateNewDatapackCommand = require('./commands/createNewDatapackCommand');

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mc-datapack" is now active!');

	let disposable = vscode.commands.registerCommand('mc-datapack.newDatapack', CreateNewDatapackCommand.run);

	context.subscriptions.push(disposable);
}

export function deactivate() { }