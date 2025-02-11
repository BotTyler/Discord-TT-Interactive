export interface NoteBook {
    Notes: {[key:string]: Note};
}

export interface Note {
    id: number;
    title: string;
    data: string;
}
