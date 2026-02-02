import { isEqual, reduce } from 'lodash';

export function objectDifferenceKeys(a: any, b: any) {
  return reduce(
    a,
    function (result, value, key) {
      return isEqual(value, b?.[key]) ? result : result.concat(key);
    },
    [] as any,
  );
}
