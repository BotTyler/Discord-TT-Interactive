import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import './RichText.css'
import { RichTextOptionEnum } from './RichTextOptions';
const RichTextInput = forwardRef(function RichTextInput({}:{}, ref: any){
    const rtiRef = useRef<HTMLDivElement>(null);
    const [startSelection, setStartSelection] = useState<Node | undefined>(undefined);
    const [endSelection, setEndSelection] = useState<Node | undefined>(undefined);

    useImperativeHandle(ref, () => {
        return {
            ApplyOption: (option: RichTextOptionEnum) => {
                if(!startSelection || !endSelection){
                    console.warn("no selection was made!!");
                    return;
                }
                //console.log(startSelection);
                //console.log(endSelection);

                if(!isEditorAvail()){
                    console.warn("Ref not init");
                    return;
                }


                // Depending on how the user selects text (Bottom-Up or Top-Down) the start and end will be flopped
                // We will need to apply some creative techniques to determine when to apply the style and when to not.
                let firstInstanceFound: boolean = false; // was one of the instance found
                let isFirstStart: boolean = false; // was the first found instance the startSelection

                const nodeList = rtiRef.current!.childNodes;
                console.log(nodeList);
                for(let index = 0; index < nodeList.length; index ++){
                    const current: Node = nodeList[index];
                    if(!firstInstanceFound){
                        // the first instance was not found check it here
                        // We will check if the current node is our first or last selection.
                        // Sounds odd but look at variable declaration for reason!!
                        if(current === startSelection){
                            firstInstanceFound = true;
                            isFirstStart = true;
                        }else if(current === endSelection){
                            firstInstanceFound = true;
                            isFirstStart = false;
                        }
                    }

                    if(firstInstanceFound){
                        // well we have the first instance so we should start editing the DOM
                        console.log("begin setting");
                        convertToOptionNode(current, option);

                        // make a check to determine if we should break out
                        if(isFirstStart){
                            // start was considered the first so the user used a top-bottom approach
                            if(current === endSelection) break;
                        }else{
                            // End was considered the first so the user used a bottom-up approach
                            if(current === startSelection) break;
                        }
                    }
                }

            }
        }
    });


    function convertToOptionNode(node: Node, option: RichTextOptionEnum){
        // Methods for the different option formatting
        function h1(data:Node):Node{
            const parent = document.createElement("div");
            const nNode = document.createElement("h1");
            for(let index = 0; index < data.childNodes.length; index ++){
                nNode.append(data.childNodes[index].cloneNode(true));
            }
            parent.append(nNode);
            return parent;
        }
        function h2(data:Node):Node{
            const parent = document.createElement("div");
            const nNode = document.createElement("h2");
            for(let index = 0; index < data.childNodes.length; index ++){
                nNode.append(data.childNodes[index].cloneNode(true));
            }
            parent.append(nNode);
            return parent;
        }
        function h3(data:Node):Node{
            const parent = document.createElement("div");
            const nNode = document.createElement("h3");
            for(let index = 0; index < data.childNodes.length; index ++){
                nNode.append(data.childNodes[index].cloneNode(true));
            }
            parent.append(nNode);
            return parent;
        }
        function h4(data:Node):Node{
            const parent = document.createElement("div");
            const nNode = document.createElement("h4");
            for(let index = 0; index < data.childNodes.length; index ++){
                nNode.append(data.childNodes[index].cloneNode(true));
            }
            parent.append(nNode);
            return parent;

        }
        function h5(data:Node):Node{
            const parent = document.createElement("div");
            const nNode = document.createElement("h5");
            for(let index = 0; index < data.childNodes.length; index ++){
                nNode.append(data.childNodes[index].cloneNode(true));
            }
            parent.append(nNode);
            return parent;

        }
        function ol(data:NodeList):Node{
            const nNode = document.createElement("ol");
            for(let index = 0; index < data.length; index++){
                const listItem: Node = document.createElement("li");
                listItem.appendChild(data[index]);
                nNode.append(listItem);
            }
            return nNode;

        }
        function ul(data:NodeList):Node{
            const nNode = document.createElement("ul");
            for(let index = 0; index < data.length; index++){
                const listItem: Node = document.createElement("li");
                listItem.appendChild(data[index]);
                nNode.append(listItem);
            }
            return nNode;

        }
        function c(data:Node):Node{
            const parent = document.createElement("div");
            const nNode = document.createElement("div");
            for(let index = 0; index < data.childNodes.length; index ++){
                nNode.append(data.childNodes[index].cloneNode(true));
            }
            nNode.className = "d-flex justify-content-center";
            parent.append(nNode);
            return parent;

        }
        function fs(data:Node):Node{
            const parent = document.createElement("div");
            const nNode = document.createElement("div");
            for(let index = 0; index < data.childNodes.length; index ++){
                nNode.append(data.childNodes[index].cloneNode(true));
            }
            nNode.className = "fs-1";
            parent.append(nNode);
            return parent;

        }

        // I will need to generate the new node and replace it with the old one.
        let replacementNode: Node | undefined = undefined;
        switch(option){
            case RichTextOptionEnum.H1:
                replacementNode = h1(node);
                break;
            case RichTextOptionEnum.H2:
                replacementNode = h2(node);
                break;
            case RichTextOptionEnum.H3:
                replacementNode = h3(node);
                break;
            case RichTextOptionEnum.H4:
                replacementNode = h4(node);
                break;
            case RichTextOptionEnum.H5:
                replacementNode = h5(node);
                break;
            case RichTextOptionEnum.OL:
                console.error("not implemented");
                return;
                break;
            case RichTextOptionEnum.UL:
                console.error("not implemented");
                return;
                break;
            case RichTextOptionEnum.C:
                replacementNode = c(node);
                break;
            case RichTextOptionEnum.FS:
                replacementNode = fs(node);
                break;
            default:
                // No valid option was given
                return;
        }
        // switch is done lets do the replacement
        if(replacementNode === undefined) return
        replaceNode(replacementNode, node);

        // if either the start or end selection was modified we need to make sure the selection is updated
        if(node === startSelection) setStartSelection(replacementNode);
        if(node === endSelection) setEndSelection(replacementNode);
    }

    function sanitizeRows(){
        if(!isEditorAvail()) return;
        for(let index = 0; index < rtiRef.current!.childNodes.length; index++){
            const currentNode:Node = rtiRef.current!.childNodes[index];
            if(currentNode.nodeName === "#text"){
                const nDiv = document.createElement("div");
                const text = document.createElement("p");
                text.append(currentNode.cloneNode(true));
                nDiv.appendChild(text);
                replaceNode(nDiv, currentNode);
            }
        }
    }

    function replaceNode(node: Node, replaceNode:Node){
        if(!isEditorAvail()) return;
        rtiRef.current!.replaceChild(node, replaceNode);
    }

    function getCursorSelection(){
        const selection = window.getSelection();
        if(!selection){
            // no selection was found
            return;
        }


        const range = selection.getRangeAt(0);

        // save the start and end selection for later use
        setStartSelection(range.startContainer.parentNode as Node);
        setEndSelection(range.endContainer.parentNode as Node);
    }

    function handleBlur(){
        sanitizeRows();
    }

    function handleInput(){
        getCursorSelection();
    }
    function handleSelection(){
        getCursorSelection();
    }

    function isEditorAvail():boolean{
        return rtiRef != null && rtiRef.current != null;
    }


    return <div className="h-100 container-fluid" contentEditable={true} onInput={handleInput} onBlur={handleBlur} onSelect={handleSelection} ref={rtiRef} />
});
export default RichTextInput;
