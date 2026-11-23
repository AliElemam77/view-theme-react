import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { buildThemeCss, defaultThemeMode, themeModeScript } from '../../lib/viewTheme';

/**
 * What View's `master.twig` puts ahead of the page: the theme-mode bootstrap
 * (sets `data-theme` before first paint), the per-mode CSS variables from
 * `layouts/css.twig`, and the full-screen `.loader-init` spinner from
 * `pages/partials/loading-screen-assets.twig`.
 *
 * The loader is never removed from the DOM (React owns the node); it is hidden
 * on `window.load` exactly as Twig does, then `view::loaded` is dispatched so
 * the header's `.line-inner` can start, which Twig triggers on removal.
 */
export function ViewThemeHead() {
  const { theme } = useTwilight();
  const settings = theme?.settings as Record<string, unknown> | undefined;
  const css = buildThemeCss(settings, theme?.color as { primary?: string; reverse_text?: string });
  return (
    <>
      <script
        id="view-theme-mode"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: themeModeScript(defaultThemeMode(settings)) }}
      />
      <style id="view-theme-vars" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: css }} />
      <style
        id="view-loader-css"
        dangerouslySetInnerHTML={{
          __html:
            '.loader-init--hidden{opacity:0;visibility:hidden}@keyframes rot5{0%{transform:rotate(0)}50%{transform:rotate(180deg);border-top-color:var(--color-primary);border-bottom-color:var(--color-primary-light);border-right-color:transparent;border-left-color:transparent}100%{transform:rotate(360deg)}}',
        }}
      />
      <div
        className="loader-init"
        suppressHydrationWarning
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitBackdropFilter: 'blur(40px)',
          backdropFilter: 'blur(40px)',
          background: '#0609048a',
          transition: 'opacity .75s,visibility .75s',
          zIndex: 9999,
        }}
        aria-hidden="true"
      >
        <div
          className="loaderch"
          style={{
            width: 50,
            height: 50,
            display: 'inline-block',
            border: '5px solid var(--color-primary-dark)',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            animation: '1s infinite rot5',
          }}
        />
      </div>
      <script
        id="view-loader"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html:
            '!function(){function d(){window.__viewLoaded=true;document.dispatchEvent(new CustomEvent("view::loaded"))}function e(){var l=document.querySelector(".loader-init");if(!l||l.classList.contains("loader-init--hidden"))return d();l.classList.add("loader-init--hidden");l.addEventListener("transitionend",function h(t){"opacity"===t.propertyName&&(l.removeEventListener("transitionend",h),d())})}"complete"===document.readyState?e():window.addEventListener("load",e,{once:!0})}();',
        }}
      />
    </>
  );
}
