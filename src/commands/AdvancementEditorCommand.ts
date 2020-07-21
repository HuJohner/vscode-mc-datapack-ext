import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { EditorCommand } from './EditorCommand';

export class AdvancementEditorCommand extends EditorCommand {

    id = "AdvancementEditor";
    title = "Advancement Editor";
    folder = "advancements";
    jsonKeys = ["display", "icon", "item", "nbt", "title", "frame", "background", "description", "show_toast", "announce_to_chat", "hidden", "parent", "criteria", "trigger", "conditions", "requirements", "rewards", "recipes", "loot", "experience", "function"];

    onReceiveMessage(message: any): boolean {
        switch (message.command) {
            case 'openFile':
                this.openFile();
                break;
            case 'checkBackground':
                this.checkBackground(message.path);
                break;
        }

        return true;
    }

    getKeys(message: any): string[] {
        let keys = this.jsonKeys;
        if (message.json.criteria) {
            keys = this.jsonKeys.concat(Object.keys(message.json.criteria));
        }
        return keys;
    }

    private openFile() {
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

                Extension.panels.get(this.id)?.webview.postMessage(message);
            }
        });
    }

    private checkBackground(background: string) {
        let bitmap = fs.readFileSync(path.join(Extension.rootPath, background.replace('minecraft:', 'resources/minecraft/')));
        let base64 = Buffer.from(bitmap).toString('base64');

        let message = {
            command: 'changeBackground',
            file: {
                path: background.replace('minecraft:', 'assets/minecraft/'),
                base64: base64
            }
        };

        Extension.panels.get(this.id)?.webview.postMessage(message);
    }
}