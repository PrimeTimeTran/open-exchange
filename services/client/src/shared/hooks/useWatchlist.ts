'use client';

import { useState } from 'react';
import {
  MOCK_WATCHLIST_CRYPTO,
  MOCK_WATCHLIST_DEFENSE,
  MOCK_WATCHLIST_TOP_15,
} from './mock-data/data';

export interface WatchlistItem {
  net: number;
  pct: number;
  rank: number;
  last: number;
  symbol: string;
  volume: string;
  check?: boolean;
  volumeRaw: number;
  selected?: boolean;
}

interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
}

export type SortDirection = 'asc' | 'desc';
export type SortKey = 'symbol' | 'last' | 'net' | 'pct' | 'volumeRaw';

export function useWatchlist() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    { id: 'top15', name: 'Top 15', items: MOCK_WATCHLIST_TOP_15 },
    { id: 'defense', name: 'Defense', items: MOCK_WATCHLIST_DEFENSE },
    { id: 'crypto', name: 'Crypto', items: MOCK_WATCHLIST_CRYPTO },
  ]);
  const [activeListId, setActiveListId] = useState('defense');
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const activeList =
    watchlists.find((w) => w.id === activeListId) || watchlists[0];

  const items = activeList.items;

  const createList = (name: string) => {
    const newList: Watchlist = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      items: [],
    };
    setWatchlists([...watchlists, newList]);
    setActiveListId(newList.id);
    setCreateDialogOpen(false);
  };

  return {
    items,
    activeList,
    watchlists,
    createList,
    setActiveListId,
    isCreateDialogOpen,
    setCreateDialogOpen,
  };
}
