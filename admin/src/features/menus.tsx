import { FaChartPie } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';
import { LuHistory, LuLayoutGrid, LuUsers } from 'react-icons/lu';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { AppContext } from 'src/shared/controller/appContext';

export function menus(context: AppContext) {
  const menus: Array<{
    id: string;
    label: string;
    href: string;
    Icon: IconType;
    isExact?: boolean;
    createHref?: string;
  }> = [];

  menus.push({
    id: 'dashboard',
    label: context.dictionary.shared.dashboard,
    href: `/`,
    Icon: FaChartPie,
    isExact: true,
  });

  if (hasPermission(permissions.auditLogRead, context)) {
    menus.push({
      id: 'auditLog',
      label: context.dictionary.auditLog.list.menu,
      href: `/audit-log`,
      Icon: LuHistory,
    });
  }

  if (hasPermission(permissions.membershipRead, context)) {
    menus.push({
      id: 'membership',
      label: context.dictionary.membership.list.menu,
      href: `/membership`,
      Icon: LuUsers,
      createHref: hasPermission(permissions.membershipCreate, context)
        ? '/membership/new'
        : undefined,
    });
  }

  if (hasPermission(permissions.accountRead, context)) {
    menus.push({
      id: 'account',
      label: context.dictionary.account.list.menu,
      href: `/account`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.accountCreate, context)
          ? `/account/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.walletRead, context)) {
    menus.push({
      id: 'wallet',
      label: context.dictionary.wallet.list.menu,
      href: `/wallet`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.walletCreate, context)
          ? `/wallet/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.depositRead, context)) {
    menus.push({
      id: 'deposit',
      label: context.dictionary.deposit.list.menu,
      href: `/deposit`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.depositCreate, context)
          ? `/deposit/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.withdrawalRead, context)) {
    menus.push({
      id: 'withdrawal',
      label: context.dictionary.withdrawal.list.menu,
      href: `/withdrawal`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.withdrawalCreate, context)
          ? `/withdrawal/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.orderRead, context)) {
    menus.push({
      id: 'order',
      label: context.dictionary.order.list.menu,
      href: `/order`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.orderCreate, context)
          ? `/order/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.assetRead, context)) {
    menus.push({
      id: 'asset',
      label: context.dictionary.asset.list.menu,
      href: `/asset`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.assetCreate, context)
          ? `/asset/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.instrumentRead, context)) {
    menus.push({
      id: 'instrument',
      label: context.dictionary.instrument.list.menu,
      href: `/instrument`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.instrumentCreate, context)
          ? `/instrument/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.ledgerEventRead, context)) {
    menus.push({
      id: 'ledgerEvent',
      label: context.dictionary.ledgerEvent.list.menu,
      href: `/ledger-event`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.ledgerEventCreate, context)
          ? `/ledger-event/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.ledgerEntryRead, context)) {
    menus.push({
      id: 'ledgerEntry',
      label: context.dictionary.ledgerEntry.list.menu,
      href: `/ledger-entry`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.ledgerEntryCreate, context)
          ? `/ledger-entry/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.tradeRead, context)) {
    menus.push({
      id: 'trade',
      label: context.dictionary.trade.list.menu,
      href: `/trade`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.tradeCreate, context)
          ? `/trade/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.fillRead, context)) {
    menus.push({
      id: 'fill',
      label: context.dictionary.fill.list.menu,
      href: `/fill`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.fillCreate, context)
          ? `/fill/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.postRead, context)) {
    menus.push({
      id: 'post',
      label: context.dictionary.post.list.menu,
      href: `/post`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.postCreate, context)
          ? `/post/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.commentRead, context)) {
    menus.push({
      id: 'comment',
      label: context.dictionary.comment.list.menu,
      href: `/comment`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.commentCreate, context)
          ? `/comment/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.articleRead, context)) {
    menus.push({
      id: 'article',
      label: context.dictionary.article.list.menu,
      href: `/article`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.articleCreate, context)
          ? `/article/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.chatRead, context)) {
    menus.push({
      id: 'chat',
      label: context.dictionary.chat.list.menu,
      href: `/chat`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.chatCreate, context)
          ? `/chat/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.chateeRead, context)) {
    menus.push({
      id: 'chatee',
      label: context.dictionary.chatee.list.menu,
      href: `/chatee`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.chateeCreate, context)
          ? `/chatee/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.messageRead, context)) {
    menus.push({
      id: 'message',
      label: context.dictionary.message.list.menu,
      href: `/message`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.messageCreate, context)
          ? `/message/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.feeScheduleRead, context)) {
    menus.push({
      id: 'feeSchedule',
      label: context.dictionary.feeSchedule.list.menu,
      href: `/fee-schedule`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.feeScheduleCreate, context)
          ? `/fee-schedule/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.balanceSnapshotRead, context)) {
    menus.push({
      id: 'balanceSnapshot',
      label: context.dictionary.balanceSnapshot.list.menu,
      href: `/balance-snapshot`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.balanceSnapshotCreate, context)
          ? `/balance-snapshot/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.systemAccountRead, context)) {
    menus.push({
      id: 'systemAccount',
      label: context.dictionary.systemAccount.list.menu,
      href: `/system-account`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.systemAccountCreate, context)
          ? `/system-account/new`
          : undefined,
    });
  }
  if (hasPermission(permissions.feedbackRead, context)) {
    menus.push({
      id: 'feedback',
      label: context.dictionary.feedback.list.menu,
      href: `/feedback`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.feedbackCreate, context)
          ? `/feedback/new`
          : undefined,
    });
  }

  return menus;
}
