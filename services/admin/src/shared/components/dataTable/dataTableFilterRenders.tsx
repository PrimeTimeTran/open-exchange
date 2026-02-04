import dayjs from 'dayjs';
import { FileUploaded } from 'src/features/file/fileSchemas';
import { AppContext } from 'src/shared/controller/appContext';
import { formatDate } from 'src/shared/lib/formatDate';
import { formatDatetime } from 'src/shared/lib/formatDateTime';
import { formatDecimal } from 'src/shared/lib/formatDecimal';

export const dataTableFilterRenders = (context: AppContext) => ({
  enumerator:
    (labels: { [key: string]: string }) =>
    (value: string | null | undefined) => (value ? labels[value] : null),
  enumeratorMultiple:
    (labels: { [key: string]: string }) =>
    (values: string[] | null | undefined) =>
      values
        ? values
            .map(dataTableFilterRenders(context).enumerator(labels))
            .join(', ')
        : null,
  stringArray: () => (value: string[] | null | undefined) =>
    (value || []).join(', '),
  json: () => (value: any) => (value ? JSON.stringify(value, null, 2) : null),
  decimal: (fractionDigits?: number) => (value: any) =>
    formatDecimal(value, context.locale, fractionDigits),
  boolean:
    (trueLabel?: string, falseLabel?: string) =>
    (value: boolean | string | undefined | null) =>
      value == null
        ? null
        : value === 'true' || value === true
        ? trueLabel || context.dictionary.shared.yes
        : falseLabel || context.dictionary.shared.no,
  booleanTrueOnly:
    (trueLabel?: string, falseLabel?: string) =>
    (value: boolean | string | undefined | null) =>
      value == null
        ? null
        : value === 'true' || value === true
        ? trueLabel || context.dictionary.shared.yes
        : null,
  relationToOne:
    (labelFn: (value: any, dictionary?: any) => string) =>
    (value: { [key: string]: string }) =>
      labelFn(value, context.dictionary) || null,
  relationToMany:
    (labelFn: (value: any, dictionary?: any) => string) =>
    (arrayValue: Array<{ [key: string]: string }>) =>
      (arrayValue || [])
        .map((value) => labelFn(value, context.dictionary) || null)
        .filter(Boolean)
        .join(', '),
  filesOrImages: () => (arrayValue: Array<FileUploaded> | null | undefined) =>
    (arrayValue || []).map((value) => value.downloadUrl).join(' '),
  date: () => (value: dayjs.ConfigType) =>
    formatDate(value, context.dictionary),
  dateRange:
    () =>
    (value: [dayjs.ConfigType?, dayjs.ConfigType?] | null | undefined) => {
      if (!value || !value.length) {
        return '';
      }

      const start = value[0];
      const end = value.length === 2 ? value[1] : null;

      if (!start && !end) {
        return '';
      }

      if (start && !end) {
        return `> ${formatDate(start, context.dictionary)}`;
      }

      if (!start && end) {
        return `< ${formatDate(end, context.dictionary)}`;
      }

      return `${formatDate(start, context.dictionary)} - ${formatDate(
        end,
        context.dictionary,
      )}`;
    },
  datetime: () => (value: dayjs.ConfigType) =>
    formatDatetime(value, context.dictionary),
  dateTimeRange:
    () =>
    (value: [dayjs.ConfigType?, dayjs.ConfigType?] | null | undefined) => {
      if (!value || !value.length) {
        return '';
      }

      const start = value[0];
      const end = value.length === 2 ? value[1] : null;

      if (!start && !end) {
        return '';
      }

      if (start && !end) {
        return `> ${formatDatetime(start, context.dictionary)}`;
      }

      if (!start && end) {
        return `< ${formatDatetime(end, context.dictionary)}`;
      }

      return `${formatDatetime(start, context.dictionary)} - ${formatDatetime(
        end,
        context.dictionary,
      )}`;
    },
  decimalRange: (fractionDigits?: number) => (value: [any, any]) => {
    if (!value || !value.length) {
      return '';
    }

    const start = value[0];
    const end = value.length === 2 ? value[1] : null;

    if (start == null && end == null) {
      return '';
    }

    if (start != null && end == null) {
      return `> ${formatDecimal(start, context.locale, fractionDigits)}`;
    }

    if (start == null && end != null) {
      return `< ${formatDecimal(end, context.locale, fractionDigits)}`;
    }

    return `${formatDecimal(
      start,
      context.locale,
      fractionDigits,
    )} - ${formatDecimal(end, context.locale, fractionDigits)}`;
  },
  range: () => (value: [any, any]) => {
    if (!value || !value.length) {
      return '';
    }

    const start = value[0];
    const end = value.length === 2 && value[1];

    if ((start == null || start === '') && (end == null || end === '')) {
      return '';
    }

    if (start != null && (end == null || end === '')) {
      return `> ${start}`;
    }

    if ((start == null || start === '') && end != null) {
      return `< ${end}`;
    }

    return `${start} - ${end}`;
  },
});
