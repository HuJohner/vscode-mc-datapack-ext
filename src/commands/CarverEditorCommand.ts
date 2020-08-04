import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { ConfigurableEditorCommand } from './ConfigurableEditorCommand';

export class CarverEditorCommand extends ConfigurableEditorCommand {

    id = "CarverEditor";
    title = "Carver Editor";
    folder = "worldgen/configured_carver";
    jsonKeys: string[] = [];
}