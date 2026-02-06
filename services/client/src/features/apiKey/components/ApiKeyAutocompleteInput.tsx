import { ApiKey } from '@prisma/client';
import { apiKeyAutocompleteApiCall } from 'src/features/apiKey/apiKeyApiCalls';
import { apiKeyLabel } from 'src/features/apiKey/apiKeyLabel';
import AutocompleteInput from 'src/shared/components/form/AutocompleteInput';
import { AppContext } from 'src/shared/controller/appContext';

export function ApiKeyAutocompleteInput({
  onChange,
  value,
  selectPlaceholder,
  searchPlaceholder,
  notFoundPlaceholder,
  isClearable,
  mode,
  disabled,
  context,
  dataTestid,
}: {
  onChange: (value: Partial<ApiKey> | undefined | null) => void;
  value?: Partial<ApiKey> | null;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  isClearable?: boolean;
  mode: 'memory' | 'async';
  disabled?: boolean;
  context: AppContext;
  dataTestid?: string;
}) {
  const queryFn = (
    search?: string,
    exclude?: Array<string>,
    signal?: AbortSignal,
  ) => {
    return apiKeyAutocompleteApiCall(
      {
        search,
        exclude,
        take: mode === 'async' ? 10 : undefined,
      },
      signal,
    );
  };

  return (
    <div className="flex w-full gap-1">
      <div className="flex-1">
        <AutocompleteInput
          queryFn={queryFn}
          dictionary={context.dictionary}
          queryId={['apiKey', 'autocomplete']}
          isClearable={isClearable}
          labelFn={apiKeyLabel}
          notFoundPlaceholder={notFoundPlaceholder}
          onChange={onChange}
          searchPlaceholder={searchPlaceholder}
          selectPlaceholder={selectPlaceholder}
          value={value}
          mode={mode}
          disabled={disabled}
          dataTestid={dataTestid}
        />
      </div>
    </div>
  );
}
