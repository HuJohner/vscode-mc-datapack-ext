import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');

export abstract class EditorCommand {

    abstract id: string;
    abstract title: string;
    abstract folder: string;
    abstract jsonKeys: string[];

    private fileUri: vscode.Uri | undefined;
    private doc: vscode.TextDocument | undefined;
    private previousVisible = false;

    public run(uri: vscode.Uri) {
        this.fileUri = uri;
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            this.doc = editor.document;
        }

        if (Extension.panels.has(this.id)) {
            if (!Extension.panels.get(this.id)!.visible) {
                Extension.panels.get(this.id)!.reveal();
            }

            this.update(this.doc!);
        } else {
            let panel = vscode.window.createWebviewPanel(this.id, this.title, vscode.ViewColumn.Beside, {
                localResourceRoots: [],
                enableScripts: true
            });

            let content = fs.readFileSync(path.join(Extension.rootPath, 'resources', this.id + '.html'), 'utf8');
            panel.webview.html = content;

            // update on visible
            let changeState = panel.onDidChangeViewState(e => {
                if (e.webviewPanel.visible && !this.previousVisible) {
                    this.update(this.doc!);
                }

                this.previousVisible = e.webviewPanel.visible;
            });

            // update view when document changes
            let changeDoc = vscode.workspace.onDidChangeTextDocument(e => {
                if (e.contentChanges.length > 0 && e.document.fileName === this.fileUri!.fsPath) {
                    this.update(e.document);
                }
            });

            // update view when active document changes
            let changeEditor = vscode.window.onDidChangeActiveTextEditor(e => {
                let document = e?.document;
                if (document && document.fileName.includes(this.folder) && document.fileName.endsWith('.json')) {
                    this.fileUri = vscode.Uri.file(document.fileName);
                    this.update(document);
                }
            });

            // Reset when the current panel is closed
            panel.onDidDispose(e => {
                changeState.dispose();
                changeDoc.dispose();
                changeEditor.dispose();
                Extension.panels.delete(this.id);
                this.previousVisible = false;
            });

            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'update':
                        let keys = this.getKeys(message);
                        let stringify = JSON.stringify(message.json, keys, 4);
                        if (this.isValidJson(this.doc!.getText()) && this.doc!.getText().replace(/\s*/g, '') !== stringify.replace(/\s*/g, '')) {
                            this.replace(this.doc!.getText(), stringify);
                        }
                }

                this.onReceiveMessage(message);
            });

            Extension.panels.set(this.id, panel);
        }
    }

    abstract onReceiveMessage(message: any): boolean;

    abstract getKeys(message: any): string[];

    private update(document: vscode.TextDocument) {
        this.doc = document;

        let text = this.doc.getText();
        let message = {
            command: 'update',
            document: JSON.parse(text !== '' ? text : '{}'),
            rootPath: Extension.rootPath
        };

        Extension.panels.get(this.id)?.webview.postMessage(message);
    }

    private replace(searchValue: string, replaceValue: string) {
        let start = this.doc!.getText().indexOf(searchValue);
        let end = start + searchValue.length;

        let edit = new vscode.WorkspaceEdit();
        let from = this.doc!.positionAt(start);
        let to = this.doc!.positionAt(end);
        edit.replace(this.fileUri!, new vscode.Range(from, to), replaceValue);

        vscode.workspace.applyEdit(edit);
    }

    private isValidJson(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
}