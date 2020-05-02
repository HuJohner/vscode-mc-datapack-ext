import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');

export function run(uri: vscode.Uri) {
    const author = vscode.workspace.getConfiguration('mc-datapack')['username'];

    // get current path
    if (uri === undefined) {
        return vscode.window.showErrorMessage('No current path available');
    }
    let fsPath = uri.fsPath;

    // get correct current directory
    let curDir = fsPath;
    if (!fs.statSync(curDir).isDirectory()) {
        curDir = path.dirname(fsPath);
    }

    // ask for file name
    let input = vscode.window.showInputBox({
        prompt: 'Enter file name',
        validateInput: value => {
            // check if file already exists
            if (fs.existsSync(path.join(curDir, `${value.replace('.mcfunction', '')}.mcfunction`))) {
                return 'This file already exists. Please retry with a valid file name';
            }
        }
    });
    input.then(fileName => {
        if (!fileName) {
            return vscode.window.showWarningMessage('Aborted mcfunction file creation');
        }
        const fileNameWithExt = `${fileName.replace('.mcfunction', '')}.mcfunction`;

        // generate mcfunction file
        const filePath = path.join(curDir, fileNameWithExt);

        const mcfunctionTemplate = fs.readFileSync(path.join(Extension.templatesPath, 'mcfunction.template'), 'utf8');
        fs.writeFile(filePath, mcfunctionTemplate.replace('<filename>', fileName)
            .replace('<namespace>', 'TODO')
            .replace('<author>', author), err => {
                if (err) {
                    console.error(err);
                    return vscode.window.showErrorMessage('Failed to create mcfunction file');
                }
            });

        vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {
                const lastPos = doc.positionAt(doc.getText().length);
                editor.selections = [new vscode.Selection(lastPos, lastPos)];
            });
        });
    });
}