import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    createCommand,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    LexicalCommand,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';

import { $createHeadingNode } from '@lexical/rich-text'
import { $setBlocksType} from '@lexical/selection';


import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import {useCallback, useEffect, useRef, useState} from 'react';

const FORMAT_HEADING_COMMAND: LexicalCommand<"h1" | "h2" | "h3" | "h4" | "h5"> = createCommand();

export default function ToolbarPlugin(){
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState<boolean>(false);
    const [canRedo, setCanRedo] = useState<boolean>(false);
    const [isBold, setBold] = useState<boolean>(false);
    const [isItalic, setItalic] = useState<boolean>(false);
    const [isUnderline, setUnderline] = useState<boolean>(false);
    const [isStrike, setStrike] = useState<boolean>(false);
    const [isSubscript, setSubscript] = useState<boolean>(false);
    const [isSuperscript, setSuperscript] = useState<boolean>(false);

    // callback to use for each selection
    const editorUpdate = useCallback(()=>{
        const selection = $getSelection();
        if(!$isRangeSelection(selection)) return;
        setBold(selection.hasFormat('bold'));
        setItalic(selection.hasFormat('italic'));
        setUnderline(selection.hasFormat('underline'));
        setStrike(selection.hasFormat('strikethrough'));
        setSubscript(selection.hasFormat('subscript'));
        setSuperscript(selection.hasFormat('superscript'));

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
            editor.registerCommand(FORMAT_HEADING_COMMAND,
                (payload) => {
                    const selection = $getSelection();
                    $setBlocksType(selection, () => $createHeadingNode(payload));
                    return false;
                }, COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, editorUpdate]);


    // Functions to handle the different parts of the toolbar
    function HistorySection(){
        return <div className='w-auto h-auto'>
            <button
                disabled={!canUndo}
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                className="toolbar-item spaced"
                aria-label="Undo">
                <i className="bi bi-arrow-counterclockwise" />
            </button>
            <button
                disabled={!canRedo}
                onClick={() => {
                    editor.dispatchCommand(REDO_COMMAND, undefined);
                }}
                className="toolbar-item"
                aria-label="Redo">
                <i className="bi bi-arrow-clockwise" />
            </button>
        </div>
    }


    function FontOptionSection(){

        // add spacing to the items
        return <div className='w-auto h-auto'>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                }}
                className={`toolbar-item spaced ${isBold? "active" : ""}`}
                aria-label="Bold">
                <i className="bi bi-type-bold" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                }}
                className={`toolbar-item spaced ${isItalic? "active" : ""}`}
                aria-label="Italic">
                <i className="bi bi-type-italic" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                }}
                className={`toolbar-item spaced ${isUnderline? "active" : ""}`}
                aria-label="Underline">
                <i className="bi bi-type-underline" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                }}
                className={`toolbar-item spaced ${isStrike? "active" : ""}`}
                aria-label="Strikethrough">
                <i className="bi bi-type-strikethrough" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
                }}
                className={`toolbar-item spaced ${isSubscript? "active" : ""}`}
                aria-label="Subscript">
                <i className="bi bi-subscript" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
                }}
                className={`toolbar-item ${isSuperscript? "active" : ""}`}
                aria-label="Superscript">
                <i className="bi bi-superscript" />
            </button>
        </div>
    }


    function JustificationSection(){
        return <div className='w-auto h-auto'>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                }}
                className={`toolbar-item spaced`}
                aria-label="Left Justify">
                <i className="bi bi-text-left" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                }}
                className={`toolbar-item spaced`}
                aria-label="Center Justify">
                <i className="bi bi-text-center" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                }}
                className={`toolbar-item spaced`}
                aria-label="Right Justify">
                <i className="bi bi-text-right" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
                }}
                className={`toolbar-item spaced`}
                aria-label="Justify Paragraph">
                <i className="bi bi-text-paragraph" />
            </button>
        </div>
    }

    function ListSection(){

        return <div className='w-auto h-auto'>
            <button
                onClick={() => {
                    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                }}
                className={`toolbar-item spaced`}
                aria-label="Justify Paragraph">
                <i className="bi bi-list-ol" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                }}
                className={`toolbar-item spaced`}
                aria-label="Justify Paragraph">
                <i className="bi bi-list-ul" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
                }}
                className={`toolbar-item spaced`}
                aria-label="Justify Paragraph">
                <i className="bi bi-list-check" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                }}
                className={`toolbar-item spaced`}
                aria-label="Remove List">
                <i className="bi bi-body-text" />
            </button>
        </div>
    }

    function HeadingsSection(){

        return <div className='w-auto h-auto'>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_HEADING_COMMAND, 'h1');
                }}
                className={`toolbar-item spaced`}
                aria-label="Heading 1">
                <i className="bi bi-type-h1" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_HEADING_COMMAND, 'h2');
                }}
                className={`toolbar-item spaced`}
                aria-label="Heading 2">
                <i className="bi bi-type-h2" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_HEADING_COMMAND, 'h3');
                }}
                className={`toolbar-item spaced`}
                aria-label="Heading 3">
                <i className="bi bi-type-h3" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_HEADING_COMMAND, 'h4');
                }}
                className={`toolbar-item spaced`}
                aria-label="Heading 4">
                <i className="bi bi-type-h4" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_HEADING_COMMAND, 'h5');
                }}
                className={`toolbar-item spaced`}
                aria-label="Heading 5">
                <i className="bi bi-type-h5" />
            </button>
        </div>
    }

    return <div className='toolbar d-flex flex-wrap'>
        {HistorySection()}
        <div style={{width: '1px', backgroundColor: '#eee', margin: '0 4px' }} />
        {FontOptionSection()}
        <div style={{width: '1px', backgroundColor: '#eee', margin: '0 4px' }} />
        {JustificationSection()}
        <div style={{width: '1px', backgroundColor: '#eee', margin: '0 4px' }} />
        {ListSection()}
        <div style={{width: '1px', backgroundColor: '#eee', margin: '0 4px' }} />
        {HeadingsSection()}
    </div>

}


