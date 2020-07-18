import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import CreateNewDatapackCommand = require('./commands/createNewDatapackCommand');
import NewMcfunctionCommand = require('./commands/newMcfunctionCommand');
import OpenRecipeEditorCommand = require('./commands/openRecipeEditorCommand');
import OpenAdvancementEditorCommand = require('./commands/openAdvancementEditorCommand');
import OpenBiomeEditorCommand = require('./commands/openBiomeEditorCommand');

export let rootPath: string;
export let recipePanel: vscode.WebviewPanel | undefined;
export let advancementPanel: vscode.WebviewPanel | undefined;
export let biomePanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mc-datapack" is now active!');

	rootPath = context.extensionPath;

	let disposable = vscode.commands.registerCommand('mc-datapack.newDatapack', CreateNewDatapackCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.newMcfunction', NewMcfunctionCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.openRecipeEditor', OpenRecipeEditorCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.openAdvancementEditor', OpenAdvancementEditorCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.openBiomeEditor', OpenBiomeEditorCommand.run);

	context.subscriptions.push(disposable);
}

export function deactivate() { }