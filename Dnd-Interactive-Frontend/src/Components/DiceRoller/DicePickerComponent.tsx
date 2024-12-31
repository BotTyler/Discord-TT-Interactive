import { useState } from "react";
import DiceComponent from "./DiceComponent";

/**
 * This component is mainly going to handle all functions of a dice picker except placement.
 * This component will display all dice types, the amount of dice wanting to be thrown, a throw button, and adv and disadv throws.
 */
export default function DicePickerComponent({ startRoll }: { startRoll: (notation: string[]) => void }) {
    const [d4Count, setD4Count] = useState<number>(0);
    const [d6Count, setD6Count] = useState<number>(0);
    const [d8Count, setD8Count] = useState<number>(0);
    const [d100Count, setD100Count] = useState<number>(0);
    const [d10Count, setD10Count] = useState<number>(0);
    const [d12Count, setD12Count] = useState<number>(0);
    const [d20Count, setD20Count] = useState<number>(0);

    const [isShowing, setShowing] = useState<boolean>(false);

    const hasSelection = (): boolean => {
        if (d4Count > 0) return true;
        if (d6Count > 0) return true;
        if (d8Count > 0) return true;
        if (d100Count > 0) return true;
        if (d10Count > 0) return true;
        if (d12Count > 0) return true;
        if (d20Count > 0) return true;

        return false;
    }

    const getNotation = (type: string, count: number): string | undefined => {
        if (count <= 0) return undefined;
        return `${count}${type}`
    }

    const resetDice = () => {
        setD4Count(0);
        setD6Count(0);
        setD8Count(0);
        setD100Count(0);
        setD10Count(0);
        setD12Count(0);
        setD20Count(0);
    }

    return (
        <div className="w-100 h-100">
            {/* Dice Selector Button (Open and Close) */}
            <div className="btn-group dropend position-relative">
                {/* <button type="button" className="btn btn-secondary dropdown-toggle" onClick={() => { setShowing(prev => { return !prev }) }}>
                    Dropend
                </button> */}
                {hasSelection() ? <button type="button" className="btn btn-primary" onClick={() => {
                    // get the notation of all objects
                    const notationArray: string[] = [];
                    const listOfDice: { diceCount: number, diceType: string }[] = [
                        { diceCount: d4Count, diceType: 'd4' },
                        { diceCount: d6Count, diceType: 'd6' },
                        { diceCount: d8Count, diceType: 'd8' },
                        { diceCount: d100Count, diceType: 'd100' },
                        { diceCount: d10Count, diceType: 'd10' },
                        { diceCount: d12Count, diceType: 'd12' },
                        { diceCount: d20Count, diceType: 'd20' },
                    ]

                    listOfDice.forEach((val) => {
                        const notation = getNotation(val.diceType, val.diceCount);
                        if (notation === undefined) return;
                        notationArray.push(notation);
                    })
                    setShowing(false);
                    resetDice();
                    startRoll(notationArray);
                }}>Roll</button> : ''}
                <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split" onClick={() => { setShowing(prev => { return !prev }) }}>
                    <span className="visually-hidden">Toggle Dropdown</span>
                </button>
                <ul className={`dropdown-menu position-absolute p-1${isShowing ? 'show d-flex ms-1' : ''}`} style={{ left: '110%', bottom: '0', background: 'transparent', border: 'none' }}>
                    <DiceComponent onClick={(val: number) => {
                        setD4Count((prev) => {
                            let v = prev + val;
                            if (v < 0) v = 0;
                            return v;
                        })
                    }}
                        value={d4Count}
                        key={`DiceComponent-d4-${d4Count}`}
                    >
                        d4
                    </DiceComponent>
                    <DiceComponent onClick={(val: number) => {
                        setD6Count((prev) => {
                            let v = prev + val;
                            if (v < 0) v = 0;
                            return v;
                        })
                    }}
                        value={d6Count}
                        key={`DiceComponent-d6-${d6Count}`}
                    >
                        d6
                    </DiceComponent>
                    <DiceComponent onClick={(val: number) => {
                        setD8Count((prev) => {
                            let v = prev + val;
                            if (v < 0) v = 0;
                            return v;
                        })
                    }}
                        value={d8Count}
                        key={`DiceComponent-d8-${d8Count}`}>
                        d8
                    </DiceComponent>
                    <DiceComponent onClick={(val: number) => {
                        setD100Count((prev) => {
                            let v = prev + val;
                            if (v < 0) v = 0;
                            return v;
                        })
                    }}
                        value={d100Count}
                        key={`DiceComponent-d100-${d100Count}`}>
                        d100
                    </DiceComponent>
                    <DiceComponent onClick={(val: number) => {
                        setD10Count((prev) => {
                            let v = prev + val;
                            if (v < 0) v = 0;
                            return v;
                        })
                    }}
                        value={d10Count}
                        key={`DiceComponent-d10-${d10Count}`}>
                        d10
                    </DiceComponent>
                    <DiceComponent onClick={(val: number) => {
                        setD12Count((prev) => {
                            let v = prev + val;
                            if (v < 0) v = 0;
                            return v;
                        })
                    }}
                        value={d12Count}
                        key={`DiceComponent-d12-${d12Count}`}>
                        d12
                    </DiceComponent>
                    <DiceComponent onClick={(val: number) => {
                        setD20Count((prev) => {
                            let v = prev + val;
                            if (v < 0) v = 0;
                            return v;
                        })
                    }}
                        value={d20Count}
                        key={`DiceComponent-d20-${d20Count}`}>
                        d20
                    </DiceComponent>
                </ul>
            </div>
            {/* {hasSelection() ? <p>I HAVE A SELECTION ROLLLLLLL!!!</p> : ''} */}
        </div>
    )
}