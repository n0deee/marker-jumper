import * as vscode from 'vscode';
import { ReservedId } from './mark';
import * as cmds from './cmds';
import { MarkerJumperContext } from './markerjumpercontext';


export function activate(context: vscode.ExtensionContext) {
	var markContext = new MarkerJumperContext();

	markContext.markManager.registerReservedId({ id: ReservedId.last, description: 'Last cursor position (before a Mark Goto)' });

	let cmdSetMark = vscode.commands.registerCommand('marker-jumper.setMark', async () => { await cmds.setMark(markContext); });
	let cmdGoToMark = vscode.commands.registerCommand('marker-jumper.gotoMark', async () => { await cmds.goToMark(markContext); });
	let cmdRemoveMark = vscode.commands.registerCommand('marker-jumper.removeMark', async () => { await cmds.removeMark(markContext); });
	let cmdClearMarks = vscode.commands.registerCommand('marker-jumper.clearMarks', async () => { await cmds.clearMarks(markContext); });
	let cmdGoToLastUsedMark = vscode.commands.registerCommand('marker-jumper.gotoLastUsedMark', async () => { await cmds.goToLastUsedMark(markContext); });

	context.subscriptions.push(cmdSetMark);
	context.subscriptions.push(cmdGoToMark);
	context.subscriptions.push(cmdRemoveMark);
	context.subscriptions.push(cmdClearMarks);
	context.subscriptions.push(cmdGoToLastUsedMark);
}

export function deactivate() { }