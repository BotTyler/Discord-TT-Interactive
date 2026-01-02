import React, { useState } from "react";

export enum DrawingTools {
  FREE,
  CIRCLE,
  ARC,
  CUBE,
  BEAM,
}

export function GameDrawingProvider({ children }: { children: React.ReactNode }) {
  const [tool, setTools] = useState(DrawingTools.FREE);
  const [startEventHandler, setStartEventHandler] = useState<Record<DrawingTools, Function>>({} as Record<DrawingTools, Function>);
  const [cancelEventHandler, setCancelEventHandler] = useState<Record<DrawingTools, Function>>({} as Record<DrawingTools, Function>);
  const [submitEventHandler, setSubmitEventHandler] = useState<Record<DrawingTools, Function>>({} as Record<DrawingTools, Function>);
  // const [a, setA] = useState<number[]>([0]);

  const setCurrentTools = (nTool: DrawingTools) => {
    handleToolCancel(tool);
    handleToolStart(nTool);
    setTools(nTool);
    // setA((prev) => {
    //   return [...prev, prev[prev.length - 1] + 1];
    // });
  };

  const handleToolStart = (tool: DrawingTools) => {
    const func = startEventHandler[tool];
    if (func !== undefined) func();
  };

  const handleToolSubmit = (tool: DrawingTools) => {
    const func = submitEventHandler[tool];
    if (func !== undefined) func();
  };
  const handleCurrentTolSubmit = () => {
    handleToolSubmit(tool);
    setCurrentTools(DrawingTools.FREE);
  };

  const handleToolCancel = (tool: DrawingTools) => {
    const func = cancelEventHandler[tool];
    if (func !== undefined) func();
  };

  const setStartHandler = (tool: DrawingTools, callback: Function) => {
    setStartEventHandler((prev) => {
      return { ...prev, [tool]: callback };
    });
  };
  const setSubmitHandler = (tool: DrawingTools, callback: Function) => {
    setSubmitEventHandler((prev) => {
      return { ...prev, [tool]: callback };
    });
  };
  const setCancelHandler = (tool: DrawingTools, callback: Function) => {
    setCancelEventHandler((prev) => {
      return { ...prev, [tool]: callback };
    });
  };

  return (
    <GameDrawingToolContext.Provider
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
    </GameDrawingToolContext.Provider>
  );
}

interface GameDrawingToolContextInterface {
  setTool: (tool: DrawingTools) => void;
  curTool: DrawingTools;
  registerStartHandlers: (tool: DrawingTools, callback: Function) => void;
  registerSubmitHandlers: (tool: DrawingTools, callback: Function) => void;
  registerCancelHandlers: (tool: DrawingTools, callback: Function) => void;
  submitCurrentTool: () => void;
}

const GameDrawingToolContext = React.createContext<GameDrawingToolContextInterface>({
  curTool: DrawingTools.FREE,
  setTool: (tool: DrawingTools) => {
    console.log("not implemented yet");
  },
  registerStartHandlers: (tool: DrawingTools, callback: Function) => {
    console.log("not implemented yet");
  },
  registerSubmitHandlers: (tool: DrawingTools, callback: Function) => {
    console.log("not implemented yet");
  },
  registerCancelHandlers: (tool: DrawingTools, callback: Function) => {
    console.log("not implemented yet");
  },
  submitCurrentTool: () => {
    console.log("not implemented yet");
  },
});

export function useDrawingGameToolContext() {
  return React.useContext(GameDrawingToolContext);
}
