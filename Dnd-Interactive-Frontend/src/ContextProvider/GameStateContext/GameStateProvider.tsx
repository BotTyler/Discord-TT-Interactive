import { Enemy } from "../../../src/shared/Enemy";
import { GameStateEnum, MapMovementType } from "../../../src/shared/State";
import { MapData, MapFogPolygon } from "../../../src/shared/Map";
import React from "react";
import Error from "../../Pages/Error/Error";
import MainMenu from "../../Pages/MainMenu/MainMenu";
import PlayArea from "../../Pages/PlayArea/PlayArea";
import { usePlayers } from "../PlayersContext/PlayersContext";
import { useAuthenticatedContext } from "../useAuthenticatedContext";
import { GameMapContextHandler } from "./GameMapContextHandler";

export interface GameStateInterface {
  // map: MapData | undefined;
  // curHostId: string | undefined;
  // enemies: Record<string, Enemy>;
  getMap: () => MapData | undefined;
  getMapMovement: () => MapMovementType;
  getCurrentHostId(): string | undefined;
  getCurrentGameState: () => GameStateEnum;
  getEnemies: () => { [key: string]: Enemy };
  getEnemy: (id: string) => Enemy | undefined;
  getFogs: () => { [key: string]: MapFogPolygon };
  getFog: (id: string) => MapFogPolygon | undefined;
  getIconHeight: () => number;
  getInitiativeIndex: () => number;
  getGridColor: () => string;
  getGridShowing: () => boolean;
}
const GameStateContext = React.createContext<GameStateInterface>({
  getMap: (): MapData | undefined => {
    return undefined;
  },
  getMapMovement: (): MapMovementType => {
    return "free";
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
  getGridColor: () => {
    return "rgba(255, 255, 255, 0.7)"
  },
  getGridShowing: () => {
    return true;
  }
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
    //return <PlayArea />;
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
  const getMapMovement = (): MapMovementType => {
    if (gameStateContextRef.current == null) return "free";
    return gameStateContextRef.current.getMapMovement();
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
  const getGridColor = () => {
    if(gameStateContextRef.current == null) return "rgba(255, 255, 255, 0.7)";
    return gameStateContextRef.current.getGridColor();
  }
  const getGridShowing = () => {
    if(gameStateContextRef.current == null) return true;
    return gameStateContextRef.current.getGridShowing();
  }
  const providerValue: GameStateInterface = {
    getMap: getMap,
    getMapMovement: getMapMovement,
    getCurrentHostId: getCurrentHostId,
    getCurrentGameState: getGameState,
    getEnemies: getEnemies,
    getEnemy: getEnemy,
    getFogs: getFogs,
    getFog: getFog,
    getIconHeight: getIconHeight,
    getInitiativeIndex: getInitiativeIndex,
    getGridColor: getGridColor,
    getGridShowing: getGridShowing
  };
  return (
    <GameStateContext.Provider value={providerValue}>
      <GameMapContextHandler ref={gameStateContextRef} />
      {getGameStateNode(gamestate)}
    </GameStateContext.Provider>
  );
  // set a listener to update the value of the game state held on the server
}
