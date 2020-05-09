import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');

const jsonKeys = ["type", "pattern", "ingredients", "ingredient", "key", "result", "experience", "cookingtime", "item", "count", "group"];

let fileUri: vscode.Uri;
let doc: vscode.TextDocument;
let previousVisible = false;

export function run(uri: vscode.Uri) {
    fileUri = uri;
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        doc = editor.document;
    }

    if (Extension.currentPanel) {
        if (!Extension.currentPanel.visible) {
            Extension.currentPanel.reveal();
        }

        update(doc);
    } else {
        Extension.currentPanel = vscode.window.createWebviewPanel('recipeEditor', 'Recipe Editor', vscode.ViewColumn.Beside, {
            localResourceRoots: [],
            enableScripts: true
        });

        let content = fs.readFileSync(path.join(Extension.rootPath, 'resources', 'RecipeEditor.html'), 'utf8');
        Extension.currentPanel.webview.html = content;

        // update on visible
        let changeState = Extension.currentPanel.onDidChangeViewState(e => {
            if (e.webviewPanel.visible && !previousVisible) {
                update(doc);
            }

            previousVisible = e.webviewPanel.visible;
        });

        // update view when document changes
        let changeDoc = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.fileName === fileUri.fsPath) {
                update(e.document);
            }
        });

        // update view when active document changes
        let changeEditor = vscode.window.onDidChangeActiveTextEditor(e => {
            let document = e?.document;
            if (document && document.fileName.includes('recipes') && document.fileName.endsWith('.json')) {
                fileUri = vscode.Uri.file(document.fileName);
                update(document);
            }
        });

        // Reset when the current panel is closed
        Extension.currentPanel.onDidDispose(e => {
            changeState.dispose();
            changeDoc.dispose();
            changeEditor.dispose();
            Extension.currentPanel = undefined;
            previousVisible = false;
        });

        // Handle messages from the webview
        Extension.currentPanel.webview.onDidReceiveMessage(message => {
            let keys = jsonKeys;
            if (message.json.key) {
                keys = jsonKeys.concat(Object.keys(message.json.key));
            }
            replace(doc.getText(), JSON.stringify(message.json, keys, 4));
        });
    }
}

function update(document: vscode.TextDocument) {
    if (!Extension.currentPanel) {
        return;
    }
    doc = document;

    let text = doc.getText();
    let json = JSON.parse(text !== '' ? text : '{}');

    Extension.currentPanel.webview.postMessage(json);
}

function replace(searchValue: string, replaceValue: string) {
    let start = doc.getText().indexOf(searchValue);
    let end = start + searchValue.length;

    let edit = new vscode.WorkspaceEdit();
    let from = doc.positionAt(start);
    let to = doc.positionAt(end);
    edit.replace(fileUri, new vscode.Range(from, to), replaceValue);

    vscode.workspace.applyEdit(edit);
}