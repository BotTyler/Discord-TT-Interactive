import { DrawingTools, useDrawingGameToolContext } from "../../../ContextProvider/GameDrawingProvider";

export default function DrawingToolbar() {
  const toolContext = useDrawingGameToolContext();
  return (
    <div className="w-100 h-100 d-flex">
      <div className="btn-group-vertical" role="group">
        <button
          type="button"
          className={`btn btn-secondary ${toolContext.curTool === DrawingTools.FREE ? "active" : ""}`}
          onClick={() => {
            toolContext.setTool(DrawingTools.FREE);
          }}
        >
          <i className="bi bi-pencil-fill fs-3" />
        </button>
        <button
          type="button"
          className={`btn btn-secondary ${toolContext.curTool === DrawingTools.CIRCLE ? "active" : ""}`}
          onClick={() => {
            toolContext.setTool(DrawingTools.CIRCLE);
          }}
        >
          <i className="bi bi-circle fs-3"></i>
        </button>
        <button
          type="button"
          className={`btn btn-secondary ${toolContext.curTool === DrawingTools.ARC ? "active" : ""}`}
          onClick={() => {
            toolContext.setTool(DrawingTools.ARC);
          }}
        >
          <i className="bi bi-caret-left fs-3"></i>
        </button>
        <button
          type="button"
          className={`btn btn-secondary ${toolContext.curTool === DrawingTools.CUBE ? "active" : ""}`}
          onClick={() => {
            toolContext.setTool(DrawingTools.CUBE);
          }}
        >
          <i className="bi bi-bounding-box-circles fs-3"></i>
        </button>
      </div>
    </div>
  );
}
