import { Form } from "react-bootstrap";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { MapMovementType } from "../../../../shared/State";
import { throttle } from "lodash";

export default function SettingsPanel() {
    const gameStateContext = useGameState();
    const authContext = useAuthenticatedContext();

    const [movementType, setMovementType] = useState<MapMovementType>(gameStateContext.getMapMovement())
    const [gridColor, setGridColor] = useState<string>(gameStateContext.getGridColor());
    const [gridShowing, setGridShowing] = useState<boolean>(gameStateContext.getGridShowing());

    useEffect(() => {
        const handleMovementTypeChange = (value: any) => {
            setMovementType(value.detail.val);
        }

        const handleGridDisplayChange = (value: any) => {
            setGridShowing(value.detail.val);
        }
        const handleGridColorChange = (value: any) => {
            setGridColor(value.detail.val);
        }

        window.addEventListener("MapMovementChanged", handleMovementTypeChange);
        window.addEventListener("GridDisplayChange", handleGridDisplayChange);
        window.addEventListener("GridColorChange", handleGridColorChange);
        return () => {
            window.removeEventListener("MapMovementChanged", handleMovementTypeChange);
            window.removeEventListener("GridDisplayChange", handleGridDisplayChange);
            window.removeEventListener("GridColorChange", handleGridColorChange);
        }
    }, [])

    const ChangeMovementType = (movementType: MapMovementType) => {
        authContext.room.send("SetMapMovementType", { mapMovement: movementType });
    }

    const sendGridColorChange = useCallback(throttle((value: any) => {
        authContext.room.send("ChangeGridColor", { gridColor: hexToRgba(value, 0.8) });
    }, 100), []);

    const sendGridShowingChange = useCallback(throttle((value: any) => {
        const newChecked: boolean = value.target.checked;
        authContext.room.send("GridDisplay", { gridShowing: newChecked });
    }, 100), []);

    function hexToRgba(hex: string, alpha = 1): string {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    function rgbaToHex(colorStr: string, forceRemoveAlpha: boolean = false) {
        // Use the second code block for the case when '/' is not present
        return (
            '#' +
            colorStr
                .replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
                .split(',') // splits them at ","
                .filter((string, index) => !forceRemoveAlpha || index !== 3)
                .map(string => parseFloat(string)) // Converts them to numbers
                .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
                .map(number => number.toString(16)) // Converts numbers to hex
                .map(string => (string.length === 1 ? '0' + string : string)) // Adds 0 when length of one number is 1
                .join('')
        )
    }
    return (
        <div className="container-fluid h-100">
            <table>
                <thead>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            MovementType
                        </td>
                        <td>
                            <Form.Select defaultValue={movementType} aria-label="Default select example"
                                onInput={(event: FormEvent<HTMLSelectElement>) => {
                                    ChangeMovementType(event.currentTarget.value as MapMovementType);
                                }}>
                                <option value="free">Free Movement</option>
                                <option value="grid">Grid Movement</option>
                            </Form.Select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Grid Color
                        </td>
                        <td>
                            <div className="d-flex">
                                <input type="color" value={rgbaToHex(gridColor, true)} onChange={(e: any) => { sendGridColorChange(e.target.value) }} />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Grid Show
                        </td>
                        <td>
                            <input type="checkbox" checked={gridShowing} onChange={(e: any) => { sendGridShowingChange(e) }} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
