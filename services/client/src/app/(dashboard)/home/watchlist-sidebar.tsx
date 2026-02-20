'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  ChevronDown,
  GripVertical,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import {
  useSensor,
  DndContext,
  useSensors,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Button } from '@/components/ui';
import { WATCHLIST, LISTS } from './data';

interface ListItem {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
  name: string;
}

function SortableItem({ item, index }: { item: ListItem; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.symbol });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  const getHref = (item: ListItem) => {
    // If it looks like an option (e.g. "SPY 480C"), route to options page for underlying
    if (item.symbol.includes(' ')) {
      return `/options/${item.symbol.split(' ')[0]}`;
    }
    return `/assets/${item.symbol}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-secondary/30 hover:bg-secondary/50'
          : 'bg-background hover:bg-secondary/10'
      }`}
    >
      <div className="relative flex items-center">
        {/* Drag Handle - Full height overlay on left side */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab z-20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </div>

        <Link
          href={getHref(item)}
          className="p-4 pl-10 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group flex-1"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex flex-col min-w-0">
              <span className="font-bold truncate">{item.symbol}</span>
              <span className="text-xs text-muted-foreground truncate">
                {item.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 ml-2">
            <span className="font-medium">{item.price}</span>
            <span
              className={`text-xs font-medium flex items-center ${
                item.up ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {item.up ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {item.change}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function WatchlistSection({
  title,
  items,
  onReorder,
  allExpanded,
}: {
  title: string;
  items: ListItem[];
  onReorder: (items: ListItem[]) => void;
  allExpanded?: boolean | null;
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Sync with parent expand/collapse state if provided
  React.useEffect(() => {
    if (allExpanded !== null && allExpanded !== undefined) {
      setIsOpen(allExpanded);
    }
  }, [allExpanded]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.symbol === active.id);
      const newIndex = items.findIndex((i) => i.symbol === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="border-t border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="bg-muted p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 flex items-center justify-between hover:text-foreground transition-colors">
            {title}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? '' : '-rotate-90'
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.symbol)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-border">
                {items.map((item, index) => (
                  <SortableItem key={item.symbol} item={item} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function WatchlistSidebar() {
  // avoid mismatched IDs from dnd-kit during SSR hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [watchlist, setWatchlist] = useState(WATCHLIST);
  const [categories, setCategories] = useState(LISTS);
  const [allExpanded, setAllExpanded] = useState<boolean | null>(null);

  if (!mounted) {
    // render nothing (or a placeholder) on the server / before hydration
    return null;
  }

  const handleCategoryReorder = (
    category: keyof typeof LISTS,
    newItems: ListItem[],
  ) => {
    setCategories((prev) => ({
      ...prev,
      [category]: newItems,
    }));
  };

  const toggleAll = () => {
    setAllExpanded((prev) => (prev === false ? true : false));
  };

  return (
    <div className="lg:w-80 w-full shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold">Lists</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={toggleAll}
              >
                {allExpanded === false ? 'Expand All' : 'Collapse All'}
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div>
            {/* <div className="border-none">
              <WatchlistSection
                title="Watchlist"
                items={watchlist}
                onReorder={setWatchlist}
                allExpanded={allExpanded}
              />
            </div> */}

            {/* Render Categories */}
            {(Object.keys(categories) as Array<keyof typeof LISTS>).map(
              (category) => (
                <WatchlistSection
                  key={category}
                  title={category}
                  items={categories[category]}
                  onReorder={(items) => handleCategoryReorder(category, items)}
                  allExpanded={allExpanded}
                />
              ),
            )}
          </div>
        </div>

        {/* Deposit Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center space-y-4">
          <h3 className="font-bold">Fund your account</h3>
          <p className="text-sm text-muted-foreground">
            You're ready to trade! Deposit funds to start building your
            portfolio.
          </p>
          <Link href="/account?tab=deposit" className="w-full block">
            <Button className="w-full">Deposit Funds</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
