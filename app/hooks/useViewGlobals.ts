/**
 * The global behaviours View's `app.js` boots on every page:
 * - Lenis smooth scrolling (`new Lenis({ duration: 2, easing })`),
 * - the `has_animation` scroll reveal (`F__Animation`),
 * - SweetAlert2 toasts for `salla.notify` (`initiateNotifier`).
 */
import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';

type LenisInstance = { raf: (t: number) => void; resize: () => void; destroy: () => void };

let lenis: LenisInstance | null = null;

/** Lenis with View's settings; resized after each navigation, like Twig's post-load resize. */
export function useSmoothScroll() {
  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }) as unknown as LenisInstance;
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      setTimeout(() => lenis?.resize(), 1000);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const t = setTimeout(() => lenis?.resize(), 1000);
    return () => clearTimeout(t);
  }, [pathname]);
}

/**
 * `F__Animation`: each `.reveal` element floats in once it scrolls into view,
 * staggered 80ms across a batch of six. Progress is kept in `data-reveal`
 * (see `react-extras.scss`) because React would put a removed class back.
 */
export function useRevealAnimation(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const finish = (el: HTMLElement) => {
      el.dataset.reveal = 'done';
      el.style.removeProperty('--delay');
    };
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduced) {
      const all = () =>
        document.querySelectorAll<HTMLElement>('.reveal:not([data-reveal])').forEach(finish);
      all();
      const mo = new MutationObserver(all);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, idx) => {
          const el = entry.target as HTMLElement;
          if (!entry.isIntersecting || seen.has(el)) return;
          seen.add(el);
          el.style.setProperty('--delay', `${(idx % 6) * 0.08}s`);
          requestAnimationFrame(() => {
            el.dataset.reveal = 'animating';
            const onEnd = (e: AnimationEvent) => {
              if (e.target !== el) return;
              el.removeEventListener('animationend', onEnd);
              finish(el);
            };
            el.addEventListener('animationend', onEnd);
          });
          io.unobserve(el);
        });
      },
      { rootMargin: '80px 0px', threshold: 0.12 }
    );

    const observe = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches('.reveal:not([data-reveal])')) io.observe(root);
      root.querySelectorAll?.('.reveal:not([data-reveal])').forEach((el) => io.observe(el));
    };
    observe(document);
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) observe(node as HTMLElement);
        })
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [enabled]);
}

type Notify = (message: unknown, type?: string, data?: unknown) => unknown;

/** `initiateNotifier`: SweetAlert2 toasts at the reading-start corner with a progress bar. */
export function useSwalNotifier(addProductToastEnabled: boolean) {
  useEffect(() => {
    if (document.body.classList.contains('mobile-webview')) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const salla = window.salla as
      | { onReady?: () => Promise<unknown>; notify?: { setNotifier?: (fn: Notify) => void } }
      | undefined;
    void (async () => {
      try {
        await salla?.onReady?.();
      } catch {
        /* SDK failed to boot: leave the engine's notifier */
      }
      const { default: Swal } = await import('sweetalert2');
      // The engine's Toaster installs its notifier on the same onReady; go after it.
      timer = setTimeout(() => {
        if (!active) return;
        salla?.notify?.setNotifier?.((message, type, data) => {
          const event = (data as { data?: { googleTags?: { event?: string } } } | undefined)?.data
            ?.googleTags?.event;
          // <salla-add-product-toast> already announces the add (engine behaviour, kept).
          if (addProductToastEnabled && event === 'addToCart') return;
          if (typeof message === 'object' && message !== null) {
            return Swal.fire(message as unknown as Parameters<typeof Swal.fire>[0]).then(
              type as unknown as () => void
            );
          }
          return Swal.mixin({
            toast: true,
            position: document.documentElement.dir === 'rtl' ? 'top-start' : 'top-end',
            showConfirmButton: false,
            timer: 2000,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          }).fire({
            icon: type as unknown as 'success' | 'error' | 'warning' | 'info' | 'question',
            title: String(message ?? ''),
            showCloseButton: true,
            timerProgressBar: true,
          });
        });
      }, 0);
    })();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [addProductToastEnabled]);
}

/**
 * home.js `vllpp`: every `.line-innercomponent` separator grows in once 60% of
 * it is on screen. Also covers lines mounted later (client navigation).
 */
export function useLineInView() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.active = '';
          io.unobserve(entry.target);
        }),
      { threshold: 0.6 }
    );
    const observe = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches('.line-innercomponent:not([data-active])'))
        io.observe(root);
      root
        .querySelectorAll?.('.line-innercomponent:not([data-active])')
        .forEach((el) => io.observe(el));
    };
    observe(document);
    const mo = new MutationObserver((muts) =>
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => n.nodeType === 1 && observe(n as HTMLElement))
      )
    );
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
