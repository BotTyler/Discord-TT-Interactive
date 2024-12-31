import React from "react";

export default function DiceComponent({ children, value, onClick }: { children: React.ReactNode; value: number; onClick: (val: number) => void }, ref: any) {
  return (
    <div className="position-relative">
      <button
        className={`mx-2`}
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "50%",
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onClick(-1);
        }}
        onClick={() => {
          onClick(1);
        }}
      >
        {children}
      </button>
      {value > 0 ? (
        <div className="position-absolute d-flex justify-content-center align-items-center" style={{ top: "-30%", right: "-10%", zIndex: 1111, background: "#514f4f", border: "1px solid black", borderRadius: "50%", aspectRatio: "1", textAlign: "center", width: "30px", height: "30px", color: "white" }}>
          <p className="p-0 m-0">{value}</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
