import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');

const jsonKeys = [""];

let fileUri: vscode.Uri;
let doc: vscode.TextDocument;
let previousVisible = false;

export function run(uri: vscode.Uri) {
    fileUri = uri;
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        doc = editor.document;
    }

    if (Extension.biomePanel) {
        if (!Extension.biomePanel.visible) {
            Extension.biomePanel.reveal();
        }

        update(doc);
    } else {
        Extension.biomePanel = vscode.window.createWebviewPanel('biomeEditor', 'Biome Editor', vscode.ViewColumn.Beside, {
            localResourceRoots: [],
            enableScripts: true
        });

        let content = fs.readFileSync(path.join(Extension.rootPath, 'resources', 'BiomeEditor.html'), 'utf8');
        Extension.biomePanel.webview.html = content;

        // update on visible
        let changeState = Extension.biomePanel.onDidChangeViewState(e => {
            if (e.webviewPanel.visible && !previousVisible) {
                update(doc);
            }

            previousVisible = e.webviewPanel.visible;
        });

        // update view when document changes
        let changeDoc = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.contentChanges.length > 0 && e.document.fileName === fileUri.fsPath) {
                update(e.document);
            }
        });

        // update view when active document changes
        let changeEditor = vscode.window.onDidChangeActiveTextEditor(e => {
            let document = e?.document;
            if (document && document.fileName.includes('worldgen/biome') && document.fileName.endsWith('.json')) {
                fileUri = vscode.Uri.file(document.fileName);
                update(document);
            }
        });

        // Reset when the current panel is closed
        Extension.biomePanel.onDidDispose(e => {
            changeState.dispose();
            changeDoc.dispose();
            changeEditor.dispose();
            Extension.biomePanel = undefined;
            previousVisible = false;
        });

        // Handle messages from the webview
        Extension.biomePanel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'update':
                    let keys = jsonKeys;
                    if (message.json.criteria) {
                        keys = jsonKeys.concat(Object.keys(message.json.criteria));
                    }
                    let stringify = JSON.stringify(message.json, keys, 4);
                    if (doc.getText() !== stringify) {
                        replace(doc.getText(), stringify);
                    }
            }
        });
    }
}

function update(document: vscode.TextDocument) {
    doc = document;

    let text = doc.getText();
    let message = {
        command: 'update',
        document: JSON.parse(text !== '' ? text : '{}'),
        rootPath: Extension.rootPath
    };

    Extension.biomePanel?.webview.postMessage(message);
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