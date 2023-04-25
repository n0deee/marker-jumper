import * as vscode from 'vscode';
import { Mark, MarkQuickPickItem } from './mark';
import * as cmds from './cmds';
import * as util from './utils';


export function activate(context: vscode.ExtensionContext) {
	let cmdSetMark = vscode.commands.registerCommand('marker-jumper.setMark', cmds.setMark);
	let cmdGoToMark = vscode.commands.registerCommand('marker-jumper.gotoMark', cmds.goToMark);
	let cmdRemoveMark = vscode.commands.registerCommand('marker-jumper.removeMark', cmds.removeMark);
	let cmdClearMarks = vscode.commands.registerCommand('marker-jumper.clearMarks', cmds.clearMarks);

	context.subscriptions.push(cmdSetMark);
	context.subscriptions.push(cmdGoToMark);
	context.subscriptions.push(cmdRemoveMark);
	context.subscriptions.push(cmdClearMarks);
}

// This method is called when your extension is deactivated
export function deactivate() { }