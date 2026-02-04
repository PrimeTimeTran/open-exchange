import { ZodErrorMap, ZodIssueCode, ZodParsedType, util } from 'zod';

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;

  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = 'Required';
      } else {
        message = `Must be a ${issue.expected}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer,
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(
        issue.keys,
        ', ',
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(
        issue.options,
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(
        issue.options,
      )}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === 'object') {
        if ('includes' in issue.validation) {
          message = `Must include "${issue.validation.includes}"`;

          if (typeof issue.validation.position === 'number') {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ('startsWith' in issue.validation) {
          message = `Must start with "${issue.validation.startsWith}"`;
        } else if ('endsWith' in issue.validation) {
          message = `Must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== 'regex') {
        message = `Invalid ${issue.validation}`;
      } else {
        message = 'Invalid';
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === 'array')
        message = `Must contain ${
          issue.exact ? 'exactly' : issue.inclusive ? `at least` : `more than`
        } ${issue.minimum} element(s)`;
      else if (issue.type === 'string')
        if (issue.minimum === 1) {
          message = 'Required';
        } else {
          message = `Must contain ${
            issue.exact ? 'exactly' : issue.inclusive ? `at least` : `over`
          } ${issue.minimum} character(s)`;
        }
      else if (issue.type === 'number')
        message = `Must be ${
          issue.exact
            ? `exactly equal to `
            : issue.inclusive
            ? `greater than or equal to `
            : `greater than `
        }${issue.minimum}`;
      else if (issue.type === 'date')
        message = `Date must be ${
          issue.exact
            ? `exactly equal to `
            : issue.inclusive
            ? `greater than or equal to `
            : `greater than `
        }${new Date(Number(issue.minimum))}`;
      else message = 'Invalid input';
      break;
    case ZodIssueCode.too_big:
      if (issue.type === 'array')
        message = `Must contain ${
          issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`
        } ${issue.maximum} element(s)`;
      else if (issue.type === 'string')
        message = `Must contain ${
          issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`
        } ${issue.maximum} character(s)`;
      else if (issue.type === 'number')
        message = `Must be ${
          issue.exact
            ? `exactly`
            : issue.inclusive
            ? `less than or equal to`
            : `less than`
        } ${issue.maximum}`;
      else if (issue.type === 'bigint')
        message = `Must be ${
          issue.exact
            ? `exactly`
            : issue.inclusive
            ? `less than or equal to`
            : `less than`
        } ${issue.maximum}`;
      else if (issue.type === 'date')
        message = `Date must be ${
          issue.exact
            ? `exactly`
            : issue.inclusive
            ? `smaller than or equal to`
            : `smaller than`
        } ${new Date(Number(issue.maximum))}`;
      else message = 'Invalid input';
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = 'Must be finite';
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
