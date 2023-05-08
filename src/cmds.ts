import * as vscode from 'vscode';
import { IdentifiedMark, Mark, MarkQuickPickItem, ReservedId } from './mark';
import * as util from './editorUtils';
import { MarkerJumperContext } from './markerjumpercontext';

export async function setMark(context: MarkerJumperContext) {
    // Getting active text editor information
    let activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        util.messageError('No Active Editor'); // DEBUG
        return;
    }

    let document = activeEditor.document;
    let cursorPos = activeEditor.selection.active;

    // Getting user input
    let input: string | undefined = await vscode.window.showInputBox({ 'title': 'Set Mark', 'prompt': `Marker At: ${util.positionToString(cursorPos)}` });
    if (!input) return;

    let match = input.match(context.setMarkInputRegex);
    if (!match || !match[1]) {
        util.messageError('Invalid identifier.\nExample: `1` or `20 with a description`');
        return;
    }

    // Saving Marker
    let id: string = match[1];
    let description: string | undefined = match[2];

    let reserved = context.markManager.getReservedIdInfo(id);
    if (reserved) {
        util.messageError(`This ID are reserved. (id: ${reserved.id}, prupose: ${reserved.description})`);
        return;
    }

    let marker: Mark = Mark.createFromCurrentPos(description) || new Mark(document, cursorPos, description);
    context.markManager.setMark(id, marker);
    util.statusBarMessage(`Marker '${id}' set (at ${util.positionToString(marker.position)}).`);
}

export async function goToMark(context: MarkerJumperContext) {
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
    let backMarkId: string = ReservedId.last;
    let backMark: Mark | undefined = Mark.createFromCurrentPos('Last Position');
    let backMarkString: string = '';
    if (backMark) {
        backMark.addLastUseTime(1);
        context.markManager.setMark(backMarkId, backMark);
        backMarkString = ` '${backMarkId}' set (at ${util.positionToString(backMark.position)})`;
    }

    // Go To document and line
    let success = await util.gotoDocPos(marker.document, marker.position);
    if (!success) {
        util.messageError('File vanished?');
        return;
    }

    util.statusBarMessage(`Going to marker ${id} (at ${util.positionToString(marker.position)}, ${vscode.workspace.asRelativePath(marker.document.uri)}).${backMarkString}`);
}

export async function removeMark(context: MarkerJumperContext) {
    // Receiving user inpug
    let items = util.getMarkerQuickItems(context.markManager.getSortedListByLastUse());
    let input: MarkQuickPickItem | undefined = await vscode.window.showQuickPick(items, { canPickMany: false, matchOnDescription: true, title: 'Remove Mark' }) as MarkQuickPickItem;
    if (!input) return;

    // Getting the marker
    let id: string = input.id;
    context.markManager.removeMark(id);
    util.statusBarMessage(`Marker ${id} deleted`);
}

export async function clearMarks(context: MarkerJumperContext) {
    context.markManager.clearMarks();
    util.statusBarMessage('All Markers Removed');
}

export async function goToLastUsedMark(context: MarkerJumperContext) {
    let marks: Array<IdentifiedMark> = context.markManager.getSortedListByLastUse();
    if (marks.length <= 0) {
        util.messageError('No Marks saved');
        return;
    }

    let lastMark: Mark = marks[0].mark;

    util.gotoDocPos(lastMark.document, lastMark.position);
    util.statusBarMessage('Going to last used marker');
}