import AutocompleteAsyncInput from 'src/shared/components/form/AutocompleteAsyncInput';
import AutocompleteMemoryInput from 'src/shared/components/form/AutocompleteMemoryInput';
import { Dictionary } from 'src/translation/locales';

export default function AutocompleteInput<T extends { id: string }>(props: {
  queryId: string[];
  onChange: (value: Partial<T> | undefined | null) => void;
  value?: Partial<T> | null;
  dictionary: Dictionary;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  isClearable?: boolean;
  queryFn: (
    query?: string,
    exclude?: Array<string>,
    signal?: AbortSignal,
  ) => Promise<any>;
  labelFn: (value?: Partial<T> | null, dictionary?: Dictionary) => string;
  exclude?: Array<Partial<T>> | null;
  mode: 'memory' | 'async';
  disabled?: boolean;
  dataTestid?: string;
}) {
  if (props.mode === 'memory') {
    return <AutocompleteMemoryInput {...props} />;
  } else {
    return <AutocompleteAsyncInput {...props} />;
  }
}
