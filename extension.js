// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var util = require('util');
var fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "format-all-files" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.formatAll', function () {
        // The code you place here will be executed every time your command is executed


        if (!!arguments && arguments.length > 0 && !!arguments[0].path) {
            var selectedFolder = arguments[0].path;
            if (fs.existsSync(selectedFolder) && fs.lstatSync(selectedFolder).isDirectory()) {

                var pattern = util.format('**%s/**/*.cs', selectedFolder.replace(vscode.workspace.rootPath, ''));
                var files = vscode.workspace.findFiles(pattern);

                files.then((value) => {
                    // vscode.window.showInformationMessage('Files selected: ' + value.length);

                    vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'formating' }, p => {
                        return new Promise((resolve, reject) => {

                            openAndFormat(value, 0, p, resolve);

                            // p.report({ message: 'Start working...' });
                            // let count = 0;
                            // let handle = setInterval(() => {
                            //     count++;
                            //     p.report({ message: 'Worked ' + count + ' steps' });
                            //     if (count >= 10) {
                            //         clearInterval(handle);
                            //         resolve();
                            //     }
                            // }, resolve);
                        });
                    });

                }, (reason) => {
                    console.log("findFiles: " + reason);
                });
            }
        }
        else {
            console.log("Selected is not a folder.");
        }
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function openAndFormat(files, index, p, resolve) {

    if (files.length <= index) {
        resolve();
        return;
    }

    var path = files[index].path.replace(vscode.workspace.rootPath, '');
    p.report({ message: `formating: ${path}` });

    console.log("format file:" + files[index].path);
    vscode.workspace.openTextDocument(files[index].path).then(doc => {
        vscode.window.showTextDocument(doc).then(() => {

            vscode.commands.executeCommand('csharpfixformat.process').then(() => {
                openAndFormat(files, index + 1, p, resolve);
            }, (reason) => {
                console.error("executeCommand failed: ", reason);
                vscode.window.showWarningMessage(path + `, Format failed: ${reason}. You can close all documents then try agagin.`)
            });
        });
    });
}
