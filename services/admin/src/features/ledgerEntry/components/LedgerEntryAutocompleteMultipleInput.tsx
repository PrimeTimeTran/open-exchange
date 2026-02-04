import { LedgerEntry } from '@prisma/client';
import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { ledgerEntryAutocompleteApiCall } from 'src/features/ledgerEntry/ledgerEntryApiCalls';
import { ledgerEntryLabel } from 'src/features/ledgerEntry/ledgerEntryLabel';
import { LedgerEntryFormSheet } from 'src/features/ledgerEntry/components/LedgerEntryFormSheet';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';
import AutocompleteMultipleInput from 'src/shared/components/form/AutocompleteMultipleInput';
import { Button } from 'src/shared/components/ui/button';

export function LedgerEntryAutocompleteMultipleInput({
  onChange,
  value,
  context,
  selectPlaceholder,
  searchPlaceholder,
  notFoundPlaceholder,
  mode,
  disabled,
  hideFormButton,
}: {
  onChange: (value: Array<Partial<LedgerEntry>> | undefined | null | []) => void;
  value?: Array<Partial<LedgerEntry>> | null | [];
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  notFoundPlaceholder?: string;
  mode: 'memory' | 'async';
  disabled?: boolean;
  context: AppContext;
  hideFormButton?: boolean;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const hasPermissionToCreate = hasPermission(
    permissions.ledgerEntryCreate,
    context,
  );

  const queryFn = (
    search?: string,
    exclude?: Array<string>,
    signal?: AbortSignal,
  ) => {
    return ledgerEntryAutocompleteApiCall(
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
          queryId={['ledgerEntry', 'autocomplete']}
          labelFn={ledgerEntryLabel}
          notFoundPlaceholder={notFoundPlaceholder}
          onChange={onChange}
          searchPlaceholder={searchPlaceholder}
          selectPlaceholder={selectPlaceholder}
          value={value}
          mode={mode}
          disabled={disabled}
        />
      </div>

      {hasPermissionToCreate && !hideFormButton && (
        <Button
          type="button"
          variant="secondary"
          size={'icon'}
          onClick={() => setIsFormOpen(true)}
          title={context.dictionary.shared.new}
          disabled={disabled}
        >
          <LuPlus className="h-4 w-4" />
        </Button>
      )}

      {isFormOpen && (
        <LedgerEntryFormSheet
          onCancel={() => setIsFormOpen(false)}
          onSuccess={(ledgerEntry) => {
            setIsFormOpen(false);
            onChange([...(value || []), ledgerEntry]);
          }}
          context={context}
        />
      )}
    </div>
  );
}
