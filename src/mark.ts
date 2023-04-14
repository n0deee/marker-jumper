import * as vscode from 'vscode';

export class Mark {
	public document: vscode.TextDocument;
	public position: vscode.Position;
	public description?: string;

	public constructor(document: vscode.TextDocument, position: vscode.Position, description?: string) {
		this.document = document;
		this.position = position;
		this.description = description;
	}

	static createFromCurrentPos(description?: string): Mark | undefined {
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) return undefined;

		let document = activeEditor.document;
		let cursorPos = activeEditor.selection.active;
		return new Mark(document, cursorPos, description);
	}
}

export interface MarkQuickPickItem extends vscode.QuickPickItem {
	id: string;
}