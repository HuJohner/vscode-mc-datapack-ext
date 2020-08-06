import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { EditorCommand } from './EditorCommand';

export abstract class ConfigurableEditorCommand extends EditorCommand {

    private config: any;

    getHtmlContent(): string {
        let content = fs.readFileSync(path.join(Extension.rootPath, 'resources', 'ConfigurableEditor.html'), 'utf8');
        content = content.replace('{title}', this.title);
        content = content.replace('/*{stylesheet}*/', fs.readFileSync(path.join(Extension.rootPath, 'resources', 'stylesheet.css'), 'utf8'));
        return content.replace('/*{configurable_script}*/', fs.readFileSync(path.join(Extension.rootPath, 'resources', 'configurable.js'), 'utf8'));
    }

    onReceiveMessage(message: any): boolean {
        switch (message.command) {
            case "init":
                this.sendConfig();
        }
        return true;
    }

    getKeys(message: any): string[] {
        let keys = this.jsonKeys;

        this.getKeysFromJson(keys, this.config, message.json);
        // remove emtpys

        return keys;
    }

    private sendConfig() {
        let text = fs.readFileSync(path.join(Extension.rootPath, 'resources/html_configs', this.id + '.json'), 'utf8');
        this.config = JSON.parse(text !== '' ? text : '{}');
        let message = {
            command: 'init',
            config: this.config
        };

        Extension.panels.get(this.id)?.webview.postMessage(message);
    }

    private getKeysFromJson(keys: string[], json: any, doc: any) {
        for (let key in json) {
            keys.push(key);

            let docObj: any = {};
            if (doc) {
                docObj = doc[key];
            }
            if (json[key].type === 'Group') {
                if (json[key].children_type === 'children') {
                    this.getKeysFromJson(keys, json[key].children, docObj);
                } else if (json[key].children_type === 'item' && docObj) {
                    for (let i of Object.keys(docObj)) {
                        keys.push(i);
                    }
                    this.getKeysFromJson(keys, { '': json[key].item }, docObj);
                }
            } else if (json[key].type === 'List') {
                if (json[key].children_type === 'item') {
                    this.getKeysFromJson(keys, { '': json[key].item }, docObj);
                } else if (json[key].children_type === 'children') {
                    for (let i in json[key].children) {
                        this.getKeysFromJson(keys, { '': json[key].children[i] }, docObj[i]);
                    }
                }
            }
        }
    }
}