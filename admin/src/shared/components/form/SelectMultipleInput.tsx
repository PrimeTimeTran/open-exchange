import { FaTimes } from 'react-icons/fa';
import SelectInput from 'src/shared/components/form/SelectInput';
import { Badge } from 'src/shared/components/ui/badge';
import { Dictionary } from 'src/translation/locales';

export default function SelectMultipleInput({
  onChange,
  value,
  dictionary,
  placeholder,
  options,
  disabled,
  dataTestid,
}: {
  onChange: (value: Array<string>) => void;
  value?: Array<string>;
  dictionary: Dictionary;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  dataTestid?: string;
}) {
  function onSelectChange(itemToAdd: string | undefined | null) {
    if (itemToAdd) {
      onChange([...(value || []), itemToAdd]);
    }
  }

  const availableOptions = options.filter(
    (option) => !value?.includes(option.value),
  );

  return (
    <div className="flex flex-col gap-2">
      {Boolean(availableOptions.length) && (
        <SelectInput
          onChange={onSelectChange}
          value={''}
          dictionary={dictionary}
          selectPlaceholder={placeholder}
          options={availableOptions}
          disabled={disabled}
          dataTestid={dataTestid}
        />
      )}

      {Boolean(value?.length) && (
        <div className="flex flex-wrap gap-1">
          {value?.map((item) => {
            return (
              <Badge
                variant={'outline'}
                data-testid={
                  dataTestid ? `${dataTestid}-value-${item}` : undefined
                }
                key={item}
                className="px-3 py-1 text-sm"
              >
                {options.find((option) => option.value === item)?.label}
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
