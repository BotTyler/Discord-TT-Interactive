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

export type Conditions =
  | (typeof GeneralConditionArray)[number]
  | (typeof BuffsArray)[number]
  | (typeof DebufArray)[number];

export const GeneralConditionArray: string[] = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
  "Exhausted",
  "Bleeding",
];

export const BuffsArray: string[] = ["Bless"];

export const DebufArray: string[] = ["Baned"];
