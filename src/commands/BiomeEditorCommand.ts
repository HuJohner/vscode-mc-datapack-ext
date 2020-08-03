import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { ConfigurableEditorCommand } from './ConfigurableEditorCommand';

export class BiomeEditorCommand extends ConfigurableEditorCommand {

    id = "BiomeEditor";
    title = "Biome Editor";
    folder = "worldgen/biome";
    jsonKeys: string[] = [];
}