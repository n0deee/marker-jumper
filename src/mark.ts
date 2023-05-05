import * as vscode from 'vscode';

export interface MarkQuickPickItem extends vscode.QuickPickItem {
	id: string;
}

export type IdentifiedMark = { id: string, mark: Mark };

export class Mark {
	public document: vscode.TextDocument;
	public position: vscode.Position;
	public description?: string;
	public lastUse: number | undefined;
	public createdAt: number;

	public constructor(document: vscode.TextDocument, position: vscode.Position, description?: string) {
		this.document = document;
		this.position = position;
		this.description = description;
		this.lastUse = undefined;
		this.createdAt = Date.now();
	}

	public setLastUseForNow() {
		this.lastUse = Date.now();
	}

	public addLastUseTime(ammount: number) {
		if (this.lastUse === undefined) this.setLastUseForNow();
		if (this.lastUse === undefined) throw new Error('Error while updating lasttime');

		this.lastUse += ammount;
	}

	static createFromCurrentPos(description?: string): Mark | undefined {
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) return undefined;

		let document = activeEditor.document;
		let cursorPos = activeEditor.selection.active;
		return new Mark(document, cursorPos, description);
	}
}

export interface ReservedIdInformation {
	key: string,
	description: string
}

export enum ReservedId {
	last = 'last'
}



export type MarkManagerEventType = 'markset' | 'markremove' | 'markclear';
//! Refactoring! Change every 'KEY' to 'ID'
export class MarkManager {
	private events: Map<MarkManagerEventType, Array<Function>>;
	private markers: Map<string, Mark>;
	private reservedIdInfos: Array<ReservedIdInformation>;

	public constructor() {
		this.markers = new Map<string, Mark>();
		this.reservedIdInfos = [];
		this.events = new Map<MarkManagerEventType, Array<Function>>;
	}

	public addEventListener(event: MarkManagerEventType, func: Function) {
		let eventArray = this.events.get(event);

		if (eventArray === undefined) {
			eventArray = [];
			this.events.set(event, eventArray);
		}

		eventArray.push(func);
	}

	public removeEventListener(event: MarkManagerEventType, func: Function) {
		let eventArray = this.events.get(event);
		if (eventArray === undefined) return;

		let index = eventArray.indexOf(func);

		if (index === undefined) return;

		eventArray = [...eventArray.splice(0, index), ...eventArray.splice(index + 1)];
	}

	public raiseEvent(event: MarkManagerEventType, ...params: any) {
		let eventArray = this.events.get(event);
		if (eventArray === undefined) return;

		eventArray.forEach((f) => {
			f(...params);
		});
	}

	public setMark(id: string, mark: Mark) {
		this.markers.set(id, mark);
		this.raiseEvent('markset', id, mark);
	}

	public getMark(id: string): Mark | undefined {
		return this.markers.get(id);
	}

	public removeMark(id: string) {
		this.markers.delete(id);
		this.raiseEvent('markremove', id);
	}

	public clearMarks() {
		this.markers.clear();
		this.raiseEvent('markclear');
	}

	public setMarkUsedNow(id: string) {
		let mark = this.getMark(id);
		if (!mark) return;

		mark.lastUse = Date.now();
	}

	public registerReservedId(info: ReservedIdInformation) {
		let containsThisId = this.isKeyRegistered(info.key);
		if (containsThisId)
			throw new Error('This ID has already been reserved');

		this.reservedIdInfos.push(info);
	}

	public unregisterReservedId(info: ReservedIdInformation) {
		let indexOf: number | undefined = this.reservedIdInfos.findIndex((x) => x.key === info.key);
		if (!indexOf)
			throw new Error('This ID has not been reserved');

		let reservesLen = this.reservedIdInfos.length;
		if (reservesLen - 1 > indexOf) {
			this.reservedIdInfos[indexOf] = this.reservedIdInfos[reservesLen - 1];
		}

		if (reservesLen > 0)
			this.reservedIdInfos.length -= 1;
	}

	public isKeyRegistered(key: string): boolean | undefined {
		return this.getReservedKeyInfo(key) ? true : false;
	}

	public getReservedKeyInfo(key: string): ReservedIdInformation | undefined {
		return this.reservedIdInfos.find((x) => x.key === key);
	}

	public getList(): Array<IdentifiedMark> {
		let array: Array<IdentifiedMark> = [];

		this.markers.forEach((value, key) => {
			array.push({ id: key, mark: value });
		});

		return array;
	}

	public getSortedListByLastUse() {
		return this.getList().sort((a, b) => {
			let aLastUse = a.mark.lastUse || a.mark.createdAt;
			let bLastUse = b.mark.lastUse || b.mark.createdAt;

			return bLastUse - aLastUse;
		});
	}
}