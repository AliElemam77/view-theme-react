// Copied from the engine's `tailwind/routes/account/orders/single/types.ts` for the order-page fork.
import type { ReactNode } from 'react';
import type { OrderSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/account/orders';

export type Order = OrderSinglePageProps['order'];
export type OrderItem = Order['items'][number];

export interface TwigRating {
  id?: number;
  stars?: number;
  content?: string;
  can_update?: boolean;
}

export interface TwigItem {
  name: string;
  quantity: number;
  product?: { id: number; url?: string; type?: string; image?: { url?: string } };
  options?: unknown[];
}

/** The order as `orders/{id}` answers a non-React theme: what the Twig templates read. */
export interface TwigOrder {
  items: TwigItem[];
  links?: Array<{ url: string; label: string }>;
  shipping?: {
    id?: number;
    name?: string;
    logo?: string;
    number?: string;
    tracing_link?: string | null;
  };
  rating?: { store?: TwigRating; shipping?: TwigRating } | unknown[];
  can_rate?: boolean;
  is_pickable?: boolean;
  options?: Array<{
    options?: Array<{
      name: string;
      value: string;
      price?: unknown;
      reservations?: import('./OrderItemRow').Reservation[];
    }>;
  }>;
}

export type FormatMoney = (amount: number, currency?: string) => ReactNode;
