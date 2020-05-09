import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import CreateNewDatapackCommand = require('./commands/createNewDatapackCommand');
import NewMcfunctionCommand = require('./commands/newMcfunctionCommand');
import OpenRecipeEditorCommand = require('./commands/openRecipeEditorCommand');

export let rootPath: string;
export let currentPanel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mc-datapack" is now active!');

	rootPath = context.extensionPath;

	let disposable = vscode.commands.registerCommand('mc-datapack.newDatapack', CreateNewDatapackCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.newMcfunction', NewMcfunctionCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.openRecipeEditor', OpenRecipeEditorCommand.run);

	context.subscriptions.push(disposable);
}

export function deactivate() { }