import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class NotesDAO extends DAO {
    private id?: string;
    private player_id: string;
    private campaign_id: string;
    private note: XMLDocument;

    constructor(player_id: string, campaign_id: string, note: XMLDocument, id?: string) {
        super();
        this.id = id;
        this.player_id = player_id;
        this.campaign_id = campaign_id;
        this.note = note;
    }

    getKeys(): string[] {
        return [this.getIdName(), "player_id", "campaign_id", "note"];
    }
    getValues(): any[] {
        return [this.getIdValue(), this.player_id, this.campaign_id, this.note];
    }
    getIdName(): string {
        return "note_id";
    }
    getIdValue() {
        return this.id;
    }
}

export class NotesDB extends DatabaseBase<NotesDAO> {
    private static instance: NotesDB | undefined = undefined;
    public static getInstance(): NotesDB {
        if (NotesDB.instance === undefined) NotesDB.instance = new NotesDB();
        return NotesDB.instance;
    }
    async create(data: NotesDAO): Promise<number | undefined> {
        // If Id is available we need to update the rows
        if(data.getIdValue()){
            const result: number | undefined = await super.update(data);
            return result;
        }else{
            const result: number | undefined = await super.create(data);
            return result;
        }

    }
    constructor() {
        super("Notes");
    }
}
