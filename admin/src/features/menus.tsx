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
  if (hasPermission(permissions.itemRead, context)) {
    menus.push({
      id: 'item',
      label: context.dictionary.item.list.menu,
      href: `/item`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.itemCreate, context)
        ? `/item/new`
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
  if (hasPermission(permissions.tradeFillRead, context)) {
    menus.push({
      id: 'tradeFill',
      label: context.dictionary.tradeFill.list.menu,
      href: `/trade-fill`,
      Icon: LuLayoutGrid,
      createHref: hasPermission(permissions.tradeFillCreate, context)
        ? `/trade-fill/new`
        : undefined,
    });
  }

  return menus;
}
