import { useEffect, useState } from "react";
import RichTextEditor from "../../../RichTextEditor/RichTextEditor";
import Modal from "../../../Modal/Modal";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";

export default function NotesPanel(){


    const [noteId, setNoteId] = useState<number | undefined>(undefined);

    return noteId === undefined? <NoteSelector /> : <RichTextEditor />
}

function NoteSelector() {
    const authContext = useAuthenticatedContext();
    const [notes, setNotes] = useState<number[]>([]);
    const [newModalShow, setNewModalShow] = useState<boolean>(false);
    const [newNoteTitle, setNewNoteTitle] = useState<string>("");

    useEffect(() => {
        const handleAllNoteIdsResponse = (val: any) => {
            console.log(val);
            setNotes(val);
        }

        const allNoteIdEventRequest = new CustomEvent(`GetAllNoteIds`, { detail: handleAllNoteIdsResponse});
        window.dispatchEvent(allNoteIdEventRequest);

    }, []);
    return (<><div className="w-100 h-100 d-flex flex-column">
        <div className="w-100 h-auto">
            <button className="btn btn-primary" onClick={()=> {
                setNewNoteTitle("");
                setNewModalShow(true);
            }}>CREATE</button>
        </div>
        <div className="w-100 overflow-auto" style={{flex: '1 1 auto'}}>
            {notes.map((note) => {
                return <p className="p-0 m-0">{note}</p>
            })}

        </div>
    </div>
        {newModalShow ?
            <Modal Title="New Note"
                closeCallback={() => {
                    setNewModalShow(false);
                    setNewNoteTitle("");
                }}
                submitCallback={() => {
                    authContext.room.send("AddNote", {note_title: newNoteTitle});
                    setNewModalShow(false);
                    setNewNoteTitle("");
                }}

            >
                <div className="container-fluid">
                    <input type="text" value={newNoteTitle} onChange={(e:any) => {
                        setNewNoteTitle(e.target.value);
                    }} />
                </div>
            </Modal>:
            ""
        }</>)
}
