import React, { createContext, useEffect } from "react";
import { NotebookHandler } from "./NotebookContextHandler";
import { Note, NoteBook } from "dnd-interactive-shared";
import { useAuthenticatedContext } from "../useAuthenticatedContext";

const NotesContext = createContext<NotesContextInterface>({
    getNotebook: (): NoteBook | undefined => {
        console.error("NOT IMPLEMENTED");
        return undefined;
    },
    saveNote: (notes: Note) => {
        console.error("NOT IMPLEMENTED");
    },
    addNote: (title: string) => {
        console.error("NOT IMPLEMENTED");
    }

});
export function NotesContextProvider({ children }: { children: React.ReactNode }) {
    const authContext = useAuthenticatedContext();
    const notesRef = React.useRef<any>(null);
    const [notesRefReady, setNotesRefReady] = React.useState<boolean>(false);

    useEffect(() => {
        setNotesRefReady(notesRef !== undefined);
    }, [notesRef]);

    const getNotebook = (): NoteBook | undefined => {
        if(!notesRefReady) return undefined;
        return notesRef.current.getNotebook();
    }

    const saveNote = (notes: Note): void => {
        if(!notesRefReady) return;
        notesRef.current.saveNote(notes);
    }

    const addNote = (title: string): void => {
        authContext.room.send("AddNote", {title: title});
    }

    return (
        <NotesContext.Provider value={{getNotebook: getNotebook, saveNote: saveNote, addNote: addNote}}>
            <NotebookHandler />
            {notesRefReady ? children : <p>Message Context Loading</p>}
        </NotesContext.Provider>
    );
}
interface NotesContextInterface {
    getNotebook: () => NoteBook | undefined;
    saveNote: (notes: Note) => void;
    addNote: (title: string) => void;
}
export function useNotesContext() {
    return React.useContext(NotesContext);
}
