import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class NotesDAO extends DAO {
    private id?: number;
    private player_id: string;
    private campaign_id: string;
    private note: XMLDocument;

    constructor(player_id: string, campaign_id: string, note: XMLDocument, id?: number) {
        super();
        this.id = id;
        this.player_id = player_id;
        this.campaign_id = campaign_id;
        this.note = note;
    }

    getKeys(): string[] {
        return ["player_id", "campaign_id", "note"];
    }
    getValues(): any[] {
        return [this.player_id, this.campaign_id, this.note];
    }
    getIdName(): string {
        return "note_id";
    }
    getIdValue() {
        return this.id;
    }
    setIdValue(id: number) {
        this.id = id;
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
        // check to make sure a row for the campaign_id and player_id exist;
        const dataValues: any[] = data.getValues();

        const existingId: number | undefined = await this.getExistingNoteId(dataValues[0], dataValues[1]);
        console.log(existingId);
        if(existingId){
            data.setIdValue(existingId);
            const result: number | undefined = await super.update(data);
            return result;
        }else{
            const result: number | undefined = await super.create(data);
            return result;
        }

    }


    async getExistingNote(player_id: string, campaign_id: string): Promise<Object | undefined> {

        const query: string = `SELECT note FROM public."Notes" WHERE player_id = $1 AND campaign_id = $2;`;
        const args: Object[] = [player_id, campaign_id];

        console.log(query);
        const returnValue = await Database.getInstance()
            .query(query, args)
            .catch((e) => {
                console.error(`Could not ***select*** the existing note.\n\t${e}`);
                return undefined;
            });

        if(returnValue && returnValue.rows[0]) return returnValue.rows[0].note;
        return undefined;
    }

    async getExistingNoteId(player_id: string, campaign_id: string): Promise<number | undefined> {

        const query: string = `SELECT note_id FROM public."Notes" WHERE player_id = $1 AND campaign_id = $2;`;
        const args: Object[] = [player_id, campaign_id];

        console.log(query);
        const returnValue = await Database.getInstance()
            .query(query, args)
            .catch((e) => {
                console.error(`Could not ***select*** the existing note.\n\t${e}`);
                return undefined;
            });

        if(returnValue && returnValue.rows[0]) return returnValue.rows[0].note_id;
        return undefined;
    }
    constructor() {
        super("Notes");
    }
}
