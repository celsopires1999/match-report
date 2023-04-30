export class PlayerExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlayerExistsError";
  }
}

export default PlayerExistsError;
