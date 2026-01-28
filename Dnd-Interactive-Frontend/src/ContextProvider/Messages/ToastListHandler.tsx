import React, { forwardRef, useImperativeHandle } from "react";
import Toast, { TOAST_LEVEL } from "./Toast";

export const ToastListHandler = forwardRef(function ToastListHandler({ }: {}, ref: any) {
  const [toast, setToast] = React.useState<{ title: string; message: string, level: TOAST_LEVEL, id: string }[]>([]);
  useImperativeHandle(ref, () => ({
    addToast(title: string, message: string, level: TOAST_LEVEL) {
      setToast((prev) => {
        const id: string = crypto.randomUUID();
        return [...prev, { title, message, level, id }];
      });
    },
  }));

  return (
    <div className="toast-container bottom-0 end-0">
      {toast.map((val) => {
        return (
          <Toast
            key={`ToastIndex-${val.id}`}
            message={val.message}
            title={val.title}
            level={val.level}
            callback={() => {
              setToast((prev) => {
                return prev.filter((item) => val.id !== item.id);
              });
            }}
          />
        );
      })}
    </div>
  );
});
