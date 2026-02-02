import QueryString from 'qs';

export function queryToObject(query: string) {
  return QueryString.parse(query, {
    ignoreQueryPrefix: true,
    arrayLimit: Infinity,
  });
}
