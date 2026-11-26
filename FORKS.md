# Engine forks

These theme components are copies of engine components, rebuilt to match the View Twig theme. The engine does not
update them, so each upgrade of `@salla.sa/twilight-theme-engine` can leave them behind. This file
records where each one came from, so you can see what changed upstream.

**Base** is the engine version in the repo when the fork was last edited. It is the oldest
upstream change the fork might have taken in, not proof that it was synced then.

| Fork (`app/components/…`)     | Engine source (`tailwind/…` in the engine)    | Wired in by                                        | Base   | What the fork changes                                                                                      |
| ----------------------------- | --------------------------------------------- | -------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `product/ProductPage.tsx`     | `routes/product/ProductPage.tsx`              | `app/routes/$slug.p$id.tsx`                        | 1.0.149 | View's `product/single.twig` (`main` layout): tabs switch only the content column beside the sticky gallery; `sub_content.twig` description / features table; View's `#custom_product_view` sticky bar; theme `ProductsSlider` for related products |
| `product/ProductDetails.tsx`  | `components/product/ProductDetails.tsx`       | `ProductPage`                                      | 1.0.149 | View's `base_content.twig` (`imformation_base`): countdown / wishlist / share row, brand-or-store logo with title, tax / SKU / barcode, clipped description, price + discount badge + rating, weight / remained / sold, tags |
| `product/ProductGallery.tsx`  | `components/product/ProductGallery.tsx`       | `ProductPage`                                      | 1.0.149 | View's `slider_single.twig`: arrows + "n/total" counter, thumbs only with `ishidden` off, `enable_loop` / `enable_autoplay`; keeps the engine's SSR poster, lightbox and native-app gallery |
| `product/AddToCartForm.tsx`   | `components/product/AddToCartForm.tsx`        | `ProductPage`                                      | 1.0.149 | View's `base_content.twig` (`form_base`) + `partials/product/options.twig`: options as buttons (`show_singleOption` / `show_multipleOption`), quantity + final-price grid, cart-icon add button |
| `product/ProductListPage.tsx` | `routes/product-listing/ProductListPage.tsx`  | `registry` `product:list-page` in `app/router.tsx` | 1.0.149 | View's `product/index.twig` + `products.js`: bordered toolbar with the title, grid / list switch with a fade, sort select; filters sidebar (offcanvas below 1024px); `auto_load_products`; brand pages as `brands/single.twig`; fetched pages emit `products.fetched` through `lib/productsFetched.ts` |
| `cart/CartPage.tsx`           | `routes/cart/CartPage.tsx`                    | `app/routes/cart.tsx`                              | 1.0.149 | View's `cart.twig`: sidebar in Twig order (related products `CartRelatedProducts`, free shipping, `salla-loyalty-panel`, gifting, `salla-cart-coupons`, `salla-cart-summary-card`, tiered offer); error state with retry; a 404 cart calls `salla.cart.reset()` |
| `cart/CartItem.tsx`           | `components/cart/CartItem.tsx`                | `CartPage`                                         | 1.0.149 | View's `cart.twig` item card + `partials/product/options.twig` (options as buttons, attachments), `<salla-quantity-input>`, the form's native `change` → `salla.cart.updateItem` |
| `page/PageSingle.tsx`         | `routes/page/PageSingle.tsx`                  | `app/routes/$slug.page-$id.tsx`                    | 1.0.149 | View's `page-single.twig`: ribbon-title band, `content-entry` card, comments outside it; `customised` pages render only the `information_page.information_page` hook; keyed by page id |
| `pages/ThankYouPage.tsx`      | `routes/thank-you/ThankYouPage.tsx`           | `app/routes/thankyou.$orderId.tsx`                 | 1.0.149 | View's `thank-you.twig` + `thankyou.js` instead of the `<salla-thank-you-page>` family |
| `pages/LoyaltyPage.tsx`       | `routes/loyalty/LoyaltyPage.tsx`              | `app/routes/loyalty.tsx`                           | 1.0.149 | View's `loyalty.twig` + `loyalty.js` (hero, banner, ways to earn, prize sliders) instead of `<SallaLoyaltyProgram>` |
| `blog/BlogListPage.tsx`       | `routes/blog/BlogPage.tsx`                    | `app/routes/blog.tsx`, `blog_.$slug.c-$id.tsx`, `blog_.$slug.tag-$id.tsx`, `blog_.author.$id.tsx` | 1.0.149 | View's `blog/index.twig`: `skeleton.twig` cards (`BlogCard`), category sidebar and mobile dropdown, infinite list; `/blog` also loads the article list for its cursor |
| `blog/BlogSinglePage.tsx`     | `routes/blog/BlogSinglePage.tsx`              | `app/routes/blog_.$slug.a-$id.tsx`                 | 1.0.149 | View's `blog/single.twig` markup and colours |
| `account/ProfilePage.tsx`     | `routes/account/profile/ProfilePage.tsx`      | `app/routes/account.profile.tsx`                   | 1.0.149 | View's `customer/profile.twig` hand-built form instead of `<salla-user-profile>`; sets the `customer-profile` body class |
| `account/order/*`             | `routes/account/orders/single/*`, `OrderSinglePage` | `app/routes/account.orders.$id.tsx`          | 1.0.149 | View's `customer/orders/single.twig` title row (centred h1, inline gift tag, `order.links` as links), reservations in the options table; sets the `customer-orders-single` body class |
| `home/FixedProducts.tsx`      | `components/home/FixedProducts.tsx`           | `registerHomeComponents` in `app/router.tsx`       | 1.0.47 | Same markup, uses the theme `ProductCard`, shows the block's `limit` products instead of always 4, a store-wide horizontal `product_card_layout` beats `vertical_fixed_products`, which beats the block's `isVertical` (the engine reads `isVertical` first)        |
| `home/LatestProducts.tsx`     | `components/home/LatestProducts.tsx`          | `registerHomeComponents` in `app/router.tsx`       | 1.0.139 | Same markup, uses the theme `ProductCard` (the no-blocks home fallback)                                     |

## Upgrading the engine

The engine package ships each component's source as `tailwind/<path>.tsx.txt`, under the path in
**Engine source**. For each fork, compare that file between **Base** and the new version and port
what applies:

```bash
for v in 1.0.86 1.0.90; do
  mkdir -p engine-$v && tar -xzf "$(npm pack @salla.sa/twilight-theme-engine@$v --silent)" -C engine-$v
done
diff -u engine-1.0.86/package/tailwind/routes/product/ProductPage.tsx.txt \
  engine-1.0.90/package/tailwind/routes/product/ProductPage.tsx.txt
```

Then set **Base** to the new version. Packages before 1.0.86 have no source copy, so for an older
**Base** compare the fork with the 1.0.86 source in full.

## Adding a fork

Add a row here, and say at the top of the file's doc comment what differs from the engine. Fork
only when a hook slot, the `registry`, or a home-component key can't do the job: every fork is
code you now maintain by hand. See
[Fork a built-in route](https://docs.salla.dev/twilight/react/recipes/fork-a-built-in-route).
