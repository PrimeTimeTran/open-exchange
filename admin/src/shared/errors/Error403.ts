export default class Error403 extends Error {
  code: number;

  constructor(message?: any) {
    super(message);
    this.code = 403;
  }
}
