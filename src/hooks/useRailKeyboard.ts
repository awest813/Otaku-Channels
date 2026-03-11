'use client';

import * as React from 'react';

/**
 * useRailKeyboard
 *
 * Adds keyboard (and gamepad-style) navigation to a horizontal media rail.
 * - ArrowLeft / ArrowRight (or gamepad D-pad) moves focus between cards.
 * - Home / End jump to the first / last card.
 * - The rail container itself receives roving-tabindex management so the
 *   whole rail is a single tab stop; once focused, arrow keys move inside.
 *
 * Usage:
 *   const { railProps, getItemProps } = useRailKeyboard(itemCount);
 *   <div {...railProps}>
 *     {items.map((item, i) => <div key={item.id} {...getItemProps(i)}>…</div>)}
 *   </div>
 */
export function useRailKeyboard(itemCount: number) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Focus the card at the given index
  const focusItem = React.useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const items = container.querySelectorAll<HTMLElement>('[data-rail-item]');
    const el = items[index];
    if (el) {
      el.focus();
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (itemCount === 0) return;

      const current = activeIndex ?? 0;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          e.preventDefault();
          const next = Math.min(current + 1, itemCount - 1);
          setActiveIndex(next);
          focusItem(next);
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          e.preventDefault();
          const prev = Math.max(current - 1, 0);
          setActiveIndex(prev);
          focusItem(prev);
          break;
        }
        case 'Home': {
          e.preventDefault();
          setActiveIndex(0);
          focusItem(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          const last = itemCount - 1;
          setActiveIndex(last);
          focusItem(last);
          break;
        }
        default:
          break;
      }
    },
    [activeIndex, itemCount, focusItem]
  );

  // When focus leaves the rail entirely, reset active index
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setActiveIndex(null);
      }
    },
    []
  );

  // When a card inside the rail gains focus (e.g. via mouse click), sync index
  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const items = Array.from(
        container.querySelectorAll<HTMLElement>('[data-rail-item]')
      );
      const idx = items.indexOf(e.target as HTMLElement);
      if (idx !== -1) setActiveIndex(idx);
    },
    []
  );

  const railProps = {
    ref: containerRef,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    onFocus: handleFocus,
    role: 'list' as const,
  };

  const getItemProps = (index: number) => ({
    'data-rail-item': true,
    role: 'listitem' as const,
    tabIndex:
      activeIndex === index || (activeIndex === null && index === 0) ? 0 : -1,
  });

  return { railProps, getItemProps };
}
