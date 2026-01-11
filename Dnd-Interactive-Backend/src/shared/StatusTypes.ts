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

export type Conditions = GeneralCondition | SpellCondition;

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
  | "Exhaustion";

export type SpellCondition = "Bless";
