import { useEffect, useState } from "react";
import "./TextToInput.css";

export default function TextToInput<T>({ value, type, onSubmit }: { value: T; type: any; onSubmit: (val: string) => void }) {
  const [_value, setValue] = useState<any>(value);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleInputChange = (e: any) => {
    setValue(e.target.value);
  };

  const handleBlur = (): void => {
    onSubmit(_value);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      onSubmit(_value);
    }
  };
  return (
    <input
      className="text_to_input mx-2"
      type={type}
      value={_value}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        const target: any = e.target;
        target.select();
      }}
    />
  );
}
