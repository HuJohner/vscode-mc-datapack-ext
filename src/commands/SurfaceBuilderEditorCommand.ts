import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { ConfigurableEditorCommand } from './ConfigurableEditorCommand';

export class SurfaceBuilderEditorCommand extends ConfigurableEditorCommand {

    id = "SurfaceBuilderEditor";
    title = "Surface Builder Editor";
    folder = "worldgen/configured_surface_builder";
    jsonKeys: string[] = [];
}