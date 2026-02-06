import dayjs from 'dayjs';
import { isString } from 'lodash';
import { Dictionary } from 'src/translation/locales';

export function formatDatetime(
  value: dayjs.ConfigType,
  dateTimeFormatOrDictionary: string | Dictionary,
) {
  if (!value) {
    return '';
  }

  const isDatetimeFormat = isString(dateTimeFormatOrDictionary);

  return dayjs(value).format(
    isDatetimeFormat
      ? dateTimeFormatOrDictionary
      : dateTimeFormatOrDictionary.shared.datetimeFormat,
  );
}
