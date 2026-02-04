import { ZodErrorMap, ZodIssueCode, ZodParsedType, util } from 'zod';

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;

  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = 'Requerido';
      } else {
        message = `Debe ser un ${issue.expected}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Valor literal no válido, se esperaba ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer,
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Clave(s) no reconocida(s) en el objeto: ${util.joinValues(
        issue.keys,
        ', ',
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = 'Entrada no válida';
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Valor del discriminador no válido. Se esperaba ${util.joinValues(
        issue.options,
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Valor del enum no válido. Se esperaba ${util.joinValues(
        issue.options,
      )}, recibido '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = 'Argumentos de función no válidos';
      break;
    case ZodIssueCode.invalid_return_type:
      message = 'Tipo de retorno de función no válido';
      break;
    case ZodIssueCode.invalid_date:
      message = 'Fecha no válida';
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === 'object') {
        if ('includes' in issue.validation) {
          message = `Debe incluir "${issue.validation.includes}"`;

          if (typeof issue.validation.position === 'number') {
            message = `${message} en una o más posiciones mayores o iguales a ${issue.validation.position}`;
          }
        } else if ('startsWith' in issue.validation) {
          message = `Debe comenzar con "${issue.validation.startsWith}"`;
        } else if ('endsWith' in issue.validation) {
          message = `Debe terminar con "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== 'regex') {
        message = `No válido ${issue.validation}`;
      } else {
        message = 'No válido';
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === 'array') {
        message = `Debe contener ${
          issue.exact ? 'exactamente' : issue.inclusive ? 'al menos' : 'más de'
        } ${issue.minimum} elemento(s)`;
      } else if (issue.type === 'string') {
        if (issue.minimum === 1) {
          message = 'Requerido';
        } else {
          message = `Debe contener ${
            issue.exact
              ? 'exactamente'
              : issue.inclusive
              ? 'al menos'
              : 'más de'
          } ${issue.minimum} carácter(es)`;
        }
      } else if (issue.type === 'number') {
        message = `Debe ser ${
          issue.exact
            ? 'exactamente igual a'
            : issue.inclusive
            ? 'mayor o igual a'
            : 'mayor que'
        } ${issue.minimum}`;
      } else if (issue.type === 'date') {
        message = `La fecha debe ser ${
          issue.exact
            ? 'exactamente igual a'
            : issue.inclusive
            ? 'mayor o igual a'
            : 'mayor que'
        } ${new Date(Number(issue.minimum))}`;
      } else {
        message = 'Entrada no válida';
      }
      break;
    case ZodIssueCode.too_big:
      if (issue.type === 'array') {
        message = `Debe contener ${
          issue.exact
            ? 'exactamente'
            : issue.inclusive
            ? 'como máximo'
            : 'menos de'
        } ${issue.maximum} elemento(s)`;
      } else if (issue.type === 'string') {
        message = `Debe contener ${
          issue.exact
            ? 'exactamente'
            : issue.inclusive
            ? 'como máximo'
            : 'menos de'
        } ${issue.maximum} carácter(es)`;
      } else if (issue.type === 'number') {
        message = `Debe ser ${
          issue.exact
            ? 'exactamente'
            : issue.inclusive
            ? 'menor o igual a'
            : 'menor que'
        } ${issue.maximum}`;
      } else if (issue.type === 'date') {
        message = `La fecha debe ser ${
          issue.exact
            ? 'exactamente'
            : issue.inclusive
            ? 'menor o igual a'
            : 'menor que'
        } ${new Date(Number(issue.maximum))}`;
      } else {
        message = 'Entrada no válida';
      }
      break;
    case ZodIssueCode.custom:
      message = 'Entrada no válida';
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = 'Los resultados de la intersección no pudieron ser fusionados';
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Debe ser un múltiplo de ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = 'Debe ser finito';
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
