import { useEffect, useRef, useState } from "react";

export default function TextToInput({ value, type, onSubmit }: { value: string; type: string; onSubmit: (val: string) => void }) {
  const [isEditing, setEditing] = useState<boolean>(false);
  const [changeValue, setChangeValue] = useState<any>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setChangeValue(changeValue);
  }, [value]);

  useEffect(() => {
    if (inputRef.current == null) return;
    if (!isEditing) return;
    inputRef.current.focus();
  }, [isEditing]);

  const handleInputChange = (e: any) => {
    setChangeValue(e.target.value);
  };

  const handleBlur = () => {
    setEditing(false);
    onSubmit(changeValue);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      setEditing(false);
      onSubmit(changeValue);
    }
  };
  return (
    <div className="w-100 h-100 position-relative">
      {isEditing ? (
        <input ref={inputRef} type={type} value={changeValue} onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-100 position-absolute" style={{ top: 0, left: 0 }} />
      ) : (
        <p
          className="text-center"
          onClick={() => {
            setEditing(true);
          }}
        >
          {value}
        </p>
      )}
    </div>
  );
}
