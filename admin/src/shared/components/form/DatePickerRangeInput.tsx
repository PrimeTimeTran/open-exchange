import { LuX } from 'react-icons/lu';
import DatePickerInput from 'src/shared/components/form/DatePickerInput';
import { Button } from 'src/shared/components/ui/button';
import { Dictionary, Locale } from 'src/translation/locales';

export default function DatePickerRangeInput({
  disabled,
  value,
  onChange,
  isClearable,
  dictionary,
  locale,
}: {
  value?: (string | null | undefined)[];
  onChange: (range: (string | null | undefined)[]) => void;
  isClearable?: boolean;
  dictionary: Dictionary;
  disabled?: boolean;
  locale: Locale;
}) {
  const handleStartChanged = (value?: string | null | undefined) => {
    onChange([value, endValue()]);
  };

  const handleEndChanged = (value?: string | null | undefined) => {
    onChange([startValue(), value]);
  };

  const startValue = () => {
    if (!value) {
      return null;
    }

    if (Array.isArray(!value)) {
      return null;
    }

    if (!value.length) {
      return null;
    }

    return value[0];
  };

  const endValue = () => {
    if (!value) {
      return null;
    }

    if (Array.isArray(!value)) {
      return null;
    }

    if (value.length < 2) {
      return null;
    }

    return value[1];
  };

  return (
    <div className="flex flex-nowrap items-center gap-1">
      <div className="w-full">
        <DatePickerInput
          value={startValue()}
          onChange={(value) => handleStartChanged(value)}
          disabled={disabled}
          dictionary={dictionary}
          placeholder={dictionary.shared.startDate}
        />
      </div>

      <div className="shrink-0 text-muted-foreground">~</div>

      <div className="w-full">
        <DatePickerInput
          value={endValue()}
          onChange={(value) => handleEndChanged(value)}
          disabled={disabled}
          dictionary={dictionary}
          placeholder={dictionary.shared.endDate}
        />
      </div>

      {isClearable && Boolean(value?.length) && (
        <div className="flex shrink-0 items-center justify-center">
          <Button
            type="button"
            variant="secondary"
            size={'icon'}
            onClick={() => onChange([])}
            title={dictionary.shared.clear}
          >
            <LuX className="h-4 w-4 " />
          </Button>
        </div>
      )}
    </div>
  );
}
