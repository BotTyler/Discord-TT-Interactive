import { useState } from "react";
import TextToInput from "../../../TextToInput/TextToInput";

export default function HealthComponent(
  { name, health, totalHealth, HealthClick, DamageClick, HealthChange, TotalHealthChange }:
    {
      name: string,
      health: number;
      totalHealth: number;
      HealthClick: (val: number) => void;
      DamageClick: (val: number) => void;
      HealthChange: (val: number) => void;
      TotalHealthChange: (val: number) => void;
    }
) {
  return (
    <div className="w-100 h-100 row g-0 p-0 m-0 gap-0">
      {/* HP values */}
      <div className="col-8 d-flex flex-column justify-content-center align-items-center fs-6 border-start border-end">
        <p className="m-0">{name}</p>
        <div className="overflow-hidden w-100 d-flex justify-content-center">
          <TextToInput type="number" value={health} onSubmit={(val: string): void => {
            HealthChange!(+val);
          }} />
          <p className="h-100 m-0 fs-5">/</p>
          <TextToInput type="number" value={totalHealth} onSubmit={(val: string): void => {
            TotalHealthChange!(+val);
          }} />
        </div>
      </div>
      {/* HP/Dmg Input */}
      <div className="col-4">
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
        className="btn btn-success w-100 rounded-0 p-1"
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
        className="btn btn-danger w-100 rounded-0 p-1"
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
