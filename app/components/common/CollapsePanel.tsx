import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface CollapsePanelProps {
  id: string;
  open: boolean;
  children: ReactNode;
}

/** One `.btn--collapse` panel (app.js `initiateCollapse`: height + opacity over 225ms). */
export function CollapsePanel({ id, open, children }: CollapsePanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    setHeight(open ? (ref.current?.scrollHeight ?? 0) : 0);
  }, [open]);
  return (
    <div
      ref={ref}
      id={id}
      inert={!open}
      className={`overflow-hidden ${open ? 'is-opened' : 'is-closed'}`}
      style={{ height, opacity: open ? 1 : 0, transition: 'height 225ms ease-out, opacity 225ms ease-out' }}
    >
      {children}
    </div>
  );
}
