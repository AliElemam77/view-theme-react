# Theme Conversion Inventory: View (فيو) Twig to React

## 1. Starting Point

- **TWIG Theme Source**: `d:\projects\view`
- **TWIG Head Commit**: `dd5074394970e2f52dd1f70be2cbbc16b9b94474`
- **TWIG Working Tree Status**: Clean (no uncommitted changes)
- **Foundation React Starter**: `@salla.sa/theme-raed@1.0.64`
- **Target React Repository**: `https://github.com/AliElemam77/view-theme-react.git`
- **Baseline Checks**: `pnpm install`, `pnpm build`, `pnpm typecheck`, `pnpm test` (69 test files, 642 tests passed), and `pnpm check:manifest` (0 errors, 0 warnings) all passed.

---

## 2. Components Inventory

`TWIG/twilight.json` declares **26 home components**:
- **4 Stock (Theme Raed) Components, customized in View**:
  - `home.main-links` (3,031 B .twig, 9 fields) — stock block with View styling and display toggles
  - `home.slider-products-with-header` (2,354 B .twig, 6 fields) — stock block with custom header classes
  - `home.enhanced-square-banners` (2,098 B .twig, 2 fields) — stock block
  - `home.brands` (2,435 B .twig, 3 fields) — stock block with grid/carousel presentation
- **22 Custom Components (`home.V_*`)**:
  - `home.V_multi_slider` (18,754 B .twig, 34 fields) — multi-layout hero banner & slider with slide variations, videos, tabs, overlays
  - `home.V_styled_categories` (5,964 B .twig, 27 fields) — styled category grid and carousel with custom borders and badges
  - `home.V_featured_product` (5,380 B .twig, 30 fields) — featured product showcase with countdown, badges, ratings
  - `home.V_product_bundle` (3,311 B .twig, 17 fields) — bundle offers with multi-product quick add to cart
  - `home.V_text_block` (4,382 B .twig, 26 fields) — formatted content block with CTAs and backgrounds
  - `home.V_brands_slider` (2,003 B .twig, 19 fields) — marquee/slider of brand logos with mask
  - `home.V_tagged_products` (3,255 B .twig, 27 fields) — products filtered by tag with banner header
  - `home.V_countdown_banner` (4,499 B .twig, 30 fields) — countdown sales banner with timer and action button
  - `home.V_reviews_with_product` (4,719 B .twig, 12 fields) — product reviews linked with live product thumbnail
  - `home.V_store_features` (4,426 B .twig, 15 fields) — trust badges and feature grid with icons
  - `home.V_products_slider` (3,678 B .twig, 26 fields) — responsive products slider with coupon banner option
  - `home.V_offer_collection` (4,877 B .twig, 20 fields) — bundle collection calculator showing total original vs offer price
  - `home.V_product_highlight` (4,825 B .twig, 21 fields) — single highlighted product with detailed perks and video/image
  - `home.V_nested_categories` (3,372 B .twig, 20 fields) — hierarchical categories tree/chips
  - `home.V_links_gallery` (3,369 B .twig, 15 fields) — visual link cards with hover zoom
  - `home.V_group_features` (8,378 B .twig, 17 fields) — grouped store highlights and USP icons
  - `home.V_mixed_reviews` (6,151 B .twig, 19 fields) — testimonial cards with rating and customer quotes
  - `home.V_faq` (3,060 B .twig, 17 fields) — accordion FAQ block with search and expansion
  - `home.V_blog_posts` (1,977 B .twig, 16 fields) — latest blog posts carousel
  - `home.V_instagram_feed` (2,479 B .twig, 12 fields) — social media image grid
  - `home.V_marque` (4,102 B .twig, 17 fields) — infinite ticker text marquee
  - `home.V_banner_line` (3,630 B .twig, 22 fields) — promotional thin banners with entrance animations

---

## 3. Global Settings

`TWIG/twilight.json` has **143 total settings** (12 static dividers/headers + 131 non-static settings).
All **131 non-static settings** are referenced in `TWIG/src` (100% referenced):

1. **اعدادات عامة (General Settings)** (13 settings):
   - `dark_mode_theme`, `theme_color_mode`, `active_time_mode`, `open_time`, `close_time`, `font_main`, `cart_style`, `has_animation`, `sticky_add_to_cart`, `header_is_sticky`, `show_rating`, `show_brand_name`, `show_similar_products`
2. **إعدادات الوضع الفاتح (Light Mode Settings)** (7 settings):
   - `color_primary_light`, `color_primary_dark_light`, `color_primary_light_light`, `color_bg_light`, `color_cards_light`, `color_text_light`, `color_price_light`
3. **إعدادات الوضع الليلي (Dark Mode Settings)** (9 settings):
   - `color_primary_dark`, `color_primary_dark_dark`, `color_primary_light_dark`, `color_bg_dark`, `color_cards_dark`, `color_text_dark`, `color_price_dark`, `color_borders_dark`, `color_inputs_dark`
