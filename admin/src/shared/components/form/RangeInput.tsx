import { LuX } from 'react-icons/lu';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { Dictionary } from 'src/translation/locales';

export default function RangeInput({
  type,
  disabled,
  value,
  onChange,
  isClearable,
  dictionary,
}: {
  type: 'text' | 'number';
  value?: (number | string | undefined)[];
  onChange: (range: (number | string | undefined)[]) => void;
  isClearable?: boolean;
  dictionary: Dictionary;
  disabled?: boolean;
}) {
  const handleStartChanged = (value?: string) => {
    onChange([value, endValue()]);
  };

  const handleEndChanged = (value?: string) => {
    onChange([startValue(), value]);
  };

  const startValue = () => {
    if (!value) {
      return '';
    }

    if (Array.isArray(!value)) {
      return '';
    }

    if (!value.length) {
      return '';
    }

    return value[0] || '';
  };

  const endValue = () => {
    if (!value) {
      return '';
    }

    if (Array.isArray(!value)) {
      return '';
    }

    if (value.length < 2) {
      return '';
    }

    return value[1] || '';
  };

  return (
    <div className="flex flex-nowrap items-center gap-1">
      <div className="w-full">
        <Input
          type={type}
          value={startValue()}
          onChange={(event) => handleStartChanged(event.target.value)}
          disabled={disabled}
          placeholder={dictionary.shared.min}
        />
      </div>

      <div className="shrink-0 text-muted-foreground">~</div>

      <div className="w-full">
        <Input
          type={type}
          value={endValue()}
          onChange={(event) => handleEndChanged(event.target.value)}
          disabled={disabled}
          placeholder={dictionary.shared.max}
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
