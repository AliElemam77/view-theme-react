# مراجعة تطابق الشكل: View (Twig) مقابل view-theme-react

تاريخ المراجعة: 2026-11-23. المراجعة مقارنة كود فقط، ومفيش فيها أي screenshots.
- Twig: `D:\projects\view\src`
- React: `d:\projects\view-theme-react\app`

## اللي متطابق فعلاً

- **twilight.json:** نفس الـ 26 component بنفس الـ fields، وكل الـ settings بتاعة Twig موجودة.
- **tailwind.config:** متطابق.
- **ملفات SCSS:** `01-settings` و`02-generic` و`03-elements` و`05-utilities` و`home.scss` متطابقين حرف بحرف. استثناء: `04-components/slider.scss` فيه إضافات من Raed.
- **CSS variables:** متغيرات `css.twig` متنقولة صح في `lib/viewTheme.ts`.
- **شاشة التحميل (loading screen):** متطابقة.
- **Partials:** `titles` و`copune` متطابقين، و`btn` فيه فرق بسيط.
- **الترجمات:** كل مفاتيح `ar` موجودة بنفس القيم.
- **صفحات متطابقة:** testimonials وorders index وstore-features.

## الأسباب الجذرية (هي اللي ورا أغلب الفروقات)

1. **الهيدر والفوتر والكارت وصفحة المنتج والسلة لسه بتاعة Raed.**
   - `header.scss` كله Raed.
   - أول 1092 سطر من `product.scss` Raed.
   - `footer.scss` Raed.
   - قواعد الكارت والـ options بتاعة View (`T product.scss:402-642`) متنقلتش أصلاً.
2. **ملفات SCSS فاضية (placeholder):** `single-product.scss` و`single-orders.scss` و`blog.scss` و`landing-page.scss` في React كل واحد سطر واحد.
3. **مكونات اتعملت port بس مش مستخدمة:**
   - `layout/footer/FooterBets.tsx` و`FooterHelper.tsx` و`FooterCopyright.tsx`
   - `home/BrandsBreak.tsx`
4. **مفيش أي `salla-slider`/Swiper في بلوكات `V_*`:** كله اتحول لـ scroll عادي أو صف ثابت، فاختفت الـ breakpoints والـ autoplay والـ loop والأسهم والـ progress bar والـ effects.
5. **`SectionWrapper.tsx:27`** ثابت على `my-8 md:my-14`، يعني margin فوق وتحت. في Twig الـ `sp_com_cu` بيحط margin تحت بس، وبيتحكم فيه `space_inner`.
6. **`Marquee.tsx`:**
   - الـ variant `motion-safe:animate-marquee` مش بيتولد في الـ CSS، فالحركة واقفة.
   - الـ container مش `flex`، فالنسختين بيظهروا فوق بعض.
   - البلوكات المتأثرة: VBrandsSlider وVMarque وVProductHighlight.
7. **RTL:** فيه أماكن استُخدم فيها `start-1/2` مع `-translate-x-1/2`، أو `start`/`end` مكان `left`/`right` الفعليين اللي في Twig. النتيجة عناصر معكوسة أو خارجة برة الشاشة.
8. **كلاس `reveal` ناقص** في أغلب عناصر البلوكات، فأنيميشن الظهور مش شغال.

## Bugs مؤكدة

| # | المشكلة | المكان |
|---|---|---|
| 1 | الـ imports فيها 6 دوال مش موجودة في `ViewBlockUtils.ts`، فالـ typecheck والـ build هيفشلوا | `components/home/VOfferCollection.tsx:11-18` |
| 2 | إجابات الـ FAQ مش بتظهر خالص: العنصر ماعليهوش `.open`، والـ CSS بيخليه `max-height:0; opacity:0` | `components/home/VFaq.tsx:135` |
| 3 | الـ Marquee واقف وبيظهر مرتين | `components/common/Marquee.tsx:35-50` |
| 4 | الكود بيقرأ field غلط: `merge_links_with_top_component` والصح `merge_with_top_component` | `components/home/MainLinks.tsx:36,53`, `router.tsx:180` |
| 5 | سعر الـ sticky bar في صفحة المنتج بيظهر رقم من غير عملة | `components/product/ProductPage.tsx:219-236` |
| 6 | التابات في صفحة المنتج بتخفي الجاليري، والتعليقات بتتعرض مرتين | `ProductPage.tsx:352-417` |
| 7 | الـ setting `header_layout` مش موجود في twilight.json، فالـ mega menu على الديسكتوب مش بيظهر أبداً | `components/layout/Header.tsx:120,267` |
| 8 | الفوتر كله مخفي تحت 768px | `styles/04-components/footer.scss:76-85` |
| 9 | المبلغ المتبقي للشحن المجاني من غير عملة (في `CartSummary` بتاع المحرك) | السلة |
| 10 | Hooks بتتنادى بعد early return | `VFaq.tsx:43`, `VMarque.tsx:39`, `VCountdownBanner.tsx:46,55`, `VInstagramFeed.tsx:28` |

