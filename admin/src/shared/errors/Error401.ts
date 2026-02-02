export default class Error401 extends Error {
  code: number;

  constructor(message?: any) {
    super(message);
    this.code = 401;
  }
}
