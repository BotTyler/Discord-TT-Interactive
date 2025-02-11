import Database from "../Database";
import { DAO, DatabaseBase } from "../Interface/DatabaseObjectInterface";

export class NotesDAO extends DAO {
    private id?: number;
    private player_id: string;
    private note_title: string;
    private note: string;

    constructor(player_id: string, note_title: string, note: string, id?: number) {
        super();
        this.id = id;
        this.player_id = player_id;
        this.note = note;
        this.note_title = note_title;
    }

    getKeys(): string[] {
        return ["player_id", "note", "note_title"];
    }
    getValues(): any[] {
        return [this.player_id, this.note, this.note_title];
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
    //async create(data: NotesDAO): Promise<number | undefined> {
    //    // If Id is available we need to update the rows
    //    // check to make sure a row for the campaign_id and player_id exist;
    //    const dataValues: any[] = data.getValues();
    //
    //    const existingId: number | undefined = await this.getExistingNoteId(dataValues[0]);
    //    console.log(existingId);
    //    if(existingId){
    //        data.setIdValue(existingId);
    //        const result: number | undefined = await super.update(data);
    //        return result;
    //    }else{
    //        const result: number | undefined = await super.create(data);
    //        return result;
    //    }
    //
    //}


    async getNoteFromId(player_id: string, noteId: number): Promise<string | undefined> {

        const query: string = `SELECT note FROM public."Notes" WHERE player_id = $1 AND note_id = $2;`;
        const args: Object[] = [player_id, noteId];

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

    async getExistingNoteIds(player_id: string): Promise<number[]> {

        const query: string = `SELECT note_id FROM public."Notes" WHERE player_id = $1;`;
        const args: Object[] = [player_id];

        console.log(query);
        const returnValue = await Database.getInstance()
            .query(query, args)
            .catch((e) => {
                console.error(`Could not ***select*** the existing note.\n\t${e}`);
                return undefined;
            });

        if(returnValue) return returnValue.rows;
        return [];
    }
    constructor() {
        super("Notes");
    }
}
