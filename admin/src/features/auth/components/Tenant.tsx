'use client';

import { useState } from 'react';
import { TenantNewForm } from 'src/features/auth/components/TenantNewForm';
import { TenantSelect } from 'src/features/auth/components/TenantSelect';
import { Button } from 'src/shared/components/ui/button';
import { AppContext } from 'src/shared/controller/appContext';

export function Tenant({ context }: { context: AppContext }) {
  const dictionary = context.dictionary;
  const memberships = context.currentUser?.memberships?.filter(
    (membership) =>
      membership.status === 'active' || membership.status === 'invited',
  );

  const [mode, setMode] = useState(memberships?.length ? 'select' : 'new');

  return (
    <>
      {mode === 'new' ? (
        <>
          <TenantNewForm dictionary={dictionary} locale={context.locale} />
          {memberships?.length ? (
            <Button
              onClick={() => setMode('select')}
              className="mt-2"
              variant={'secondary'}
            >
              {dictionary.auth.tenant.select.select}
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <TenantSelect
            memberships={memberships}
            dictionary={dictionary}
            locale={context.locale}
          />
          <Button
            onClick={() => setMode('new')}
            className="mt-2"
            variant={'secondary'}
          >
            {dictionary.auth.tenant.create.button}
          </Button>
        </>
      )}
    </>
  );
}
