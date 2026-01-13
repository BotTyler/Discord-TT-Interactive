import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export const jsdomWindow = new JSDOM("").window;
export const purify = DOMPurify(jsdomWindow);

export function sanitize(message: string): string {
  /*
  var entityMap: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  const reg = /[&<>"'`=\/]/g;
  return message.replace(reg, (match) => entityMap[match]);
  */
  return purify.sanitize(message);
}
/**
 * Expected type for the validation input method.
 * The type parameter has an optional type NOVERIFY, which will bypass the type check and only make sure the value is present.
 * Some of the more complicated types are "object", "array", these will need to be handled separately.
 */
export type ExpectedTypes =
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "object"
  | "array"
  | "NOVERIFY";
export type ValidationInputType = {
  name: string;
  type: ExpectedTypes;
  PostProcess: ((val: any) => any) | undefined;
};
/**
 *
 * @param reqInputs The inputs provided by the initial request.
 * @param validInputs The list of inputs that should be included. This object will include the following:
 * - name - The name of the request param.
 * - type - The type of the specific param.
 * - SanitizeFunction - (OPTIONAL) If provided, this will sanitize any inputs.
 *
 * @returns If passed validation, a record of values will be returned that are sanitized, otherwise a runtime error is thrown.
 */
export function ValidateAllInputs(
  reqInputs: Record<string, any>,
  validInputs: ValidationInputType[],
): Object {
  // console.log(reqInputs);
  const validatedRecord: Record<string, any> = {};
  for (const field of validInputs) {
    const reqValue = reqInputs[field.name];

    // Check to make sure the value is there and of the right type
    if (reqValue == null) {
      console.error(`Value ${field.name} was found to be undefined!!`);
      throw new Error(`Value ${field.name} was found to be undefined!!`);
    }

    if (!ValidateTypes(reqValue, field.type)) {
      console.error(
        `Value is not of the right type. Value: ${reqValue} Type: ${typeof reqValue} Expected: ${field.type}`,
      );
      throw new Error(
        `Value is not of the right type. Value: ${reqValue} Type: ${typeof reqValue} Expected: ${field.type}`,
      );
    }
    // The value should be here, lets add it to the final record and santize the input if supported.
    if (field.PostProcess) validatedRecord[field.name] = field.PostProcess(reqValue);
    else validatedRecord[field.name] = reqValue;
  }
  return validatedRecord;
}

/**
 * @param val - value of type to be checked.
 * @param expected - The expected type provided by the ExpectedTypes Type.
 * @returns - A boolean determining if the type was checked.
 */
function ValidateTypes(val: any, expected: ExpectedTypes): boolean {
  // use a switch to handle the more complicated types.
  // All the other primitive types will be handled by the default case.
  switch (expected) {
    case "array":
      return Array.isArray(val);
      break;
    case "NOVERIFY":
      // For this we do not care to validate the types. This should be treated as dangerous.
      return true;
      break;
    default:
      return typeof val === expected;
  }
}