4. **إعدادات وضع الكربون (Carbon Mode Settings)** (9 settings):
   - `color_primary_carbon`, `color_primary_dark_carbon`, `color_primary_light_carbon`, `color_bg_carbon`, `color_cards_carbon`, `color_text_carbon`, `color_price_carbon`, `color_borders_carbon`, `color_inputs_carbon`
5. **إعدادات مكون قائمة عناصر (Menu Component)** (2 settings):
   - `menu_component_style`, `menu_items_limit`
6. **خيارات أعلى الصفحة (Header Options)** (16 settings):
   - Top banner, notification bar, logo styling, search behavior, user icons, navigation style
7. **اعدادات بطاقه المنتج (Product Card Settings)** (23 settings):
   - Card border radius, badge positions, hover effects, quick add button, wishlist icon, price layout, rating display, discount tag
8. **خيارات صفحة المنتج (Product Page Options)** (23 settings):
   - Gallery style, sticky cart bar, tabs layout, installment banners, related products count, description layout
9. **خيارات صفحه السلة (Cart Page Options)** (1 setting):
   - `cart_progress_bar`
10. **إعدادات تذييل الصفحة (Footer Settings)** (25 settings):
    - Multi-column footer layout, copyright text, payment methods, tax number, social icons, newsletter subscription
11. **خيارات صفحة التصنيفات (Category Page Options)** (3 settings):
    - Category view style, filters visibility, subcategories display

---

## 4. Shared Fields

- **Container and Spacing**:
  - `has_container` (boolean) — wraps section in store container (`.container`)
  - `notmrb` (boolean) — eliminates section top/bottom padding (`my-0` / `py-0`)
- **Headers & Titles**:
  - `main_title` (string/text) — section heading `<h2>`
  - `sub_title` (string/text) — section descriptive subtitle `<p>`
  - `title` (string/text) — generic title
- **Call-to-Action Buttons**:
  - `btn_text`, `btn_url`, `btn_style`
- **Discount & Promotions**:
  - `has_discount_code` (boolean), `discount_title` (string), `discount_code` (string)
- **Styling Dividers**:
  - `mmm`, `sdfgq`, `sdfgggztq` (static styling markers)

---

## 5. Twig Theme Changes from Stock Twig Raed

Comparing initial import commit `c321b1b` to `dd50743`:
- **Theme Identity**: Renamed to "فيو" / "view", Apqrinu authoring, custom `twilight.json` with 143 settings.
- **Color Modes**: Added full 3-state dark mode system including standard Dark mode and custom **Carbon** mode (`[data-theme="carbon"]`).
- **Product Card**: Replaced stock card with custom enhanced card component featuring quick-view, custom action buttons, floating discount badges, and responsive aspect ratios.
- **Home Layout**: Added 22 custom modular blocks (`V_*`) with dynamic options for banners, counters, testimonials, bundles, FAQs, and interactive sliders.
- **Single Product Page**: Re-architected into modular sub-templates (`base_content.twig`, `sub_content.twig`, `slider_single.twig`) supporting multiple layout modes.
- **Header & Navigation**: Mega menu extensions, custom top navbar, and quick search drawer.
- **Footer**: Custom multi-column layout with helper components (`footer_bets.twig`, `footer_helper.twig`).

---

## 6. Starter Differences vs Twig Theme

- **Starter Extras to Remove / Adjust**:
  - Starter includes 7 home components not in Twig: `home.enhanced-slider`, `home.photos-slider-with-text`, `home.featured-products`, `home.featured-products-special-offer`, `home.featured-products-special-product`, `home.custom-testimonials`, `home.blog`.
  - Starter settings: `header_layout: lite`, `header_show_store_info`, `header_store_info_home_only` (Twig uses `header_is_sticky` default `true`).
  - Starter phone layout: `MobileBottomBar`, `MobilePageTitleBar`, `MobileAccountSheet` (keep if compatible, but adapt to match View).
  - Starter product list: remove desktop "hide filters" and grid/list toggles where not present in Twig.

---

## 7. Compatibility Issues

- **Field format `string/datetime`**: Used in `home.V_countdown_banner.end_time_offer`. The Twilight manifest validator will verify if `datetime` format is accepted; if not, falls back to `string/date` or `string/text`.
- **Static promo fields**: No external vendor promo links in settings.
- **Images**: Views reference `placeholder.webp` and `delivery-bro.svg`. Copied to `public/images/`.

---

## 8. Kits

No external kit dependencies (e.g. 3D viewer) are required.

---

## 9. Decisions

- **Settings**: All 143 Twig settings and 26 Twig components will be retained in `twilight.json`.
- **RTL & Logical CSS**: All custom styles use logical properties (`ms-*`, `ps-*`, `start-*`, `end-*`, `text-start`).
- **Translations**: Flattened keys from `TWIG/src/locales/` merged with React starter keys.
- **Server Rendering**: Sections render server-side from `data` passed by Twilight engine.
