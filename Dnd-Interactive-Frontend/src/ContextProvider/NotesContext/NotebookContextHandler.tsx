import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";

export const NotebookHandler = forwardRef(function NotebookHandler({}:{}, ref:any){
    const authContext = useAuthenticatedContext();
    const [notebook, setNotebook] = useState<number[] | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        getNotebook(): number[] | undefined {
            return notebook;
        },
    }), [notebook]);

    useEffect(() => {
        const GatherNotes = (val: number[]) => {
            console.log(val);
            setNotebook(val);
        }

        const NoteAdd = (val: number) => {
            console.log("NoteAdded");
            setNotebook((prev) => {
                if(!prev) return [val];
                return [...prev, val];
            });
        }

        authContext.room.onMessage("GetAllNoteIdsResponse", GatherNotes);
        authContext.room.onMessage("NoteAdd", NoteAdd);
        authContext.room.send("GetAllNoteIds");
    }, [authContext.room]);

    return notebook !== undefined ? notebook?.map((noteId) => {
        return <NoteHandler id={noteId} />;
    }) : "";
});

export function NoteHandler({ id } : {id: number}) {
    const authContext = useAuthenticatedContext();
    const [noteId, setNoteId] = useState<number>(id);
    const [note, setNote] = useState<string | undefined>(undefined);
    useEffect(() => {
        setNoteId(id);
    }, [id]);

    useEffect(() => {
        const handleNoteResponse = (val:string) => {
            setNote(val);
        }
        authContext.room.onMessage("GetNoteResponse", handleNoteResponse);
        authContext.room.send("GetNote", {note_id: noteId});
    }, [authContext.room]);


    useEffect(() => {
        const NoteRequest = async (value: any): Promise<void> => {
            const callback = value.detail;
            callback(note);
        }

        const NoteSaveRequest = (data:any): void => {
            const number = data.val.data;
            // make save
            console.log("saving");
            console.log(data);
        }

        window.addEventListener(`NoteRequest-${noteId}`, NoteRequest);
        window.addEventListener(`NoteSave-${noteId}`, NoteSaveRequest);

        return () => {
            window.removeEventListener(`NoteRequest-${noteId}`, NoteRequest);
            window.removeEventListener(`NoteSave-${noteId}`, NoteSaveRequest);
        }
    }, []);

    return <></>
}


