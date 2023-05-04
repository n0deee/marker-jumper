import * as vscode from 'vscode';
import { Mark, MarkManager, MarkQuickPickItem, ReservedId, ReservedIdInformation } from './mark';
import * as util from './utils';
import { MarkContext } from './markcontext';


export async function setMark(context: MarkContext) {
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

    let match = input.match(context.setMarkInputRegex);
    if (!match || !match[1]) {
        util.messageError('Invalid identifier.\nExample: `1` or `20 with a description`');
        return;
    }

    // Saving Marker
    let id: string = match[1];
    let description: string | undefined = match[2];

    let reserved = context.markManager.getReservedKeyInfo(id);
    if (reserved) {
        util.messageError(`This ID are reserved. (key: ${reserved.key}, prupose: ${reserved.description})`);
        return;
    }

    let marker: Mark = Mark.createFromCurrentPos(description) || new Mark(document, cursorPos, description);
    context.markManager.setMark(id, marker);
}

export async function goToMark(context: MarkContext) {
    // Receiving user inpug
    let items = util.getMarkerQuickItems(context.markManager.getSortedListByLastUse());
    let input: MarkQuickPickItem | undefined = await vscode.window.showQuickPick(items, { canPickMany: false, matchOnDescription: true, title: 'GoTo Mark' }) as MarkQuickPickItem;
    if (!input) return;
    
    // Getting the marker
    let id: string = input.id;
    let marker = context.markManager.getMark(id);
    if (!marker) {
        util.messageError('Marker not found');
        return;
    }
    marker.setLastUseForNow();

    // Saving Last Position
    let backMark: Mark | undefined = Mark.createFromCurrentPos('Last Position');
    if (backMark) {
        backMark.addLastUseTime(1);
        context.markManager.setMark(ReservedId.last, backMark);
    }
    
    // Go To document and line
    let success = await util.gotoDocPos(marker.document, marker.position);
    if (!success) {
        util.messageError('File vanished?');
        return;
    }
}

export async function removeMark(context: MarkContext) {
    // Receiving user inpug
    let items = util.getMarkerQuickItems(context.markManager.getSortedListByLastUse());
    let input: MarkQuickPickItem | undefined = await vscode.window.showQuickPick(items, { canPickMany: false, matchOnDescription: true, title: 'Remove Mark' }) as MarkQuickPickItem;
    if (!input) return;

    // Getting the marker
    let id: string = input.id;
    context.markManager.removeMark(id);
}

export async function clearMarks(context: MarkContext) {
    context.markManager.clearMarks();
    util.messageInformation('All Markers Removed');
}