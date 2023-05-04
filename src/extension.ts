import * as vscode from 'vscode';
import { ReservedId } from './mark';
import * as cmds from './cmds';
import { MarkContext } from './markcontext';


export function activate(context: vscode.ExtensionContext) {
	var markContext = new MarkContext();

	markContext.markManager.registerReservedId({ key: ReservedId.last, description: 'Last cursor position (before a Mark Goto)' });


	let cmdSetMark = vscode.commands.registerCommand('marker-jumper.setMark', () => { cmds.setMark(markContext); });
	let cmdGoToMark = vscode.commands.registerCommand('marker-jumper.gotoMark', () => { cmds.goToMark(markContext); });
	let cmdRemoveMark = vscode.commands.registerCommand('marker-jumper.removeMark', () => { cmds.removeMark(markContext); });
	let cmdClearMarks = vscode.commands.registerCommand('marker-jumper.clearMarks', () => { cmds.clearMarks(markContext); });

	context.subscriptions.push(cmdSetMark);
	context.subscriptions.push(cmdGoToMark);
	context.subscriptions.push(cmdRemoveMark);
	context.subscriptions.push(cmdClearMarks);
}

// This method is called when your extension is deactivated
export function deactivate() { }