import { useEffect, useMemo, useState } from "react";
import { useGameState } from "../../../ContextProvider/GameStateContext/GameStateProvider";
import { MapData } from "../../../shared/Map";
import { Polyline } from "react-leaflet";

export default function GridDisplay() {
    const gameStateContext = useGameState();

    const [iconSize, setIconSize] = useState<number>(gameStateContext.getIconHeight());
    const [mapHeight, setMapHeight] = useState<number>(0)
    const [mapWidth, setMapWidth] = useState<number>(0);
    const [showGrid, setShowGrid] = useState<boolean>(gameStateContext.getGridShowing());
    const [gridColor, setGridColor] = useState<string>(gameStateContext.getGridColor());

    useEffect(() => {
        const mapData: MapData | null = gameStateContext.getMap();
        if (mapData === null) return;
        setMapWidth(mapData.width);
        setMapHeight(mapData.height);
    }, [])

    useEffect(() => {
        const handleIconSizeChange = (val: any) => {
            setIconSize(val.detail.val);
        }
        const handleMapUpdate = (value: any) => {
            const mapData: MapData | null = value.detail.val as MapData;
            if (mapData === null) return;
            setMapWidth(mapData.width);
            setMapHeight(mapData.height);
        }
        const handleGridDisplayChange= (value: any)=>{
            setShowGrid(value.detail.val);
        }
        const handleGridColorChange = (value: any)=>{
            setGridColor(value.detail.val);
        }

        window.addEventListener("IconHeightChanged", handleIconSizeChange);
        window.addEventListener(`MapUpdate`, handleMapUpdate);
        window.addEventListener("GridDisplayChange", handleGridDisplayChange);
        window.addEventListener("GridColorChange", handleGridColorChange);
        return () => {
            window.removeEventListener("IconHeightChanged", handleIconSizeChange);
            window.removeEventListener(`MapUpdate`, handleMapUpdate);
            window.removeEventListener("GridDisplayChange", handleGridDisplayChange);
            window.removeEventListener("GridColorChange", handleGridColorChange);
        }
    }, []);

    const generateLines = useMemo(() => {
        const gridLines: JSX.Element[] = [];
        const gridWeight: number = 1;

        // Generate the vertical lines
        for (let widthIndex = 0; widthIndex < mapWidth; widthIndex += iconSize) {
            gridLines.push(
                <Polyline positions={[
                    [0, widthIndex],
                    [mapHeight, widthIndex]
                ]} key={`GridLine-W-${widthIndex}`} pathOptions={{ color: gridColor, weight: gridWeight }} />
            )
        }

        // Generate teh horizontal lines
        for (let heightIndex = 0; heightIndex < mapHeight; heightIndex += iconSize) {
            gridLines.push(
                <Polyline positions={[
                    [heightIndex, 0],
                    [heightIndex, mapWidth]
                ]} key={`GridLine-H-${heightIndex}`} pathOptions={{ color: gridColor, weight: gridWeight }} />
            )
        }

        return gridLines;
    }, [iconSize, mapWidth, mapHeight, gridColor]);


    return (
        <>
            {showGrid ? generateLines : ""}
        </>
    )
}
