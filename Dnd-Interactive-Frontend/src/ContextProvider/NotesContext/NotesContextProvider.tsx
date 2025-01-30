import React, { createContext, useEffect } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";

const NotesContext = createContext<NotesContextInterface>({
    getNotes: () => {
        console.error("NOT IMPLEMENTED");
        return {};
    },
    saveNotes: (notes: Object, campaign_id: number) => {
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

    const getNotes = () => {

        return {};
    }

    const saveNotes = (notes: Object, campaign_id: number) => {

    }

  return (
    <NotesContext.Provider value={{getNotes: getNotes, saveNotes: saveNotes}}>
      {notesRefReady ? children : <p>Message Context Loading</p>}
    </NotesContext.Provider>
  );
}
interface NotesContextInterface {
    getNotes: () => Object;
    saveNotes: (notes: Object, campaign_id: number) => void;
}
export function useNotesContext() {
  return React.useContext(NotesContext);
}
