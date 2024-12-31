/**
 * Bootstrap Toast component that will display to the screen in the bottom right corner
 */
export default function Toast({ message, title, callback }: { message: string; title: string; callback: Function }) {
  return (
    <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header">
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
