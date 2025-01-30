import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import Theme from './Theme';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import "./RTEstyle.css"
import { ParagraphNode, TextNode } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list'

import { HeadingNode } from '@lexical/rich-text'
import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useAuthenticatedContext } from '../../ContextProvider/useAuthenticatedContext';
import { useGameState } from '../../ContextProvider/GameStateContext/GameStateProvider';


// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any) {
    console.error(error);
}

export default function RichTextEditor() {

    const initialConfig = {
        namespace: 'RichTextEditor',
        theme: Theme,
        nodes: [ParagraphNode, TextNode, ListNode, ListItemNode, HeadingNode],
        onError,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className='w-100 h-100 d-flex flex-column'>
                <div className='w-100 h-auto'>
                    <ToolbarPlugin />
                </div>
                <div className='w-100 bg-dark d-flex position-relative' style={{height: '1px', flex: '1 1 auto'}}>
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className='editor-input overflow-auto'
                                aria-placeholder={'Enter some text...'}
                                placeholder={<div className='editor-placeholder'>Enter some text...</div>} />}
                                ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <CheckListPlugin />
                    <AutoSavePlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}


function AutoSavePlugin(){
    const [editor] = useLexicalComposerContext();
    const [saveStatus, setSaveStatus] = useState<string>("Saved");
    const authContext = useAuthenticatedContext();
    //const mapContext = useGameState();

    useEffect(() => {
        // Auto save.
        // Every 5 seconds of inactivity save
        let autoSaveTimer = -1;
        const autoSaveInterval = setInterval(()=>{
            console.log(autoSaveTimer);

            if(autoSaveTimer > 0) {
                setSaveStatus("Saving...");
                autoSaveTimer--;
            }
            else if(autoSaveTimer === 0){
                // save
                const contentJSON = editor.toJSON();
                const saveObject = {
                    note: contentJSON,
                    campaign_id: '46'

                }
                authContext.room.send("SaveNote", saveObject);

                setSaveStatus("Saved");
                autoSaveTimer--;
            }

        }, 1000)
        // Listen to the key presses, after a second of inactivity initiate a save;

        const updateListener = editor.registerUpdateListener(({editorState}) => {
            // The latest EditorState can be found as `editorState`.
            // To read the contents of the EditorState, use the following API:
            autoSaveTimer = 5;

        });


        return () => {
            updateListener();
            clearInterval(autoSaveInterval);
        }

    }, [editor]);


    return <div className='position-absolute' style={{bottom: '5px', right: '5px'}}>
        <p className='m-0' style={{color: "black", fontSize: 'xx-small'}}>{saveStatus}</p>
    </div>
}
