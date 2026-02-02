import { zodResolver } from '@hookform/resolvers/zod';
import { Tenant } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { LuLoader2 } from 'react-icons/lu';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import {
  tenantCreateApiCall,
  tenantUpdateApiCall,
} from 'src/features/tenant/tenantApiCalls';
import { Button } from 'src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/shared/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'src/shared/components/ui/form';
import { Input } from 'src/shared/components/ui/input';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { getZodErrorMap } from 'src/translation/getZodErrorMap';
import { z } from 'zod';

export default function TenantFormDialog({
  tenant,
  onClose,
  context,
  onDestroy,
}: {
  tenant?: Tenant;
  onClose: () => void;
  onDestroy?: () => void;
  context: AppContext;
}) {
  const { dictionary, locale } = context;
  const hasPermissionToDestroyTenant = hasPermission(
    permissions.tenantDestroy,
    context,
  );

  z.setErrorMap(getZodErrorMap(locale));

  const schema = z.object({
    name: z.string().min(1).max(255),
  });

  const [initialValues] = React.useState({
    name: tenant?.name || '',
  });

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: initialValues,
  });

  const isEdit = Boolean(tenant?.id);

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => {
      if (isEdit) {
        return tenantUpdateApiCall(tenant!.id, data);
      } else {
        return tenantCreateApiCall(data);
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit
          ? dictionary.tenant.form.edit.success
          : dictionary.tenant.form.new.success,
      });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    mutation.mutateAsync(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose} data-testid="tenant-form-dialog">
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {isEdit
                  ? dictionary.tenant.form.edit.title
                  : dictionary.tenant.form.new.title}
              </DialogTitle>
            </DialogHeader>
            <div>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dictionary.tenant.form.name}</FormLabel>
                        <Input
                          disabled={mutation.isPending || mutation.isSuccess}
                          autoFocus
                          {...field}
                        />
                        <FormMessage data-testid="name-error" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              {onDestroy && hasPermissionToDestroyTenant ? (
                <Button
                  disabled={mutation.isPending || mutation.isSuccess}
                  variant="destructive"
                  onClick={onDestroy}
                  type="button"
                >
                  {dictionary.shared.delete}
                </Button>
              ) : null}
              <Button
                disabled={mutation.isPending || mutation.isSuccess}
                variant="outline"
                onClick={onClose}
                type="button"
              >
                {dictionary.shared.cancel}
              </Button>
              <Button
                disabled={mutation.isPending || mutation.isSuccess}
                type="submit"
              >
                {(mutation.isPending || mutation.isSuccess) && (
                  <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {dictionary.shared.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
