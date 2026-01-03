import { useState } from "react";

export default function HealthComponent({ name, health, totalHealth, HealthClick, DamageClick }: { name: string, health: number; totalHealth: number; HealthClick: (val: number) => void; DamageClick: (val: number) => void }) {
  return (
    <div className="w-100 h-100 row g-0 p-0 m-0 gap-0">
      {/* HP values */}
      <div className="col-7 d-flex flex-column justify-content-center align-items-center fs-6 border-start border-end">
        <p className="m-0">{name}</p>
        <p className="m-0">{health} / {totalHealth}</p>
      </div>
      {/* HP/Dmg Input */}
      <div className="col-5">
        <HealDamageComponent HealthClick={HealthClick} DamageClick={DamageClick} />
      </div>
    </div>
  );
}


export function HealDamageComponent({ HealthClick, DamageClick }: { HealthClick: (val: number) => void; DamageClick: (val: number) => void }) {
  const [inputValue, setInputValue] = useState<number>(0);
  return (
    <div className="w-100 h-100 d-flex flex-column">
      <button
        className="btn btn-success w-100 rounded-0"
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
        className="w-100 flex-grow-1"
        onClick={(e) => {
          const target: any = e.target;
          target.select();
        }}
        onChange={(e) => {
          setInputValue(+e.target.value);
        }}
      />
      <button
        className="btn btn-danger w-100 rounded-0"
        style={{ fontSize: "small" }}
        onClick={() => {
          DamageClick(inputValue);
          setInputValue(0);
        }}
      >
        Damage
      </button>
    </div>
  );
}
