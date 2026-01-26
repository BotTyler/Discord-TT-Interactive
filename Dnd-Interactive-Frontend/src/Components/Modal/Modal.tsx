import React, { useState } from "react";
/**
 * Component that utilizes bootstrap modal to display information to the user.
 */
export default function Modal({ Title, children, closeCallback, submitCallback }: { Title: string; children: React.ReactNode; closeCallback: () => void; submitCallback: () => void }) {
  const calcMaxHeight = () => {
    const windowHeight = window.innerHeight;
    const maxHeight = windowHeight * 0.50;
    return maxHeight;
  };

  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" tabIndex={-1} style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{Title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => {
                  closeCallback();
                }}
                disabled={isSubmitting}
              ></button>
            </div>
            <div className="modal-body overflow-auto" style={{ maxHeight: calcMaxHeight() }}>
              {children}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  closeCallback();
                }}
                disabled={isSubmitting}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSubmitting(true);
                  submitCallback();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
