import React, { forwardRef, useImperativeHandle } from "react";
import Toast from "./Toast";

export const ToastListHandler = forwardRef(function ToastListHandler({ }: {}, ref: any) {
  const [toast, setToast] = React.useState<{ title: string; message: string }[]>([]);
  useImperativeHandle(ref, () => ({
    addToast(title: string, message: string) {
      setToast((prev) => {
        return [...prev, { title, message }];
      });
    },
  }));

  return (
    <div className="toast-container bottom-0 end-0">
      {toast.map((val, index) => {
        return (
          <Toast
            key={`ToastIndex-${index}`}
            message={val.message}
            title={val.title}
            callback={() => {
              setToast((prev) => {
                return prev.filter((item, _Index) => _Index !== index);
              });
            }}
          />
        );
      })}
    </div>
  );
});
