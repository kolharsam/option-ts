class ValueError extends Error {
  constructor(message = "value not found") {
    super(message);
    this.name = "ValueError";
    this.message = message;
  }
}

export default ValueError;
