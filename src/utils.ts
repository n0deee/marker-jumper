import * as vscode from 'vscode';
import { MarkQuickPickItem, Mark } from './mark';

export function gotoPos(pos: vscode.Position): boolean {
    let activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return false;
    }

    activeEditor.selection = new vscode.Selection(pos, pos);
    activeEditor.revealRange(new vscode.Range(pos, pos));
    return true;
}

export function getMarkerQuickItems(markers: Map<string, Mark>): Array<vscode.QuickPickItem> {
    let array: Array<vscode.QuickPickItem> = [];

    markers.forEach((value, key) => {
        let item: MarkQuickPickItem = { 'id': key, 'label': key, detail: `${value.document.fileName}, ${positionToLine(value.position)}`, description: value.description };
        array.push(item);
    });

    return array;
}

export async function gotoDocPos(document: vscode.TextDocument, pos: vscode.Position): Promise<boolean> {
    return new Promise<boolean>(async () => {
        let activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return false;
        }

        await vscode.window.showTextDocument(document);
        let gotoSuccess = gotoPos(pos);
        return gotoSuccess;
    });
}

export function messageError(message: string): void {
    vscode.window.showErrorMessage(`Marker Jumper: ${message}`);
}

export function messageInformation(message: string): void {
    vscode.window.showInformationMessage(`Marker Jumper: ${message}`);
}

export function positionToLine(position: vscode.Position): string {
    return `Ln ${position.line}, Ch ${position.character}`;
}