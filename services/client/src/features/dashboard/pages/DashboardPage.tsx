import { cookies } from 'next/headers';
import { AuditLogActivityChartCard } from 'src/features/auditLog/components/AuditLogActivityChartCard';
import { AuditLogActivityListCard } from 'src/features/auditLog/components/AuditLogActivityListCard';
import { AccountDashboardCard } from 'src/features/account/components/AccountDashboardCard';
import { WalletDashboardCard } from 'src/features/wallet/components/WalletDashboardCard';
import { DepositDashboardCard } from 'src/features/deposit/components/DepositDashboardCard';
import { MembershipDashboardCard } from 'src/features/membership/components/MembershipDashboardCard';
import { appContextForReact } from 'src/shared/controller/appContext';

export default async function DashboardPage() {
  const context = await appContextForReact(cookies());

  return (
    <div className="flex-1 space-y-6">
      <div className="mb-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MembershipDashboardCard context={context} />
          <AccountDashboardCard context={context} />
          <WalletDashboardCard context={context} />
          <DepositDashboardCard context={context} />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AuditLogActivityChartCard context={context} />
          <AuditLogActivityListCard context={context} />
        </div>
      </div>
    </div>
  );
}
