import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { useGameState } from "../GameStateContext/GameStateProvider";

export const NotesContextHandler = forwardRef(function NotesContextHandler({}: {}, ref:any){
    const authContext = useAuthenticatedContext();
    const mapContext = useGameState();
    const [campaignId, setCampaignId] = useState<number | undefined>(undefined);
    const [notes, setNotes] = useState<string | undefined>(undefined);
    const [saveStatus, setStatus] = useState<string>("Saved");
    const [autoSaveTimer, setAutoSaveTimer] = useState<number>(-1);
    const [autoSaveInterval, setAutoSaveInterval] = useState<any | undefined>(undefined);
    useImperativeHandle(
        ref,
        () => ({
            getNotes(): Object | undefined {
                return notes;
            },
            updateNote(notes: string): void {
                setNotes(notes);
            },
            saveStatus(): string {
                return saveStatus;
            }
        }),
        [notes, saveStatus]
    );

    // Handle the campaignId changes
    useEffect(() => {
        //setCampaignId(mapContext.getMap()?.id ?? undefined);
        //const handleMapIdUpdate = (val: any) => {
        //    setCampaignId(val.detail.val);
        //}
        //
        //addEventListener("MapUpdate", handleMapIdUpdate);
        setCampaignId(46);
    }, []);

    // Handle the callback from the server for a notes request.
    useEffect(() => {
        const handleNotesResponse = (val: any) => {
            setNotes(val);
        }
        authContext.room.onMessage("GetNoteResponse", handleNotesResponse);
    }, [authContext.room]);

    useEffect(() => {
        if(campaignId === undefined) return;
        authContext.room.send("GetNote", {campaign_id: `${campaignId}`});
    }, [campaignId]);

    useEffect(() => {
        console.log("use effect notes");
        setStatus("Saving...");
        setAutoSaveTimer(5);
        if(autoSaveInterval !== undefined) return;

        console.log("No interval started creating interval");
        const interval = setInterval(() => {
            setAutoSaveTimer((prev) => {
                return prev - 1;
            });
        }, 1000);

        setAutoSaveInterval(interval);
    }, [notes]);

    useEffect(() => {
        console.log(autoSaveTimer);
        if(autoSaveTimer === 0){
            // ready to save
            console.log("ready to save");
            authContext.room.send("SaveNote", {notes: notes, campaign_id:`${campaignId}`});
            clearInterval(autoSaveInterval);
            setStatus("Saved!!!");
            setAutoSaveInterval(undefined);
        }
    }, [autoSaveTimer]);

    const emitFieldChangeEvent = (field: string, value: any) => {
        const event = new CustomEvent(`${field}`, {
            detail: { val: value },
        });
        window.dispatchEvent(event);
    };
    // below are listeners for the gamestate map and currenthostid
    useEffect(() => {
        emitFieldChangeEvent(`ChangeNoteStatus`, saveStatus);
    }, [saveStatus]);

    return <></>
});
