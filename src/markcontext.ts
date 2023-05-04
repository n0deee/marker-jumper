import { MarkManager } from './mark';


export class MarkContext {
    public setMarkInputRegex: RegExp;
    public markManager: MarkManager;

    public constructor() {
        this.markManager = new MarkManager();
        this.setMarkInputRegex = /^(\w+)(?:\s(.+))?$/;
    }
}