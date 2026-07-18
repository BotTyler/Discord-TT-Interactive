import React, { useState } from "react";

export enum Tools {
  SELECT,
  MOVE,
  FOG,
  DELETE,
  VISIBILITY,
}

export function GameToolProvider({ children }: { children: React.ReactNode }) {
  const [tool, setTools] = useState(Tools.SELECT);
  const [startEventHandler, setStartEventHandler] = useState<Record<Tools, () => void>>({} as Record<Tools, () => void>);
  const [cancelEventHandler, setCancelEventHandler] = useState<Record<Tools, () => void>>({} as Record<Tools, () => void>);
  const [submitEventHandler, setSubmitEventHandler] = useState<Record<Tools, () => void>>({} as Record<Tools, () => void>);
  // const [a, setA] = useState<number[]>([0]);

  const setCurrentTools = (nTool: Tools) => {
    handleToolCancel(tool);
    handleToolStart(nTool);
    setTools(nTool);
    // setA((prev) => {
    //   return [...prev, prev[prev.length - 1] + 1];
    // });
  };

  const handleToolStart = (tool: Tools) => {
    const func = startEventHandler[tool];
    if (func !== undefined) func();
  };

  const handleToolSubmit = (tool: Tools) => {
    const func = submitEventHandler[tool];
    if (func !== undefined) func();
  };
  const handleCurrentTolSubmit = () => {
    handleToolSubmit(tool);
    setCurrentTools(Tools.SELECT);
  };

  const handleToolCancel = (tool: Tools) => {
    const func = cancelEventHandler[tool];
    if (func !== undefined) func();
  };

  const setStartHandler = (tool: Tools, callback: () => void) => {
    setStartEventHandler((prev) => {
      return { ...prev, [tool]: callback };
    });
  };
  const setSubmitHandler = (tool: Tools, callback: () => void) => {
    setSubmitEventHandler((prev) => {
      return { ...prev, [tool]: callback };
    });
  };
  const setCancelHandler = (tool: Tools, callback: () => void) => {
    setCancelEventHandler((prev) => {
      return { ...prev, [tool]: callback };
    });
  };

  return (
    <GameToolContext.Provider
      value={{
        setTool: setCurrentTools,
        curTool: tool,
        registerStartHandlers: setStartHandler,
        registerSubmitHandlers: setSubmitHandler,
        registerCancelHandlers: setCancelHandler,
        submitCurrentTool: handleCurrentTolSubmit,
      }}
    >
      {children}
    </GameToolContext.Provider>
  );
}

interface GameToolContextInterface {
  setTool: (tool: Tools) => void;
  curTool: Tools;
  registerStartHandlers: (tool: Tools, callback: () => void) => void;
  registerSubmitHandlers: (tool: Tools, callback: () => void) => void;
  registerCancelHandlers: (tool: Tools, callback: () => void) => void;
  submitCurrentTool: () => void;
}

const GameToolContext = React.createContext<GameToolContextInterface>({
  curTool: Tools.SELECT,
  setTool: (tool: Tools) => {
    console.log("not implemented yet");
  },
  registerStartHandlers: (tool: Tools, callback: () => void) => {
    console.log("not implemented yet");
  },
  registerSubmitHandlers: (tool: Tools, callback: () => void) => {
    console.log("not implemented yet");
  },
  registerCancelHandlers: (tool: Tools, callback: () => void) => {
    console.log("not implemented yet");
  },
  submitCurrentTool: () => {
    console.log("not implemented yet");
  },
});

export function useGameToolContext() {
  return React.useContext(GameToolContext);
}