---

## 1. الهيكل العام

### الهيدر (MAJOR: بتاع Raed)
- **الشكل:** View فيه صفين: burger ولوجو ومنيو وخط متحرك، وتحتهم user وعملة ولغة، وthemes وbullet وسلة ومفضلة وبحث. React صف واحد فيه اللوجو في النص.
- **ناقص في React:**
  - الـ mega menu على الديسكتوب
  - قائمة اختيار العملة
  - قائمة اختيار اللغة
  - مبدّل الـ theme (light/dark/carbon/time/auto)، وده مفعّل by default في Twig
  - أيقونة المفضلة
  - الخط المتحرك `#animated-line`
  - tooltip إجمالي السلة
- **الألوان:** الإعدادات `--color-header-bg` و`--color-header-text` (يعني `color_bg_header` و`color_text_header`) مش مستخدمة.
- **السلوك:**
  - الـ sticky مختلف: مفيش slide-in بعد 200px.
  - مفيش هيدر شفاف فوق الـ hero (`has_mearged_header`، `color_text_header_merge`).
- **الأيقونات وشارة السلة:** الأيقونات line icons بتاعة Raed بدل SVGs بتاعة View. شارة السلة `bg-red-700` وتحت الأيقونة، وفي View هي `bg-price` وفوق في الركن.
- **الموبايل:** الهيدر بيتقفل في كل الصفحات غير الرئيسية، وعناصر React-only بتحل مكانه: Bottom bar وpage-title bar وaccount sheets.

### المنيو في الموبايل (MAJOR)
- View بيستخدم mmenu-light offcanvas، وReact بيستخدم drawer بتاع Raed (`HeaderNav`).

### البحث (MAJOR)
- View بيفتح لوحة blur فيها keyword chips وقسم المنتجات الأكثر بحثاً.
- React بيفتح `SallaSearch` العادي.
- الإعدادات `has_search_keywords` و`quick_search_keywords` و`show_top_searched_products` و`most_searched_products` مش مستخدمة.

### الفوتر (MAJOR)
- الفوتر الشغال هو fork بتاع Raed/المحرك، والـ port بتاع View متوصلش.
- **الألوان:** ثابتة على `#F4F7F2`، وإعدادات `bg_footer*` و`text_footer*` متجاهلة.
- **ناقص:**
  - شريط الـ newsletter (`has_newsletter`)
  - ساعات العمل
  - روابط الحساب
  - زرار الرجوع لفوق
  - copyright المالك
  - `style_footer=accordion`
- **مختلف:** شكل شارات SBC والضريبة.

### إضافات master
- ناقص: بانر الكوبون الثابت (`add_fixed_discount_coupons`).
- ناقص: الـ container بتاع `#modal-container` (quick view).
- `app.css:7-9`: متغير `--font-ar` غير معرّف (من مخلفات Raed).

## 2. المنتجات

### كارت المنتج (MAJOR)
- **مش متطبّق:**
  - `cards_color` و`raduse_cards` و`cards_color_text`
  - عمود الأيقونات على الصورة `.obts` (quick view، منتجات مشابهة، مفضلة)
  - شارة نسبة الخصم
  - رابط التصنيف وتاجات المنتج
  - `product_name_lines`
  - `none_rating`
  - `hiddn_out_of_stock`
  - `add_original`
  - spinner تحميل الصورة
