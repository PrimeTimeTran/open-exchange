export default class Error400 extends Error {
  code: number;

  constructor(message?: any) {
    super(message);
    this.code = 400;
  }
}
