import { FaTimes } from 'react-icons/fa';
import AutocompleteAsyncInput from 'src/shared/components/form/AutocompleteAsyncInput';
import AutocompleteMemoryInput from 'src/shared/components/form/AutocompleteMemoryInput';
import { Badge } from 'src/shared/components/ui/badge';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import { Dictionary } from 'src/translation/locales';

export default function AutocompleteMultipleInput<T extends { id: string }>({
  queryId,
  onChange,
  value,
  dictionary,
  selectPlaceholder,
  searchPlaceholder,
  notFoundPlaceholder,
  queryFn,
  labelFn,
  mode,
  disabled,
  dataTestid,
}: {
  queryId: string[];
  onChange: (value: Array<Partial<T>> | undefined | null | []) => void;
  value?: Array<Partial<T>> | null;
  dictionary: Dictionary;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  queryFn: (
    query?: string,
    exclude?: Array<string>,
    signal?: AbortSignal,
  ) => Promise<any>;
  labelFn: (value?: Partial<T> | null, dictionary?: Dictionary) => string;
  mode: 'async' | 'memory';
  disabled?: boolean;
  dataTestid?: string;
}) {
  function onSelectChange(itemToAdd: Partial<T> | undefined | null) {
    if (itemToAdd) {
      onChange([...(value || []), itemToAdd]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {mode === 'memory' ? (
        <AutocompleteMemoryInput
          queryId={queryId}
          onChange={onSelectChange}
          value={null}
          dictionary={dictionary}
          selectPlaceholder={selectPlaceholder}
          searchPlaceholder={searchPlaceholder}
          notFoundPlaceholder={notFoundPlaceholder}
          queryFn={queryFn}
          labelFn={labelFn}
          exclude={value}
          disabled={disabled}
          dataTestid={dataTestid}
        />
      ) : (
        <AutocompleteAsyncInput
          queryId={queryId}
          onChange={onSelectChange}
          value={null}
          dictionary={dictionary}
          selectPlaceholder={selectPlaceholder}
          searchPlaceholder={searchPlaceholder}
          notFoundPlaceholder={notFoundPlaceholder}
          queryFn={queryFn}
          labelFn={labelFn}
          exclude={value}
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
                  dataTestid ? `${dataTestid}-value-${item.id}` : undefined
                }
                key={item?.id}
                className="px-3 py-1 text-sm"
              >
                {labelFn(item, dictionary)}
                <button
                  type="button"
                  onClick={() =>
                    onChange(value.filter((v) => v?.id !== item?.id))
                  }
                  className="ml-2"
                  title={dictionary.shared.remove}
                  data-testid={
                    dataTestid
                      ? `${dataTestid}-value-${item.id}-remove`
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
