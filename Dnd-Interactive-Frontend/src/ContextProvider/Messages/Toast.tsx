import { useEffect } from "react";
import "./Toast.css"

export enum TOAST_LEVEL {
  NONE,
  SUCCES,
  WARNING,
  ERROR
}

/**
 * Bootstrap Toast component that will display to the screen in the bottom right corner
 */
export default function Toast({ message, title, level, callback }: { message: string; title: string; level: TOAST_LEVEL, callback: Function }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      callback();
    }, 5000);

    // cleanup (important!)
    return () => clearTimeout(timer);
  }, []);

  function getToastLevelString() {
    switch (level) {
      case TOAST_LEVEL.SUCCES:
        return "success"
      case TOAST_LEVEL.WARNING:
        return "warning"
      case TOAST_LEVEL.ERROR:
        return "error"
      default:
        return "";
    }
  }
  return (
    <div className={`toast show custom-toast toast-level-${getToastLevelString()}`} role="alert" aria-live="assertive" aria-atomic="true" >
      <div className={`toast-header toast-level-${getToastLevelString()}-header`}>
        <strong className="me-auto">{title}</strong>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={() => {
            callback();
          }}
        ></button>
      </div>
      <div className="toast-body overflow-y-auto" style={{ maxHeight: "300px" }}>
        {message}
      </div>
    </div>
  );
}
