class ValueNotFoundError extends Error {
  constructor(message = "value not found") {
    super(message);
    this.name = "ValueNotFoundError";
    this.message = message;
  }
}

export default ValueNotFoundError;
