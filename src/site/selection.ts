/** An absent parameter means all; an explicitly empty parameter means none. */
export function readSelection(params:URLSearchParams,available:readonly string[]) {
  const requested=[...new Set(params.getAll('candidate').filter(Boolean))];
  return {
    ids:params.has('candidate') ? available.filter(id=>requested.includes(id)) : [...available],
    unavailable:requested.filter(id=>!available.includes(id)),
  };
}
export function selectionQuery(ids:readonly string[]) {
  const params=new URLSearchParams();
  for(const id of ids.length ? ids : ['']) params.append('candidate',id);
  return params.toString();
}
