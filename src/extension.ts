import { BlobOptions } from 'buffer';
import * as vscode from 'vscode';
import { Mark, MarkQuickPickItem } from './mark';
import { getMarkerQuickItems, gotoDocPos, messageError, messageInformation, positionToLine } from './utils';

const setMarkInputRegex = /^(\d+)(?:\s(.+))?$/;
const markers: Map<string, Mark> = new Map<string, Mark>;
const BACKPOS_ID = 'l';

export function activate(context: vscode.ExtensionContext) {

	let cmdSetMark = vscode.commands.registerCommand('marker-jumper.setMark', async () => {
		// Getting active text editor information
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			messageError('No Active Editor'); // DEBUG
			return;
		}

		let document = activeEditor.document;
		let cursorPos = activeEditor.selection.active;

		// Getting user input
		let input: string | undefined = await vscode.window.showInputBox({ 'title': 'Set Mark', 'prompt': `Marker At: ${positionToLine(cursorPos)}` });
		if (!input) return;

		let match = input.match(setMarkInputRegex);
		if (!match || !match[1]) {
			messageError('Invalid identifier.\nExample: `1` or `20 with a description`');
			return;
		}

		// Saving Marker
		let id: string = match[1];
		let description: string | undefined = match[2];
		let marker: Mark = Mark.createFromCurrentPos(description) || new Mark(document, cursorPos, description);
		markers.set(id, marker);
	});

	let cmdGoToMark = vscode.commands.registerCommand('marker-jumper.gotoMark', async () => {
		// Receiving user inpug
		let items = getMarkerQuickItems(markers);
		let input: MarkQuickPickItem | undefined = await vscode.window.showQuickPick(items, { canPickMany: false, matchOnDescription: true, title: 'GoTo Mark' }) as MarkQuickPickItem;
		if (!input) return;

		// Getting the marker
		let id: string = input.id;
		let marker = markers.get(id);
		if (!marker) {
			messageError('Marker not found');
			return;
		}

		// Saving Last Position
		let backMark: Mark | undefined = Mark.createFromCurrentPos('Last Position');
		if (backMark) {
			markers.set(BACKPOS_ID, backMark);
		}

		// Go To document and line
		let success = await gotoDocPos(marker.document, marker.position);
		if (!success) {
			messageError('File vanished?');
			return;
		}
	});

	let cmdRemoveMark = vscode.commands.registerCommand('marker-jumper.removeMark', async () => {
		// Receiving user inpug
		let items = getMarkerQuickItems(markers);
		let input: MarkQuickPickItem | undefined = await vscode.window.showQuickPick(items, { canPickMany: false, matchOnDescription: true, title: 'GoTo Mark' }) as MarkQuickPickItem;
		if (!input) return;

		// Getting the marker
		let id: string = input.id;
		markers.delete(id);
	});

	let cmdClearMarks = vscode.commands.registerCommand('marker-jumper.removeMark', async () => {
		markers.clear();
		messageInformation('All Markers Removed');
	});

	context.subscriptions.push(cmdSetMark);
	context.subscriptions.push(cmdGoToMark);
	context.subscriptions.push(cmdRemoveMark);
	context.subscriptions.push(cmdClearMarks);
}

// This method is called when your extension is deactivated
export function deactivate() { }
