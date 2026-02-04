export default class Error404 extends Error {
  code: number;

  constructor(message?: any) {
    super(message);
    this.code = 404;
  }
}
