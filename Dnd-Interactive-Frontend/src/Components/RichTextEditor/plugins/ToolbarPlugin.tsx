import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import {useCallback, useEffect, useRef, useState} from 'react';

export default function ToolbarPlugin(){
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);
    const [isBold, setBold] = useState<boolean>(false);
    const [isItalic, setItalic] = useState<boolean>(false);
    const [isUnderline, setUnderline] = useState<boolean>(false);
    const [isStrike, setStrike] = useState<boolean>(false);

    // callback to use for each selection
    const editorUpdate = useCallback(()=>{
        const selection = $getSelection();
        if(!$isRangeSelection(selection)) return;
        setBold(selection.hasFormat('bold'));
        setItalic(selection.hasFormat('italic'));
        setUnderline(selection.hasFormat('underline'));
        setStrike(selection.hasFormat('strikethrough'));
    }, []);



    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    editorUpdate();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, _newEditor) => {
                    editorUpdate();
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, editorUpdate]);

    return <div className='toolbar'>
        {HistorySection()}
        <div style={{width: '1px', backgroundColor: '#eee', margin: '0 4px' }} />
        {FontOptionSection()}
        <div style={{width: '1px', backgroundColor: '#eee', margin: '0 4px' }} />
        {ParagraphOptionSection()}
    </div>

}


function HistorySection(){
    const [editor] = useLexicalComposerContext();

    return <></>
}
function FontOptionSection(){
    const [editor] = useLexicalComposerContext();
    return <></>
}
function ParagraphOptionSection(){
    const [editor] = useLexicalComposerContext();
    return <></>
}
