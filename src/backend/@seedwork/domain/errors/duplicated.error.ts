export class DuplicatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicatedError";
  }
}

export default DuplicatedError;
