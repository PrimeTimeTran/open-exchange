export const promisify = <TReq, TRes>(
  fn: (req: TReq, callback: (err: any, response: TRes) => void) => void,
  req: TReq,
): Promise<TRes> => {
  return new Promise((resolve, reject) => {
    fn(req, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};
