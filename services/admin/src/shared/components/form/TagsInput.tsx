import { trim } from 'lodash';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Badge } from 'src/shared/components/ui/badge';
import { Input } from 'src/shared/components/ui/input';
import { Dictionary } from 'src/translation/locales';

export default function TagsInput({
  onChange,
  value,
  dictionary,
  placeholder,
  separator,
  disabled,
  dataTestid,
}: {
  onChange: (value: Array<string>) => void;
  value?: Array<string>;
  dictionary: Dictionary;
  placeholder?: string;
  separator?: string;
  disabled?: boolean;
  dataTestid?: string;
}) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder={placeholder || dictionary.shared.tagsPlaceholder}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={(event) => {
          if (event.target.value) {
            onChange([
              ...(value || []),
              ...(separator
                ? event.target.value.split(separator).map(trim)
                : [event.target.value]),
            ]);
            setInputValue('');
          }
        }}
        onKeyDown={(event: any) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            if (event.target.value) {
              onChange([
                ...(value || []),
                ...(separator
                  ? event.target.value.split(separator).map(trim)
                  : [event.target.value]),
              ]);
              setInputValue('');
            }
          }
        }}
        disabled={disabled}
        data-testid={dataTestid ? dataTestid : undefined}
      />

      {Boolean(value?.length) && (
        <div className="flex flex-wrap gap-1">
          {value?.map((item) => {
            return (
              <Badge
                variant={'outline'}
                key={item}
                data-testid={
                  dataTestid ? `${dataTestid}-value-${item}` : undefined
                }
                className="px-3 py-1 text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v !== item))}
                  className="ml-2"
                  title={dictionary.shared.remove}
                  data-testid={
                    dataTestid
                      ? `${dataTestid}-value-${item}-remove`
                      : undefined
                  }
                >
                  <FaTimes className="text-xs text-muted-foreground" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
