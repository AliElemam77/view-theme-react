/**
 * The product card's side buttons open View's `#modal-container` (extentions.twig):
 * quick view (`modules.js` `openQuek`) or the related-products slider
 * (`openModelrelated`). The card only announces the request; `ViewProductModal`,
 * mounted once by the layout, listens and renders.
 */
export type ProductModalRequest = { kind: 'quick-view' | 'related'; productId: number };

export const PRODUCT_MODAL_EVENT = 'view::product-modal';

function request(detail: ProductModalRequest) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ProductModalRequest>(PRODUCT_MODAL_EVENT, { detail }));
}

export const openQuickView = (productId: number) => request({ kind: 'quick-view', productId });
export const openRelatedProducts = (productId: number) => request({ kind: 'related', productId });
