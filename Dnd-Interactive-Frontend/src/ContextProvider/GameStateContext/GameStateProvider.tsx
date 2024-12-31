import React from "react";
import { GameStateEnum } from "dnd-interactive-shared";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import MainMenu from "../../Pages/MainMenu/MainMenu";
import PlayArea from "../../Pages/PlayArea/PlayArea";
import { usePlayers } from "../PlayersContext/PlayersContext";
import Error from "../../Pages/Error/Error";
import { MapData, MapFogPolygon } from "dnd-interactive-shared";
import { Enemy } from "dnd-interactive-shared";
import { GameMapContextHandler } from "./GameMapContextHandler";

export interface GameStateInterface {
  // map: MapData | undefined;
  // curHostId: string | undefined;
  // enemies: Record<string, Enemy>;
  getMap: () => MapData | undefined;
  getCurrentHostId(): string | undefined;
  getCurrentGameState: () => GameStateEnum;
  getEnemies: () => { [key: string]: Enemy };
  getEnemy: (id: string) => Enemy | undefined;
  getFogs: () => { [key: string]: MapFogPolygon };
  getFog: (id: string) => MapFogPolygon | undefined;
  getIconHeight: () => number;
  getInitiativeIndex: () => number;
}
const GameStateContext = React.createContext<GameStateInterface>({
  getMap: (): MapData | undefined => {
    return undefined;
  },
  getCurrentHostId: (): string | undefined => {
    return undefined;
  },
  getCurrentGameState: (): GameStateEnum => {
    return GameStateEnum.MAINMENU;
  },
  getEnemies: (): { [key: string]: Enemy } => {
    return {};
  },
  getEnemy: (id: string): Enemy | undefined => {
    return undefined;
  },
  getFogs: () => {
    return {};
  },
  getFog: (id: string) => {
    return undefined;
  },
  getIconHeight: () => {
    return 0;
  },
  getInitiativeIndex: () => {
    return 0;
  },
});

export function useGameState() {
  return React.useContext(GameStateContext);
}
export function GameStateContextProvider() {
  // Use the authenticated context of the user
  const authenticatedContext = useAuthenticatedContext();
  const playerContext = usePlayers();
  const gameStateContextRef = React.useRef<any>(null);
  const [isGamestateRefReady, setGamestateRefReady] = React.useState<boolean>(false);
  const [gamestate, setGamestate] = React.useState<GameStateEnum>(GameStateEnum.MAINMENU); // yes
  React.useEffect(() => {
    const handleGamestateChange = (value: any) => {
      setGamestate(value.detail.val);
    };

    window.addEventListener(`ChangeGameState`, handleGamestateChange);
    return () => {
      window.removeEventListener(`ChangeGameState`, handleGamestateChange);
    };
  }, []);

  React.useEffect(() => {
    setGamestateRefReady(gameStateContextRef.current != null);
  }, [gameStateContextRef, gameStateContextRef.current]);

  function getGameStateNode(gameState: GameStateEnum) {
    if (!isGamestateRefReady) {
      return <p>Loading Gamestate</p>;
    }
    const player = playerContext.getPlayer(authenticatedContext.user.id);
    if (!player) return <p>not authenticated</p>;
    switch (gameState) {
      case GameStateEnum.MAINMENU:
        return <MainMenu />;
      case GameStateEnum.ALLPLAY:
        return <PlayArea />;
      case GameStateEnum.HOSTPLAY:
        if (player.isHost) return <PlayArea />;
        else return <MainMenu />;
      default:
        return <Error />;
    }
  }

  const getMap = (): MapData | undefined => {
    if (gameStateContextRef.current == null) return undefined;
    return gameStateContextRef.current.getMap();
  };
  const getCurrentHostId = (): string | undefined => {
    if (gameStateContextRef.current == null) return undefined;
    return gameStateContextRef.current.getCurrentHostId();
  };
  const getGameState = (): GameStateEnum => {
    if (gameStateContextRef.current == null) return GameStateEnum.MAINMENU;
    return gameStateContextRef.current.getCurrentGameState();
  };
  const getEnemies = (): { [key: string]: Enemy } => {
    if (gameStateContextRef.current == null) return {};
    return gameStateContextRef.current.getEnemies();
  };
  const getEnemy = (id: string): Enemy | undefined => {
    if (gameStateContextRef.current == null) return undefined;
    return gameStateContextRef.current.getEnemy(id);
  };
  const getFogs = (): { [key: string]: MapFogPolygon } => {
    if (gameStateContextRef.current == null) return {};
    return gameStateContextRef.current.getFogs();
  };
  const getFog = (id: string): MapFogPolygon | undefined => {
    if (gameStateContextRef.current == null) return undefined;
    return gameStateContextRef.current.getFog(id);
  };
  const getIconHeight = () => {
    if (gameStateContextRef.current == null) return 0;
    return gameStateContextRef.current.getIconHeight();
  };
  const getInitiativeIndex = () => {
    if (gameStateContextRef.current == null) return 0;
    return gameStateContextRef.current.getInitiativeIndex();
  };
  const providerValue: GameStateInterface = {
    getMap: getMap,
    getCurrentHostId: getCurrentHostId,
    getCurrentGameState: getGameState,
    getEnemies: getEnemies,
    getEnemy: getEnemy,
    getFogs: getFogs,
    getFog: getFog,
    getIconHeight: getIconHeight,
    getInitiativeIndex: getInitiativeIndex,
  };
  return (
    <GameStateContext.Provider value={providerValue}>
      <GameMapContextHandler ref={gameStateContextRef} />
      {getGameStateNode(gamestate)}
    </GameStateContext.Provider>
  );
  // set a listener to update the value of the game state held on the server
}
