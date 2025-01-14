import { Ref, useRef } from "react";
import RichTextInput from "./RichTextInput";
import { RichTextOptionEnum, RichTextOptions } from "./RichTextOptions";

export function RichTextEditor(){
    const rtiRef:Ref<any> = useRef(null);

    return <div className="w-100 h-100 d-flex flex-column">
        <div className="h-auto w-100">
            <RichTextOptions OnOptionClick={(option: RichTextOptionEnum)=>{
                if(!rtiRef || !rtiRef.current) return
                rtiRef.current.ApplyOption(option);
            }} />
        </div>
        <div className="h-auto w-100" style={{flex: '1 1 auto'}}>
            <RichTextInput ref={rtiRef} />
        </div>


    </div>
}
