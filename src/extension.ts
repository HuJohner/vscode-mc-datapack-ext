import * as vscode from 'vscode';

import CreateNewDatapackCommand = require('./commands/createNewDatapackCommand');
import NewMcfunctionCommand = require('./commands/newMcfunctionCommand');
import { RecipeEditorCommand } from './commands/RecipeEditorCommand';
import { AdvancementEditorCommand } from './commands/AdvancementEditorCommand';
import { BiomeEditorCommand } from './commands/BiomeEditorCommand';

export let rootPath: string;
export let panels = new Map<String, vscode.WebviewPanel>();

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mc-datapack" is now active!');

	rootPath = context.extensionPath;

	let disposable = vscode.commands.registerCommand('mc-datapack.newDatapack', CreateNewDatapackCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.newMcfunction', NewMcfunctionCommand.run);
	disposable = vscode.commands.registerCommand('mc-datapack.openRecipeEditor', (uri) => { new RecipeEditorCommand().run(uri); });
	disposable = vscode.commands.registerCommand('mc-datapack.openAdvancementEditor', (uri) => { new AdvancementEditorCommand().run(uri); });
	disposable = vscode.commands.registerCommand('mc-datapack.openBiomeEditor', (uri) => { new BiomeEditorCommand().run(uri); });

	context.subscriptions.push(disposable);
}

export function deactivate() { }