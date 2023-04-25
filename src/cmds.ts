import * as vscode from 'vscode';
import { Mark, MarkQuickPickItem } from './mark';
import * as util from './utils';

export const setMarkInputRegex = /^(\w+)(?:\s(.+))?$/;
export const markers: Map<string, Mark> = new Map<string, Mark>;
export const BACKPOS_ID = 'last';

interface ReservedKeyWordInformation {
    key: string,
    description: string
}

const RESERVED_KEYWORDS: Array<ReservedKeyWordInformation> = [
    {
        key: 'last',
        description: 'Last cursor position (before a Mark Goto)'
    }
];

export async function cmdSetMark() {
    // Getting active text editor information
    let activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        util.messageError('No Active Editor'); // DEBUG
        return;
    }

    let document = activeEditor.document;
    let cursorPos = activeEditor.selection.active;

    // Getting user input
    let input: string | undefined = await vscode.window.showInputBox({ 'title': 'Set Mark', 'prompt': `Marker At: ${util.positionToLine(cursorPos)}` });
    if (!input) return;

    let match = input.match(setMarkInputRegex);
    if (!match || !match[1]) {
        util.messageError('Invalid identifier.\nExample: `1` or `20 with a description`');
        return;
    }

    // Saving Marker
    let id: string = match[1];
    let description: string | undefined = match[2];

    let reserved = getReservedKeyword(id);
    if (reserved) {
        util.messageError(`This ID are reserved. (key: ${reserved.key}, prupose: ${reserved.description})`);
        return;
    }

    let marker: Mark = Mark.createFromCurrentPos(description) || new Mark(document, cursorPos, description);
    markers.set(id, marker);
}

export async function cmdGoToMark() {
    // Receiving user inpug
    let items = util.getMarkerQuickItems(markers);
    let input: MarkQuickPickItem | undefined = await vscode.window.showQuickPick(items, { canPickMany: false, matchOnDescription: true, title: 'GoTo Mark' }) as MarkQuickPickItem;
    if (!input) return;

    // Getting the marker
    let id: string = input.id;
    let marker = markers.get(id);
    if (!marker) {
        util.messageError('Marker not found');
        return;
    }

    // Saving Last Position
    let backMark: Mark | undefined = Mark.createFromCurrentPos('Last Position');
    if (backMark) {
        markers.set(BACKPOS_ID, backMark);
    }

    // Go To document and line
    let success = await util.gotoDocPos(marker.document, marker.position);
    if (!success) {
        util.messageError('File vanished?');
        return;
    }
}

export async function cmdRemoveMark() {
    // Receiving user inpug
    let items = util.getMarkerQuickItems(markers);
    let input: MarkQuickPickItem | undefined = await vscode.window.showQuickPick(items, { canPickMany: false, matchOnDescription: true, title: 'Remove Mark' }) as MarkQuickPickItem;
    if (!input) return;

    // Getting the marker
    let id: string = input.id;
    markers.delete(id);
}

export async function cmdClearMarks() {
    markers.clear();
    util.messageInformation('All Markers Removed');
}


function getReservedKeyword(key: string): ReservedKeyWordInformation | undefined {
    return RESERVED_KEYWORDS.find((x) => x.key === key);
}