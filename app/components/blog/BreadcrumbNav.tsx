import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { Page } from '@salla.sa/twilight-theme-engine/types';

export interface BreadcrumbNavProps {
  page: Page;
  /** The classes Twig puts on `<nav class="breadcrumbs …">`. */
  className: string;
}

/**
 * Twig's `<nav class="breadcrumbs …"><salla-breadcrumb></salla-breadcrumb></nav>`.
 *
 * The engine `Breadcrumb` renders that `<nav>` itself (with our classes) but
 * renders nothing when the merchant turns breadcrumbs off. Twig keeps the empty
 * `<nav>` then ("make a space in case breadcrumbs is off"), so this does too.
 */
export function BreadcrumbNav({ page, className }: BreadcrumbNavProps) {
  const { theme } = useTwilight();
  const enabled = (theme?.settings as Record<string, unknown> | undefined)?.is_breadcrumbs_enabled ?? true;
  if (!enabled) return <nav className={className} aria-label="Breadcrumb" />;
  return <Breadcrumb page={page} className={className} />;
}
