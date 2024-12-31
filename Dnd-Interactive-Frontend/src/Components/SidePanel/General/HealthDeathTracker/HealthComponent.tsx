import { useState } from "react";

export default function HealthComponent({ health, totalHealth, HealthClick, DamageClick }: { health: number; totalHealth: number; HealthClick: (val: number) => void; DamageClick: (val: number) => void }) {
  return (
    <div className="w-100 row">
      {/* HP/Dmg Input */}
      <div className="col-5">
        <HealDamageComponent HealthClick={HealthClick} DamageClick={DamageClick} />
      </div>
      {/* HP values */}
      <div className="col-7 d-flex justify-content-center align-items-center row">
        <div className="col-5">
          <p className="m-0">Current</p>
          <p className="m-0">{health}</p>
        </div>
        <div className="col-2">
          <p className="m-0"></p>
          <p className="m-0">/</p>
        </div>
        <div className="col-5">
          <p className="m-0">Total</p>
          <p className="m-0">{totalHealth}</p>
        </div>
      </div>
    </div>
  );
}

export function HealDamageComponent({ HealthClick, DamageClick }: { HealthClick: (val: number) => void; DamageClick: (val: number) => void }) {
  const [inputValue, setInputValue] = useState<number>(0);
  return (
    <>
      <button
        className="btn btn-success w-100 p-0"
        style={{ fontSize: "small" }}
        onClick={() => {
          HealthClick(inputValue);
          setInputValue(0);
        }}
      >
        Heal
      </button>
      <input
        type="number"
        value={inputValue}
        className="w-100"
        onChange={(e) => {
          setInputValue(+e.target.value);
        }}
      />
      <button
        className="btn btn-danger w-100 p-0"
        style={{ fontSize: "small" }}
        onClick={() => {
          DamageClick(inputValue);
          setInputValue(0);
        }}
      >
        Damage
      </button>
    </>
  );
}
