import React, { createContext, useEffect } from "react";
import { NotesContextHandler } from "./NotesContextHandler";

const NotesContext = createContext<NotesContextInterface>({
    getNotes: () => {
        console.error("NOT IMPLEMENTED");
        return "";
    },
    updateNote: (notes: string) => {
        console.error("NOT IMPLEMENTED");
    },
    status: () => {
        return "Loading...";
    }

});
export function NotesContextProvider({ children }: { children: React.ReactNode }) {
    const notesRef = React.useRef<any>(null);
    const [notesRefReady, setNotesRefReady] = React.useState<boolean>(false);

    useEffect(() => {
        setNotesRefReady(notesRef !== undefined);
    }, [notesRef]);

    const getNotes = () => {
        if(!notesRefReady) return "";
        return notesRef.current.getNotes();
    }

    const updateNote = (notes: string) => {
        if(!notesRefReady) return;
        notesRef.current.updateNote(notes);
    }

    const status = () => {
        if(!notesRefReady) return "Loading";
        return notesRef.current.saveStatus();
    }

    return (
        <NotesContext.Provider value={{getNotes: getNotes, updateNote: updateNote, status: status}}>
            <NotesContextHandler ref={notesRef} />
            {notesRefReady ? children : <p>Message Context Loading</p>}
        </NotesContext.Provider>
    );
}
interface NotesContextInterface {
    getNotes: () => string;
    updateNote: (notes: string) => void;
    status: () => string;
}
export function useNotesContext() {
    return React.useContext(NotesContext);
}
