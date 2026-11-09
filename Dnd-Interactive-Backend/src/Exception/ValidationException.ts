export default class ValidationException extends Error {
  constructor(message: string, err?: Error) {
    const combinedMessage: string = `${message}\n${err?.message}`;
    super(combinedMessage);
  }
}
