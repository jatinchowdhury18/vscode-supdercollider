const vscode = require('vscode');
const path = require('path');

let _activeTerminal = null;
vscode.window.onDidCloseTerminal((terminal) => {
    if (terminal.name === 'SuperCollider') {
        if (!terminal.tckDisposed) {
            disposeTerminal();
        }
    }
});
function createTerminal() {
    _activeTerminal = vscode.window.createTerminal('SuperCollider');
    return _activeTerminal;
}
function disposeTerminal() {
    _activeTerminal.tckDisposed = true;
    _activeTerminal.dispose();
    _activeTerminal = null;
}
function getTerminal() {
    if (!_activeTerminal) {
        createTerminal();
    }

    return _activeTerminal;
}
// END TERMINAL

function resolve(editor, command, scPath) {
    return command
        .replace(/\${file}/g, `${editor.document.fileName}`)
        .replace(/\${scPath}/g, scPath)
}

function run(command) {
    const terminal = getTerminal();

    terminal.show(true);

    vscode.commands.executeCommand('workbench.action.terminal.scrollToBottom')
    terminal.sendText(command, true)
}

function warn(msg) {
    console.log('supercollider.execInTerminal: ', msg)
}

function handleInput(editor) {
    vscode.workspace.saveAll(false);
    const scPath = "C:/Program Files/SuperCollider-3.9.3/sclang.exe";
    let command = "& \"${scPath}\" ${file}";
    const cmd = resolve(
        editor,
        command,
        scPath
    )

    run(cmd);
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('supercollider.execInTerminal', () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            warn('no active editor');
            return;
        }

        handleInput(editor)
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
    disposeTerminal();
}
exports.deactivate = deactivate;