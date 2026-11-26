import { lazy } from 'react';
import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import { registry } from '@salla.sa/twilight-theme-engine';
import {
  registerHomeComponents,
  registerHomeComponentConfig,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
import { SliderSkeleton } from '@salla.sa/twilight-components-react';
import { routeTree } from './routeTree.gen';
import {
  Brands,
  FixedProducts,
  LatestProducts,
  MainLinks,
  VBannerLine,
  VCountdownBanner,
  VMarque,
  VTextBlock,
  VMultiSlider,
  VStyledCategories,
  VFeaturedProduct,
  VProductBundle,
  VBrandsSlider,
  VTaggedProducts,
  VReviewsWithProduct,
  VStoreFeatures,
  VProductsSlider,
  VOfferCollection,
  VProductHighlight,
  VNestedCategories,
  VLinksGallery,
  VGroupFeatures,
  VMixedReviews,
  VFaq,
  VBlogPosts,
  VInstagramFeed,
} from './components/home';
import { ViewFeaturedProducts, viewFeaturedProductsConfig } from './components/home/ViewFeaturedProducts';
import { ViewPhotosSlider, photosSliderConfig } from './components/home/ViewPhotosSlider';
import {
  SliderProductsWithHeader,
  sliderProductsWithHeaderConfig,
} from './components/home/SliderProductsWithHeader';
import {
  EnhancedSquareBanners,
  enhancedSquareBannersConfig,
} from './components/home/EnhancedSquareBanners';
import { registerThemeHooks } from './hooks';
import { ProductListSkeleton } from './components/product/ProductListSkeleton';
import { ProductCard } from './components/product/ProductCard';

const ProductListPage = lazy(() =>
  import('./components/product/ProductListPage').then((m) => ({ default: m.ProductListPage }))
);

// Register theme-level hooks (AddProductToast, DigitalFilesSettings, etc.)
registerThemeHooks();

registry.register('product:list-page', ProductListPage);
// View's card (`product-card.js`) for every engine list too: register, then override.
registry.register('product:card', ProductCard);
registry.override('product:card', ProductCard);
registry.register('product:list-skeleton', ProductListSkeleton);

// View's home blocks (`src/views/components/home/*.twig`), by twilight.json path.
// The renderer looks a block up as `key:<view_style>` before `key`, and the
// spread defaults carry the engine's `featured-products:styleN`, so those are
// bound too. Keys View's twilight.json doesn't offer keep the engine defaults.
registerHomeComponents({
  ...DefaultHomeComponents,
  brands: Brands,
  'main-links': MainLinks,
  'photos-slider': ViewPhotosSlider,
  'featured-products': ViewFeaturedProducts,
  'featured-products:style1': ViewFeaturedProducts,
  'featured-products:style2': ViewFeaturedProducts,
  'featured-products:style3': ViewFeaturedProducts,
  // Forks of the engine blocks so their grids render the theme's ProductCard.
  'fixed-products': FixedProducts,
  'latest-products': LatestProducts,
  'slider-products-with-header': SliderProductsWithHeader,
  'enhanced-square-banners': EnhancedSquareBanners,
  // Custom View Components (22)
  V_banner_line: VBannerLine,
  'home.V_banner_line': VBannerLine,
  V_countdown_banner: VCountdownBanner,
  'home.V_countdown_banner': VCountdownBanner,
  V_marque: VMarque,
  'home.V_marque': VMarque,
  V_text_block: VTextBlock,
  'home.V_text_block': VTextBlock,
  V_multi_slider: VMultiSlider,
  'home.V_multi_slider': VMultiSlider,
  V_styled_categories: VStyledCategories,
  'home.V_styled_categories': VStyledCategories,
  V_featured_product: VFeaturedProduct,
  'home.V_featured_product': VFeaturedProduct,
  V_product_bundle: VProductBundle,
  'home.V_product_bundle': VProductBundle,
  V_brands_slider: VBrandsSlider,
  'home.V_brands_slider': VBrandsSlider,
  V_tagged_products: VTaggedProducts,
  'home.V_tagged_products': VTaggedProducts,
  V_reviews_with_product: VReviewsWithProduct,
  'home.V_reviews_with_product': VReviewsWithProduct,
  V_store_features: VStoreFeatures,
  'home.V_store_features': VStoreFeatures,
  V_products_slider: VProductsSlider,
  'home.V_products_slider': VProductsSlider,
  V_offer_collection: VOfferCollection,
  'home.V_offer_collection': VOfferCollection,
  V_product_highlight: VProductHighlight,
  'home.V_product_highlight': VProductHighlight,
  V_nested_categories: VNestedCategories,
  'home.V_nested_categories': VNestedCategories,
  V_links_gallery: VLinksGallery,
  'home.V_links_gallery': VLinksGallery,
  V_group_features: VGroupFeatures,
  'home.V_group_features': VGroupFeatures,
  V_mixed_reviews: VMixedReviews,
  'home.V_mixed_reviews': VMixedReviews,
  V_faq: VFaq,
  'home.V_faq': VFaq,
  V_blog_posts: VBlogPosts,
  'home.V_blog_posts': VBlogPosts,
  V_instagram_feed: VInstagramFeed,
  'home.V_instagram_feed': VInstagramFeed,
});

// Each Twig block opens its own `<section>`; the renderer's wrapper takes those classes.
registerHomeComponentConfig({
  'featured-products': viewFeaturedProductsConfig,
  'photos-slider': { ...photosSliderConfig, placeholder: <SliderSkeleton /> },
  'slider-products-with-header': sliderProductsWithHeaderConfig,
  'enhanced-square-banners': enhancedSquareBannersConfig,
  'main-links': {
    height: '112px',
    placeholder: <SliderSkeleton />,
    // main-links.twig's field and wrapper (`s-block--categories`); `--main-links`
    // stays for the pre-hydration rules in home-blocks.scss. The merge rule only
    // matches right after a full-bg block (home.scss), so the first block never merges.
    className: (data) => {
      const mergeWithTop = data.merge_with_top_component;
      return [
        's-block',
        's-block--categories',
        's-block--main-links',
        mergeWithTop ? 'merge-with-top-component' : '',
        !data.title && mergeWithTop ? 'merged-has-no-title' : '',
      ]
        .filter(Boolean)
        .join(' ');
    },
  },
});

// Singleton for client-side (preserves QueryClient cache across navigations)
// SSR creates fresh instances per request via getRouter()
let clientRouter: ReturnType<typeof createRouter> | null = null;

// TanStack Start expects getRouter() for SSR compatibility
export function getRouter() {
  // On client: reuse existing router to preserve QueryClient cache
  if (typeof window !== 'undefined' && clientRouter) {
    return clientRouter;
  }

  // On SSR or first client load: create new router
  const router = createRouter(routeTree);

  // Cache for client-side
  if (typeof window !== 'undefined') {
    clientRouter = router;
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
