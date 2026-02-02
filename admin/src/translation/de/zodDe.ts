import { ZodErrorMap, ZodIssueCode, ZodParsedType, util } from 'zod';

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;

  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = 'Erforderlich';
      } else {
        message = `Muss vom Typ ${issue.expected} sein`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Ungültiger Literalwert, erwartet ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer,
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unbekannte Schlüssel im Objekt: ${util.joinValues(
        issue.keys,
        ', ',
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = 'Ungültige Eingabe';
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Ungültiger Diskriminatorwert. Erwartet ${util.joinValues(
        issue.options,
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Ungültiger Enum-Wert. Erwartet ${util.joinValues(
        issue.options,
      )}, erhalten '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = 'Ungültige Funktionsargumente';
      break;
    case ZodIssueCode.invalid_return_type:
      message = 'Ungültiger Funktionsrückgabetyp';
      break;
    case ZodIssueCode.invalid_date:
      message = 'Ungültiges Datum';
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === 'object') {
        if ('includes' in issue.validation) {
          message = `Muss "${issue.validation.includes}" enthalten`;

          if (typeof issue.validation.position === 'number') {
            message = `${message} an einer oder mehreren Positionen ab ${issue.validation.position}`;
          }
        } else if ('startsWith' in issue.validation) {
          message = `Muss mit "${issue.validation.startsWith}" beginnen`;
        } else if ('endsWith' in issue.validation) {
          message = `Muss mit "${issue.validation.endsWith}" enden`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== 'regex') {
        message = `Ungültiger ${issue.validation}`;
      } else {
        message = 'Ungültig';
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === 'array')
        message = `Muss ${
          issue.exact ? 'genau' : issue.inclusive ? 'mindestens' : 'mehr als'
        } ${issue.minimum} Element(e) enthalten`;
      else if (issue.type === 'string')
        if (issue.minimum === 1) {
          message = 'Erforderlich';
        } else {
          message = `Muss ${
            issue.exact ? 'genau' : issue.inclusive ? 'mindestens' : 'über'
          } ${issue.minimum} Zeichen enthalten`;
        }
      else if (issue.type === 'number')
        message = `Muss ${
          issue.exact
            ? 'genau gleich '
            : issue.inclusive
            ? 'größer oder gleich '
            : 'größer als '
        }${issue.minimum} sein`;
      else if (issue.type === 'date')
        message = `Das Datum muss ${
          issue.exact
            ? 'genau gleich '
            : issue.inclusive
            ? 'größer oder gleich '
            : 'größer als '
        }${new Date(Number(issue.minimum))} sein`;
      else message = 'Ungültige Eingabe';
      break;
    case ZodIssueCode.too_big:
      if (issue.type === 'array')
        message = `Muss ${
          issue.exact ? 'genau' : issue.inclusive ? 'höchstens' : 'weniger als'
        } ${issue.maximum} Element(e) enthalten`;
      else if (issue.type === 'string')
        message = `Muss ${
          issue.exact ? 'genau' : issue.inclusive ? 'höchstens' : 'unter'
        } ${issue.maximum} Zeichen enthalten`;
      else if (issue.type === 'number')
        message = `Muss ${
          issue.exact
            ? 'genau'
            : issue.inclusive
            ? 'kleiner oder gleich'
            : 'kleiner als'
        } ${issue.maximum} sein`;
      else if (issue.type === 'bigint')
        message = `Muss ${
          issue.exact
            ? 'genau'
            : issue.inclusive
            ? 'kleiner oder gleich'
            : 'kleiner als'
        } ${issue.maximum} sein`;
      else if (issue.type === 'date')
        message = `Das Datum muss ${
          issue.exact
            ? 'genau'
            : issue.inclusive
            ? 'kleiner oder gleich'
            : 'kleiner als'
        } ${new Date(Number(issue.maximum))} sein`;
      else message = 'Ungültige Eingabe';
      break;
    case ZodIssueCode.custom:
      message = 'Ungültige Eingabe';
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = 'Schnittmengenergebnisse konnten nicht zusammengeführt werden';
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Muss ein Vielfaches von ${issue.multipleOf} sein`;
      break;
    case ZodIssueCode.not_finite:
      message = 'Muss endlich sein';
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
