import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { LuX } from 'react-icons/lu';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { Dictionary } from 'src/translation/locales';

export default function DateTimePickerInput({
  value,
  onChange,
  dictionary,
  isClearable,
  placeholder,
  disabled,
  dataTestid,
  min,
  max,
}: {
  placeholder?: string;
  value?: dayjs.ConfigType;
  onChange: (date: dayjs.ConfigType) => void;
  dictionary: Dictionary;
  isClearable?: boolean;
  disabled?: boolean;
  dataTestid?: string;
  min?: string;
  max?: string;
}) {
  const [type, setType] = useState<'datetime-local' | 'text'>(
    value ? 'datetime-local' : 'text',
  );
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.value = value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '';
      if (!ref.current.value) {
        setType('text');
      }
    }
  }, [value]);

  return (
    <div className="flex w-full items-center gap-1">
      <Input
        ref={ref}
        type={type}
        placeholder={placeholder}
        defaultValue={value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : ''}
        onFocus={() => setType('datetime-local')}
        onBlur={(e) => {
          const value = e.target.value?.trim()
            ? dayjs(e.target.value?.trim())
            : null;

          if (value && value.isValid()) {
            onChange(value.toDate());
          } else {
            onChange(null);
            setType('text');
          }
        }}
        disabled={disabled}
        data-testid={dataTestid}
        min={min}
        max={max}
      />
      {isClearable && value && (
        <Button
          type="button"
          variant="secondary"
          size={'icon'}
          onClick={() => onChange(null)}
          title={dictionary.shared.clear}
        >
          <LuX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
