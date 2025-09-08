import { Form } from "react-bootstrap";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";
import { useGameState } from "../../../../ContextProvider/GameStateContext/GameStateProvider";
import { FormEvent, useEffect, useState } from "react";
import { MapMovementType } from "../../../../shared/State";

export default function SettingsPanel() {
    const gameStateContext = useGameState();
    const authContext = useAuthenticatedContext();

    const [movementType, setMovementType] = useState<MapMovementType>(gameStateContext.getMapMovement())

    useEffect(() => {
        const handleMovementTypeChange = (value: any) => {
            setMovementType(value.detail.val);
        }

        window.addEventListener("MapMovementChanged", handleMovementTypeChange);
        return () => {
            window.removeEventListener("MapMovementChanged", handleMovementTypeChange);
        }
    }, [])

    const ChangeMovementType = (movementType: MapMovementType) => {
        authContext.room.send("SetMapMovementType", { mapMovement: movementType });
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
            </tbody>
        </table>
    </div>
  );
}
