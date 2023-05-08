import * as vscode from 'vscode';
import { MarkQuickPickItem, IdentifiedMark } from './mark';

export function gotoPos(pos: vscode.Position): boolean {
    let activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return false;
    }

    let newSelection = new vscode.Selection(pos, pos);
    activeEditor.selection = new vscode.Selection(newSelection.start, newSelection.end);
    activeEditor.revealRange(newSelection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    return true;
}

export function getMarkerQuickItems(markers: Array<IdentifiedMark>): Array<vscode.QuickPickItem> {
    let array: Array<vscode.QuickPickItem> = [];

    markers.forEach((x) => {
        const id = x.id;
        const value = x.mark;

        let workspaceRelativePath = vscode.workspace.asRelativePath(value.document.fileName);

        let item: MarkQuickPickItem = { 'id': id, 'label': id, detail: `${positionToString(value.position)}, ${workspaceRelativePath}`, description: value.description };
        array.push(item);
    });

    return array;
}

export async function gotoDocPos(document: vscode.TextDocument, pos: vscode.Position): Promise<boolean> {
    return new Promise<boolean>(async () => {
        await vscode.window.showTextDocument(document);
        let gotoSuccess = gotoPos(pos);
        return gotoSuccess;
    });
}

export async function openNewTextEditor(document: vscode.TextDocument, pos: vscode.Position) {
    return await vscode.window.showTextDocument(document);

}

export function messageError(message: string): void {
    vscode.window.showErrorMessage(`Marker Jumper: ${message}`);
}

export function messageInformation(message: string): void {
    vscode.window.showInformationMessage(`Marker Jumper: ${message}`);
}

export function statusBarMessage(message: string, timeout: number = 5000): void {
    vscode.window.setStatusBarMessage(message, timeout);
}

export function positionToString(position: vscode.Position): string {
    return `Ln ${position.line}, Ch ${position.character}`;
}