- **زرار السلة:** pill بتاع Raed بدل زرار View بالأيقونة وتبديل النص عند الـ hover.
- **المفضلة:** دايرة في الفوتر بدل ما تكون على الصورة.
- **شارة العرض:** ثابتة `bg-red-800` بدل لون عشوائي.
- **الـ padding والمسافات:** مختلفة (`pt-5` بدل `pt-2`، ومفيش `p-2`).

### صفحة الليستنج (MAJOR)
- **التولبار:** pill بتاع Raed فيه "إخفاء الفلاتر"، بدل صندوق View اللي فيه العنوان والأيقونات.
- **الفلاتر:**
  - ستايل View متنقلش (boxed widgets وradios مخصصة).
  - Bottom sheet تحت 768 بدل drawer تحت 1024.
- **الأعمدة:** 5 أعمدة من غير فلاتر (Raed).
- **إعدادات ناقصة:** `auto_load_products` و`show_banners_in_single_cat`.

### صفحة المنتج (MAJOR)
- **الجاليري:**
  - الـ thumbs ظاهرة، وفي View مخفية by default (`ishidden`).
  - مفيش أسهم ولا عدّاد "1/5".
  - مفيش loop ولا autoplay ولا zoom.
  - على الموبايل overlay بتاع Raed.
- **عمود المعلومات بتاع Raed:**
  - مفيش countdown الخصم (`show_counter`) ولا زرار التصنيف (`mini_category`).
  - التقييم فوق السعر.
  - السعر `text-red-800` بدل `text-price`.
  - مفيش شارة % الخصم.
  - الوزن والمتبقي والمباع مختلفين.
  - الوصف كامل بدل المقتطف.
- **Options:**
  - select بدل buttons، لأن `config` مش بيتبعت (`show_singleOption`).
  - مفيش grid عمودين.
  - panel قابل للطي React-only، بإعداد مش موجود في twilight.json.
- **الإضافة للسلة:**
  - مفيش labels "الكمية" و"السعر النهائي".
  - pill بدل `rounded-theme`.
  - على الموبايل بيظهر sticky bar اتنين.
- **Layouts ناقصة:** `product_card_pic` (side_tabs/center_image/top_images) مش متطبّقة.
- **جدول المواصفات والتعليقات:** ستايل Raed.

## 3. بلوكات الهوم

### البلوكات الأساسية
| البلوك | الحالة | أهم فرق |
|---|---|---|
| slider-products-with-header | MAJOR | ناقص `s-block--slider-with-bg s-block--full-bg`، فالمنتجات بتغطي العنوان (محتاج config) |
| featured-products style1/2/3 | MAJOR | component واحد بتاع Raed لكل الـ styles. التابات من غير ستايل. style2 من غير container و`is_slider` متجاهل. style3 مش عامل عمودين. الـ engine defaults أقرب لـ Twig |
| photos-slider | MAJOR | stage بتاع Raed: الصور cropped والجيران باهتين ونقط على الصورة. الـ engine default أقرب |
| enhanced-square-banners | MAJOR | من غير container. لو فيه 5 بانرات بيتحول لـ mosaic بتاع Raed |
| main-links | MAJOR | 8 في الصف بدل 6. الصور من غير ستايل. اسم الـ field بتاع الدمج غلط |
| brands | MINOR | كروت بيضا ببوردر (`brands.scss` محمّل global)، وفي View لوجوهات بس |
| square-photos | ENGINE | الـ grid مختلف، بس الـ CSS بتاع Twig نفسه شكله مش مكتمل |
| testimonials | MINOR | padding على الموبايل |
| store-features | IDENTICAL | |

