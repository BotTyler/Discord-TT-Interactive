import { Schema, type } from "@colyseus/schema";

export class CharacterStatus extends Schema {
  @type("string")
  status: Conditions;

  constructor(status: Conditions) {
    super();
    this.status = status;
  }

  public toString(): string {
    return this.status;
  }
}

export type Conditions = GeneralCondition | Buffs | DeBuf;

export type GeneralCondition =
  | "Blinded"
  | "Charmed"
  | "Deafened"
  | "Frightened"
  | "Grappled"
  | "Incapacitated"
  | "Invisible"
  | "Paralyzed"
  | "Petrified"
  | "Poisoned"
  | "Prone"
  | "Restrained"
  | "Stunned"
  | "Unconscious"
  | "Exhausted"
  | "Bleeding";

export type Buffs = "Bless";

export type DeBuf = "Baned";
