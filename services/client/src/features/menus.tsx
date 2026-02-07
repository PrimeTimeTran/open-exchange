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
    href: `/admin`,
    Icon: FaChartPie,
    isExact: true,
  });

  if (hasPermission(permissions.auditLogRead, context)) {
    menus.push({
      id: 'auditLog',
      label: context.dictionary.auditLog.list.menu,
      href: `/admin/audit-log`,
      Icon: LuHistory,
    });
  }

  if (hasPermission(permissions.membershipRead, context)) {
    menus.push({
      id: 'membership',
      label: context.dictionary.membership.list.menu,
      href: `/admin/membership`,
      Icon: LuUsers,
      createHref: hasPermission(permissions.membershipCreate, context)
        ? '/admin/membership/new'
        : undefined,
    });
  }

  if (hasPermission(permissions.accountRead, context)) {
    menus.push({
      id: 'account',
      label: context.dictionary.account.list.menu,
      href: `/admin/account`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.accountCreate, context)
        ? `/admin/account/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.depositRead, context)) {
    menus.push({
      id: 'deposit',
      label: context.dictionary.deposit.list.menu,
      href: `/admin/deposit`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.depositCreate, context)
        ? `/admin/deposit/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.withdrawalRead, context)) {
    menus.push({
      id: 'withdrawal',
      label: context.dictionary.withdrawal.list.menu,
      href: `/admin/withdrawal`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.withdrawalCreate, context)
        ? `/admin/withdrawal/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.walletRead, context)) {
    menus.push({
      id: 'wallet',
      label: context.dictionary.wallet.list.menu,
      href: `/admin/wallet`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.walletCreate, context)
        ? `/admin/wallet/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.orderRead, context)) {
    menus.push({
      id: 'order',
      label: context.dictionary.order.list.menu,
      href: `/admin/order`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.orderCreate, context)
        ? `/admin/order/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.fillRead, context)) {
    menus.push({
      id: 'fill',
      label: context.dictionary.fill.list.menu,
      href: `/admin/fill`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.fillCreate, context)
        ? `/admin/fill/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.tradeRead, context)) {
    menus.push({
      id: 'trade',
      label: context.dictionary.trade.list.menu,
      href: `/admin/trade`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.tradeCreate, context)
        ? `/admin/trade/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.assetRead, context)) {
    menus.push({
      id: 'asset',
      label: context.dictionary.asset.list.menu,
      href: `/admin/asset`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.assetCreate, context)
        ? `/admin/asset/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.instrumentRead, context)) {
    menus.push({
      id: 'instrument',
      label: context.dictionary.instrument.list.menu,
      href: `/admin/instrument`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.instrumentCreate, context)
        ? `/admin/instrument/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.feeScheduleRead, context)) {
    menus.push({
      id: 'feeSchedule',
      label: context.dictionary.feeSchedule.list.menu,
      href: `/admin/fee-schedule`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.feeScheduleCreate, context)
        ? `/admin/fee-schedule/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.balanceSnapshotRead, context)) {
    menus.push({
      id: 'balanceSnapshot',
      label: context.dictionary.balanceSnapshot.list.menu,
      href: `/admin/balance-snapshot`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.balanceSnapshotCreate, context)
        ? `/admin/balance-snapshot/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.systemAccountRead, context)) {
    menus.push({
      id: 'systemAccount',
      label: context.dictionary.systemAccount.list.menu,
      href: `/admin/system-account`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.systemAccountCreate, context)
        ? `/admin/system-account/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.referralRead, context)) {
    menus.push({
      id: 'referral',
      label: context.dictionary.referral.list.menu,
      href: `/admin/referral`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.referralCreate, context)
        ? `/admin/referral/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.listingRead, context)) {
    menus.push({
      id: 'listing',
      label: context.dictionary.listing.list.menu,
      href: `/admin/listing`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.listingCreate, context)
        ? `/admin/listing/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.feedbackRead, context)) {
    menus.push({
      id: 'feedback',
      label: context.dictionary.feedback.list.menu,
      href: `/admin/feedback`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.feedbackCreate, context)
        ? `/admin/feedback/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.marketMakerRead, context)) {
    menus.push({
      id: 'marketMaker',
      label: context.dictionary.marketMaker.list.menu,
      href: `/admin/market-maker`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.marketMakerCreate, context)
        ? `/admin/market-maker/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.ledgerEventRead, context)) {
    menus.push({
      id: 'ledgerEvent',
      label: context.dictionary.ledgerEvent.list.menu,
      href: `/admin/ledger-event`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.ledgerEventCreate, context)
        ? `/admin/ledger-event/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.ledgerEntryRead, context)) {
    menus.push({
      id: 'ledgerEntry',
      label: context.dictionary.ledgerEntry.list.menu,
      href: `/admin/ledger-entry`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.ledgerEntryCreate, context)
        ? `/admin/ledger-entry/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.articleRead, context)) {
    menus.push({
      id: 'article',
      label: context.dictionary.article.list.menu,
      href: `/admin/article`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.articleCreate, context)
        ? `/admin/article/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.postRead, context)) {
    menus.push({
      id: 'post',
      label: context.dictionary.post.list.menu,
      href: `/admin/post`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.postCreate, context)
        ? `/admin/post/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.commentRead, context)) {
    menus.push({
      id: 'comment',
      label: context.dictionary.comment.list.menu,
      href: `/admin/comment`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.commentCreate, context)
        ? `/admin/comment/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.chatRead, context)) {
    menus.push({
      id: 'chat',
      label: context.dictionary.chat.list.menu,
      href: `/admin/chat`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.chatCreate, context)
        ? `/admin/chat/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.chaterRead, context)) {
    menus.push({
      id: 'chater',
      label: context.dictionary.chater.list.menu,
      href: `/admin/chater`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.chaterCreate, context)
        ? `/admin/chater/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.messageRead, context)) {
    menus.push({
      id: 'message',
      label: context.dictionary.message.list.menu,
      href: `/admin/message`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.messageCreate, context)
        ? `/admin/message/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.notificationRead, context)) {
    menus.push({
      id: 'notification',
      label: context.dictionary.notification.list.menu,
      href: `/admin/notification`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.notificationCreate, context)
        ? `/admin/notification/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.userNotificationRead, context)) {
    menus.push({
      id: 'userNotification',
      label: context.dictionary.userNotification.list.menu,
      href: `/admin/user-notification`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.userNotificationCreate, context)
        ? `/admin/user-notification/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.jobRead, context)) {
    menus.push({
      id: 'job',
      label: context.dictionary.job.list.menu,
      href: `/admin/job`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.jobCreate, context)
        ? `/admin/job/new`
        : undefined,
    });
  }
  if (hasPermission(permissions.candidateRead, context)) {
    menus.push({
      id: 'candidate',
      label: context.dictionary.candidate.list.menu,
      href: `/admin/candidate`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.candidateCreate, context)
        ? `/admin/candidate/new`
        : undefined,
    });
  }
  return menus;
}
