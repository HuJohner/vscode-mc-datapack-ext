import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { EditorCommand } from './EditorCommand';

export class BiomeEditorCommand extends EditorCommand {

    id = "BiomeEditor";
    title = "Biome Editor";
    folder = "worldgen/biome";
    jsonKeys = [""];

    onReceiveMessage(message: any): boolean {
        switch (message.command) {
            case "init":
                this.sendConfig();
        }
        return true;
    }

    getKeys(message: any): string[] {
        let keys = this.jsonKeys;
        return keys;
    }

    private sendConfig() {
        let text = fs.readFileSync(path.join(Extension.rootPath, 'resources/html_configs', 'biome.json'), 'utf8');
        let message = {
            command: 'init',
            config: JSON.parse(text !== '' ? text : '{}')
        };

        Extension.panels.get(this.id)?.webview.postMessage(message);
    }
}