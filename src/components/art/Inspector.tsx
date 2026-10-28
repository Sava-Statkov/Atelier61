"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./inspector.module.css";

type Region = { x: number; y: number; width: number; height: number };
type Box = { w: number; h: number };
type View = { scale: number; x: number; y: number };
type Size = { width: number; height: number };
export type InspectorDetail = { id: string; caption: string; region: Region };

const MAX_SCALE = 8;
const FIT: View = { scale: 1, x: 0, y: 0 };
const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(1, s));

/** Size of the image at scale 1, fitted into the stage. */
function fitted(image: Size, box: Box): Box {
  const f = box.w && box.h ? Math.min(box.w / image.width, box.h / image.height) : 0;
  return { w: image.width * f, h: image.height * f };
}

/** Keeps the image from being dragged out of the stage. */
function clampView(v: View, image: Size, box: Box): View {
  const base = fitted(image, box);
  const maxX = Math.max(0, (base.w * v.scale - box.w) / 2);
  const maxY = Math.max(0, (base.h * v.scale - box.h) / 2);
  return { scale: v.scale, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
}

/** The view that centres a region and fills most of the stage with it. */
function regionView(r: Region, image: Size, box: Box): View {
  const base = fitted(image, box);
  const scale = clampScale(0.85 * Math.min(box.w / (r.width * base.w), box.h / (r.height * base.h)));
  const view = { scale, x: (0.5 - (r.x + r.width / 2)) * base.w * scale, y: (0.5 - (r.y + r.height / 2)) * base.h * scale };
  return clampView(view, image, box);
}

/**
 * Close inspection of one photograph in a modal dialog: zoom with the wheel, the buttons or + / −,
 * pan by dragging or with the arrow keys, jump to marked details. The full-resolution file is
 * requested only when the dialog opens.
 */
export function Inspector({
  image,
  details,
  labels,
}: {
  image: { src: string; width: number; height: number; alt: string; blur: string };
  details: InspectorDetail[];
  labels: { open: string; close: string; zoomIn: string; zoomOut: string; reset: string; help: string; details: string };
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const pendingRegion = useRef<Region | null>(null);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [box, setBox] = useState<Box>({ w: 0, h: 0 });
  const [view, setView] = useState<View>(FIT);
  const base = fitted(image, box);

  useEffect(() => {
    if (!open || !stage.current) return;
    const el = stage.current;
    // ResizeObserver reports the initial size too, so this also runs once on open.
    const ro = new ResizeObserver(() => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      setBox(next);
      if (pendingRegion.current) {
        setView(regionView(pendingRegion.current, image, next));
        pendingRegion.current = null;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, image]);

  const zoomAt = (factor: number, px = 0, py = 0) =>
    setView((v) => {
      const scale = clampScale(v.scale * factor);
      const k = scale / v.scale;
      // Keep the point under the cursor (px, py from the stage centre) where it is.
      return clampView({ scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k }, image, box);
    });

  const show = (region?: Region) => {
    if (!dialog.current?.open) dialog.current?.showModal();
    // The dialog is laid out as soon as it is open, so the stage can be measured right here;
    // the ResizeObserver above only follows later changes (rotation, window resize).
    const el = stage.current;
    const measured = el ? { w: el.clientWidth, h: el.clientHeight } : box;
    setBox(measured);
    setView(region && measured.w ? regionView(region, image, measured) : FIT);
    pendingRegion.current = region && !measured.w ? region : null;
    setOpen(true);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = Math.max(box.w, box.h) * 0.1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (e.key in moves) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }, image, box));
    } else if (e.key === "+" || e.key === "=") zoomAt(1.4);
    else if (e.key === "-") zoomAt(1 / 1.4);
    else if (e.key === "0") setView(FIT);
  };

  const local = (e: { clientX: number; clientY: number }) => {
    const r = stage.current!.getBoundingClientRect();
    return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2] as const;
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <>
      <button type="button" className={styles.open} onClick={() => show()}>
        {labels.open}
      </button>
      {details.length > 0 && (
        <div className={styles.details}>
          <p className={styles.detailsHeading}>{labels.details}</p>
          <ul>
            {details.map((d) => (
              <li key={d.id}>
                <button type="button" onClick={() => show(d.region)}>
                  {d.caption}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dialog ref={dialog} className={styles.dialog} aria-label={image.alt} onClose={() => setOpen(false)} onKeyDown={onKey}>
        <div className={styles.toolbar}>
          <button type="button" onClick={() => zoomAt(1.4)} aria-label={labels.zoomIn}>
            +
          </button>
          <button type="button" onClick={() => zoomAt(1 / 1.4)} aria-label={labels.zoomOut}>
            −
          </button>
          <button type="button" onClick={() => setView(FIT)}>
            {labels.reset}
          </button>
          <span className={styles.help}>{labels.help}</span>
          <button type="button" className={styles.close} onClick={() => dialog.current?.close()} autoFocus>
            {labels.close}
          </button>
        </div>
        <div
          ref={stage}
          className={styles.stage}
          data-zoomed={view.scale > 1 || undefined}
          data-dragging={dragging || undefined}
          onWheel={(e) => {
            const [px, py] = local(e);
            zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, px, py);
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
            setDragging(true);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (d) setView((v) => clampView({ ...v, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y }, image, box));
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={(e) => {
            const [px, py] = local(e);
            zoomAt(view.scale < 2 ? 2.5 : 1 / view.scale, px, py);
          }}
        >
          {open && base.w > 0 && (
            <div
              className={styles.canvas}
              style={{
                width: base.w,
                height: base.h,
                transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
              }}
            >
              {/* Eager: this element only exists once the visitor has opened the viewer.
                  `sizes` grows with the zoom, so the browser fetches a larger file when it is needed. */}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={`${Math.min(3, Math.ceil(view.scale)) * 100}vw`}
                quality={90}
                loading="eager"
                placeholder="blur"
                blurDataURL={image.blur}
                draggable={false}
              />
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
