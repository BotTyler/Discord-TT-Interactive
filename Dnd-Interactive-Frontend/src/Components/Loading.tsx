import { useEffect, useState } from "react";

export default function Loading() {
  const [dots, setdots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setdots((dots) => {
        if (dots.length >= 3) return "";
        else return dots + ".";
      });
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="container-fluid h-100 p-0 g-0 bg-dark text-light d-flex align-items-center justify-content-center user-select-none fs-1">
      <p>Loading{dots}</p>
    </div>
  );
}
