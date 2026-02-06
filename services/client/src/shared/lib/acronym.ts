export function acronym(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
) {
  if (!firstName && !email) {
    return '';
  }

  if (!firstName) {
    return email?.charAt(0).toUpperCase();
  }

  let firstLetter = firstName.charAt(0).toUpperCase();
  let acronym = firstLetter;

  if (lastName) {
    let lastLetter = lastName.charAt(0).toUpperCase();
    acronym += lastLetter;
  }

  return acronym;
}
