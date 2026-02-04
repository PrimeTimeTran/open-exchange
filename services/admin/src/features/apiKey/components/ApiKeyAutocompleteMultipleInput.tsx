import { ApiKey } from '@prisma/client';
import { apiKeyAutocompleteApiCall } from 'src/features/apiKey/apiKeyApiCalls';
import { apiKeyLabel } from 'src/features/apiKey/apiKeyLabel';
import AutocompleteMultipleInput from 'src/shared/components/form/AutocompleteMultipleInput';
import { AppContext } from 'src/shared/controller/appContext';

export function ApiKeyAutocompleteMultipleInput({
  onChange,
  value,
  context,
  selectPlaceholder,
  searchPlaceholder,
  notFoundPlaceholder,
  mode,
  disabled,
}: {
  onChange: (value: Array<Partial<ApiKey>> | undefined | null | []) => void;
  value?: Array<Partial<ApiKey>> | null | [];
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  mode: 'memory' | 'async';
  disabled?: boolean;
  context: AppContext;
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
        <AutocompleteMultipleInput
          queryFn={queryFn}
          dictionary={context.dictionary}
          queryId={['apiKey', 'autocomplete']}
          labelFn={apiKeyLabel}
          notFoundPlaceholder={notFoundPlaceholder}
          onChange={onChange}
          searchPlaceholder={searchPlaceholder}
          selectPlaceholder={selectPlaceholder}
          value={value}
          mode={mode}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
