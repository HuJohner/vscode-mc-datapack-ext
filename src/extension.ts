import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import CreateNewDatapackCommand = require('./commands/createNewDatapackCommand');
import NewMcfunctionCommand = require('./commands/newMcfunctionCommand');

export let templatesPath: string;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mc-datapack" is now active!');

	templatesPath = context.asAbsolutePath('templates');

	let disposable = vscode.commands.registerCommand('mc-datapack.newDatapack', CreateNewDatapackCommand.run);

	disposable = vscode.commands.registerCommand('mc-datapack.newMcfunction', NewMcfunctionCommand.run);

	context.subscriptions.push(disposable);
}

export function deactivate() { }