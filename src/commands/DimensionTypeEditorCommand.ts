import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { ConfigurableEditorCommand } from './ConfigurableEditorCommand';

export class DimensionTypeEditorCommand extends ConfigurableEditorCommand {

    id = "DimensionTypeEditor";
    title = "Dimension Type Editor";
    folder = "dimension_type/";
    jsonKeys: string[] = [];
}