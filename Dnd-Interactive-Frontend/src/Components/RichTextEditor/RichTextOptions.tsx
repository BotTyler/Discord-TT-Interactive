import './RichText.css'
export function RichTextOptions({ OnOptionClick }:{OnOptionClick: (option:RichTextOptionEnum) => void }){

    return <div className="container-fluid flex-wrap" id="RichTextOptions">
        {/** Header Options **/}
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.H1)}}>H1</button>
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.H2)}}>H2</button>
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.H3)}}>H3</button>
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.H4)}}>H4</button>
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.H5)}}>H5</button>
        <hr style={{margin: '5px'}} />
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.OL)}}>OL</button>
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.UL)}}>UL</button>
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.C)}}>C</button>
        <button onClick={()=>{OnOptionClick(RichTextOptionEnum.FS)}}>FS</button>
    </div>
}


export enum RichTextOptionEnum{
    H1, H2, H3, H4, H5, OL, UL, C, FS
}
