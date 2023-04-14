import * as vscode from 'vscode';

class Mark {
	public document: vscode.TextDocument;
	public position: vscode.Position;
	public description?: String;

	public constructor(document: vscode.TextDocument, position: vscode.Position, description?: String) {
		this.document = document;
		this.position = position;
		this.description = description;
	}

	static createFromCurrentPos(description?: String): Mark | undefined {
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) return undefined;
	
		let document = activeEditor.document;
		let cursorPos = activeEditor.selection.active;
		return new Mark(document, cursorPos, description);
	}
}

const setMarkInputRegex = /^(\d+)(?:\s(.+))?$/;
const getMarkInputRegex = /^(\d+)$/;
const markers: Map<String, Mark> = new Map<String, Mark>;
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
		let input: String | undefined = await vscode.window.showInputBox({ 'title': 'Set Mark', 'prompt': `Marker At: ${positionToLine(cursorPos)}` });
		if (!input) return;

		let match = input.match(setMarkInputRegex);
		if (!match || !match[1]) {
			messageError('Invalid identifier.\nExample: `1` or `20 with a description`');
			return;
		}

		// Saving Marker
		let id: String = match[1];
		let description: String | undefined = match[2];
		let marker: Mark = Mark.createFromCurrentPos(description) || new Mark(document, cursorPos, description);
		markers.set(id, marker);
	});

	let cmdGoToMark = vscode.commands.registerCommand('marker-jumper.gotoMark', async () => {
		// Receiving user inpug
		let input: String | undefined = await vscode.window.showInputBox({ 'title': 'GoTo Mark', 'prompt': '' });
		if (!input) return;

		let match = input.match(setMarkInputRegex);
		if (!match || !match[1]) {
			messageError('Invalid identifier.\nExample: `1`');
			return;
		}

		// Getting the marker
		let id: String = match[1];
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
		let success = gotoDocPos(marker.document, marker.position);
		if (!success) {
			messageError('File vanished');
			return;
		}
	});

	context.subscriptions.push(cmdSetMark);
	context.subscriptions.push(cmdGoToMark);
}

function gotoPos(pos: vscode.Position): boolean {
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return false;
	}

	activeEditor.selection = new vscode.Selection(pos, pos);
	return true;
}

function gotoDocPos(document: vscode.TextDocument, pos: vscode.Position): boolean {
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return false;
	}
	
	vscode.window.showTextDocument(document);
	let gotoSuccess = gotoPos(pos);
	return gotoSuccess;
}

function messageError(message: String): void {
	vscode.window.showErrorMessage(`Marker Jumper: ${message}`);
}

function messageInformation(message: String): void {
	vscode.window.showInformationMessage(`Marker Jumper: ${message}`);
}

function positionToLine(position: vscode.Position): String {
	return `Ln ${position.line}, Ch ${position.character}`;
}

// This method is called when your extension is deactivated
export function deactivate() { }
