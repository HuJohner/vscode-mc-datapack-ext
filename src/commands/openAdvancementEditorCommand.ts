import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');

const jsonKeys = ["display", "icon", "item", "nbt", "title", "frame", "background", "description", "show_toast", "announce_to_chat", "hidden", "parent", "criteria", "trigger", "conditions", "requirements", "rewards", "recipes", "loot", "experience", "function"];

let fileUri: vscode.Uri;
let doc: vscode.TextDocument;
let previousVisible = false;

export function run(uri: vscode.Uri) {
    fileUri = uri;
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        doc = editor.document;
    }

    if (Extension.advancementPanel) {
        if (!Extension.advancementPanel.visible) {
            Extension.advancementPanel.reveal();
        }

        update(doc);
    } else {
        Extension.advancementPanel = vscode.window.createWebviewPanel('advancementEditor', 'Advancement Editor', vscode.ViewColumn.Beside, {
            localResourceRoots: [],
            enableScripts: true
        });

        let content = fs.readFileSync(path.join(Extension.rootPath, 'resources', 'AdvancementEditor.html'), 'utf8');
        Extension.advancementPanel.webview.html = content;

        // update on visible
        let changeState = Extension.advancementPanel.onDidChangeViewState(e => {
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
            if (document && document.fileName.includes('advancements') && document.fileName.endsWith('.json')) {
                fileUri = vscode.Uri.file(document.fileName);
                update(document);
            }
        });

        // Reset when the current panel is closed
        Extension.advancementPanel.onDidDispose(e => {
            changeState.dispose();
            changeDoc.dispose();
            changeEditor.dispose();
            Extension.advancementPanel = undefined;
            previousVisible = false;
        });

        // Handle messages from the webview
        Extension.advancementPanel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'openFile':
                    openFile();
                    break;
                case 'checkBackground':
                    checkBackground(message.path);
                    break;
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

function openFile() {
    // open file
    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Open',
        filters: {
            'Images': ['png'],
            'All files': ['*']
        }
    };

    vscode.window.showOpenDialog(options).then(fileUri => {
        if (fileUri && fileUri[0]) {
            let bitmap = fs.readFileSync(fileUri[0].fsPath);
            let base64 = Buffer.from(bitmap).toString('base64');

            let message = {
                command: 'changeBackground',
                file: {
                    path: fileUri[0].fsPath,
                    base64: base64
                }
            };

            Extension.advancementPanel?.webview.postMessage(message);
        }
    });
}

function checkBackground(background: string) {
    let bitmap = fs.readFileSync(path.join(Extension.rootPath, background.replace('minecraft:', 'resources/minecraft/')));
    let base64 = Buffer.from(bitmap).toString('base64');

    let message = {
        command: 'changeBackground',
        file: {
            path: background.replace('minecraft:', 'assets/minecraft/'),
            base64: base64
        }
    };

    Extension.advancementPanel?.webview.postMessage(message);
}

function update(document: vscode.TextDocument) {
    doc = document;

    let text = doc.getText();
    let message = {
        command: 'update',
        document: JSON.parse(text !== '' ? text : '{}'),
        rootPath: Extension.rootPath
    };

    Extension.advancementPanel?.webview.postMessage(message);
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