### بلوكات V_*
| البلوك | الحالة | أهم فرق |
|---|---|---|
| V_offer_collection | BROKEN | الـ imports مش موجودة |
| V_faq | MAJOR | الإجابات مش ظاهرة، وفيه زرار "عرض الكل" زيادة، والـ borders مختلفة |
| V_brands_slider | MAJOR | Marquee واقف ومكرر. المفروض يستخدم `BrandsBreak` |
| V_marque | MAJOR | Marquee واقف. الـ container والـ mask وشكل الزرار مختلفين |
| V_product_highlight | MAJOR | Marquee واقف. حجم النص `text-3xl/5xl` بدل `text-6xl` |
| V_countdown_banner | MAJOR | الألوان الافتراضية معكوسة (`use_custom_colorsbg`). الحلقات بايظة في RTL. عدّاد مخصص بدل `salla-count-down` |
| V_multi_slider | MAJOR | style_mockup (الافتراضي) مش بيعرض صورة الموكاب. مفيش Swiper effects ولا parallax ولا swipe. `md:!pt-32` ناقص |
| V_group_features | MAJOR | صورة واحدة ثابتة بدل slider. مفيش sparkles. ترتيب الموبايل غلط |
| V_store_features | MAJOR | `sizing-xxs` ناقص، فالنص أكبر بكتير والأيقونات أصغر. `has_slider` متجاهل |
| V_reviews_with_product | MAJOR | صورة المنتج دايماً placeholder. الأسهم والـ autoplay مختلفين |
| V_products_slider | MAJOR | مفيش Swiper ولا progress. الكوبون اتنقل للهيدر. مصدر الـ tags بايظ |
| V_mixed_reviews | MAJOR | scroller بدل slider. النجوم والمتوسط مختلفين |
| V_blog_posts | MAJOR | scroller. صف الإعجابات والتعليقات والكاتب ناقص. شارة التاريخ معكوسة في RTL |
| V_nested_categories | MAJOR | الـ creative carousel المروحي بقى صف ثابت |
| V_product_bundle | MAJOR | كروت عرض ثابت بدل 1.7/N. العنصر اللي في النص مختلف |
| V_styled_categories | MAJOR | scroller. الصورة متقصوصة (`overflow-hidden`) |
| V_text_block | MAJOR | اللوجوهات ثابتة بدل carousel رأسي. مكان صورة الخلفية معكوس في RTL. الـ jocer ناقص |
| V_links_gallery | MAJOR | مكان الصورة مختلف. `dir="rtl"` الإجباري ناقص |
| V_banner_line | MAJOR | الخطوط معكوسة في RTL ومن غير أنيميشن. الـ jocer ناقص |
| V_featured_product | MINOR | `p-4 md:p-8` زيادة، و`reveal` ناقص |
| V_instagram_feed | MINOR | MutationObserver اللي بيخفي branding بتاع Elfsight ناقص |
| V_tagged_products | MINOR | `max-h-72` على الصور |

## 4. الصفحات الداخلية

| الصفحة | الحالة | أهم فرق |
|---|---|---|
| Landing page | MISSING | مفيش route ولا CSS |
| Thank-you | ENGINE, MAJOR | مكونات `salla-thank-you-page` الجديدة بدل hero وصورة الشكر وبلوكات الإيميل والدعم |
| Loyalty | ENGINE, MAJOR | `salla-loyalty-program` لوحده. الـ hero والبانر وطرق كسب النقاط وسلايدر الجوايز كلهم مش موجودين |
| Blog index | ENGINE, MAJOR | كروت المحرك في عمودين. شارة التاريخ وزرار "اقرأ المزيد" وأزرار التصنيفات ودروب داون الموبايل ناقصين |
| Cart | FORK Raed, MAJOR | صف عناوين زيادة. "منتجات يفضلها العملاء" ناقص. sidebar بتاع المحرك بكروت رمادي بدل `salla-cart-coupons` و`salla-cart-summary-card`. صف المنتج بتاع Raed. `hide_options_in_cart` متجاهل |
| Page single | FORK, MAJOR | مفيش ribbon title band ولا `bg-primary-reverse` panel |
| Brand single | FORK, MAJOR | مكان البانر مختلف. فيه عنوان "المنتجات" وتولبار Raed زيادة |
| Brands index | ENGINE, MINOR | ستايلات `brands.scss` بتاعة Raed |
| Profile | ENGINE, MEDIUM | `salla-user-profile` بدل الفورم المخصص |
| Order single | ENGINE, MINOR | صف العنوان والروابط مختلف |
| Customer layout | MINOR | خلفية `gray-50` وأيقونات المنيو بتاعة Raed |
| Breadcrumb (كل الصفحات) | MAJOR | شريط ملوّن full-bleed ومخفي على الموبايل (Raed). في View `nav` عادي وظاهر في كل المقاسات |
| Blog single / Wishlist / Notifications / Wallet | MINOR | فروقات بسيطة في الألوان والـ empty states |
| Testimonials / Orders index | IDENTICAL | |
