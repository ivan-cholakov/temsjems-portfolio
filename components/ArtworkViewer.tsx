"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Eyebrow } from "./Eyebrow";
import { indexLabel } from "@/lib/format";

/** One photograph of a work, as the viewer shows it. */
export type Shot = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Short visible mono caption on a detail thumbnail, e.g. "STITCH". */
  label: string | null;
  /** Sentence-case caption under the image in the lightbox. */
  note: string | null;
};

/** Where the pointer sits over the stage, as fractions of its width and height. */
type Focus = { x: number; y: number };

type Zoom = { kind: "fit" } | { kind: "zoomed"; focus: Focus };

type View = { kind: "closed" } | { kind: "open"; index: number; zoom: Zoom };

const FIT: Zoom = { kind: "fit" };

/** Pointer travel between press and release past which the gesture was a pan, not a tap. */
const TAP_SLOP_PX = 6;
/**
 * Zoomed, a work is drawn at its file's own pixel size, so the weave and the
 * grain of the print show; a file smaller than that still doubles its fitted size.
 */
const MIN_ZOOM_OVER_FIT = 2;

/**
 * The work's main photograph, any detail shots under it, and a full-screen
 * lightbox over all of them. In the lightbox a tap zooms in on the point
 * tapped, moving the pointer pans across the work, and a second tap fits it
 * back to the screen.
 */
export function ArtworkViewer({ main, details }: { main: Shot; details: Shot[] }) {
  const shots = [main, ...details];
  const [view, setView] = useState<View>({ kind: "closed" });
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (index: number) => setView({ kind: "open", index, zoom: FIT });
  const close = () => setView({ kind: "closed" });

  // The native <dialog> brings the modal accessibility stack: focus trap,
  // focus returned on close, Escape, and the page beneath made inert.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (view.kind === "open" && !dialog.open) dialog.showModal();
    if (view.kind === "closed" && dialog.open) dialog.close();
  }, [view.kind]);

  // A modal dialog does not stop the page behind it scrolling under a wheel or
  // a swipe, which would leave the reader somewhere else on close.
  useEffect(() => {
    if (view.kind !== "open") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [view.kind]);

  useEffect(() => {
    if (view.kind !== "open" || shots.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const step = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
      const next = view.index + step;
      if (step === 0 || next < 0 || next >= shots.length) return;
      e.preventDefault();
      setView({ kind: "open", index: next, zoom: FIT });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, shots.length]);

  return (
    <>
      <button
        type="button"
        onClick={() => open(0)}
        aria-label={`View ${main.alt} full screen`}
        className="block w-full cursor-zoom-in"
      >
        <Image
          src={main.src}
          alt={main.alt}
          width={main.width}
          height={main.height}
          priority
          sizes="(min-width: 1280px) 62vw, 100vw"
          className="block h-auto w-full"
        />
      </button>

      {details.length > 0 && (
        <div className="mt-6 flex flex-wrap items-start gap-3 md:mt-8 md:gap-4">
          {details.map((shot, i) => (
            <button
              key={shot.src}
              type="button"
              onClick={() => open(i + 1)}
              aria-label={
                shot.label ? `Open detail ${i + 1} - ${shot.label}` : `Open detail ${i + 1}`
              }
              className="group relative h-[88px] w-[88px] overflow-hidden md:h-[112px] md:w-[112px]"
            >
              <Image
                src={shot.src}
                alt=""
                width={shot.width}
                height={shot.height}
                // Matches the md thumbnail box the button sets; the two have to agree.
                sizes="112px"
                className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              />
              <Eyebrow
                size="badge"
                className="pointer-events-none absolute left-1 top-1 bg-paper/90 px-1 py-[2px] text-ink"
              >
                {indexLabel(i + 1)}
              </Eyebrow>
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={close}
        aria-label={main.alt}
        className="m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden bg-paper p-0 text-ink backdrop:bg-paper"
      >
        {view.kind === "open" && (
          <Lightbox
            shots={shots}
            index={view.index}
            zoom={view.zoom}
            onZoom={(zoom) => setView({ ...view, zoom })}
            onShow={(index) => setView({ kind: "open", index, zoom: FIT })}
            onClose={close}
          />
        )}
      </dialog>
    </>
  );
}

function Lightbox({
  shots,
  index,
  zoom,
  onZoom,
  onShow,
  onClose,
}: {
  shots: Shot[];
  index: number;
  zoom: Zoom;
  onZoom: (zoom: Zoom) => void;
  onShow: (index: number) => void;
  onClose: () => void;
}) {
  const shot = shots[index];
  const centre: Zoom = { kind: "zoomed", focus: { x: 0.5, y: 0.5 } };
  return (
    <div className="flex h-full w-full flex-col">
      <div className="eyebrow text-label flex items-center justify-between gap-6 px-4 py-4 text-ink md:px-8 md:py-5">
        <span>
          {shots.length > 1 ? `${indexLabel(index + 1)} / ${indexLabel(shots.length)}` : null}
        </span>
        <div className="flex items-center gap-6 md:gap-8">
          <button
            type="button"
            onClick={() => onZoom(zoom.kind === "fit" ? centre : FIT)}
            className="underline-link transition-colors hover:text-mute"
          >
            {zoom.kind === "fit" ? "Zoom +" : "Fit −"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close full-screen view"
            className="underline-link transition-colors hover:text-mute"
          >
            Close ×
          </button>
        </div>
      </div>

      <Stage shot={shot} zoom={zoom} onZoom={onZoom} onClose={onClose} />

      {(shots.length > 1 || shot.note) && (
        <div className="flex flex-col items-center gap-3 px-4 py-4 md:py-5">
          {shots.length > 1 && (
            <div className="eyebrow text-label flex items-center gap-8 text-ink">
              <button
                type="button"
                onClick={() => onShow(index - 1)}
                disabled={index === 0}
                aria-label="Previous image"
                className="transition-colors hover:text-mute disabled:pointer-events-none disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => onShow(index + 1)}
                disabled={index === shots.length - 1}
                aria-label="Next image"
                className="transition-colors hover:text-mute disabled:pointer-events-none disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
          {shot.note && (
            <p className="max-w-[60ch] text-center font-sans italic text-ink/70">{shot.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

type Box = { width: number; height: number };

function Stage({
  shot,
  zoom,
  onZoom,
  onClose,
}: {
  shot: Shot;
  zoom: Zoom;
  onZoom: (zoom: Zoom) => void;
  onClose: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const press = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setBox({ width: stage.clientWidth, height: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const fitScale = box ? Math.min(box.width / shot.width, box.height / shot.height) : 0;
  const fitted: Box = { width: shot.width * fitScale, height: shot.height * fitScale };

  const focusOf = (e: React.PointerEvent): Focus => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: clampUnit((e.clientX - rect.left) / rect.width),
      y: clampUnit((e.clientY - rect.top) / rect.height),
    };
  };

  const onFittedImage = (e: React.PointerEvent): boolean => {
    if (!box) return false;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = Math.abs(e.clientX - rect.left - box.width / 2);
    const dy = Math.abs(e.clientY - rect.top - box.height / 2);
    return dx <= fitted.width / 2 && dy <= fitted.height / 2;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    press.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom.kind !== "zoomed") return;
    // A mouse pans by hovering; a finger pans only while it is down.
    if (e.pointerType !== "mouse" && !press.current) return;
    onZoom({ kind: "zoomed", focus: focusOf(e) });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_SLOP_PX) return;
    if (zoom.kind === "zoomed") onZoom(FIT);
    else if (onFittedImage(e)) onZoom({ kind: "zoomed", focus: focusOf(e) });
    else onClose();
  };

  let placement: React.CSSProperties = { visibility: "hidden" };
  if (box) {
    const scale = zoom.kind === "zoomed" ? Math.max(1, fitScale * MIN_ZOOM_OVER_FIT) : fitScale;
    const width = shot.width * scale;
    const height = shot.height * scale;
    const focus = zoom.kind === "zoomed" ? zoom.focus : { x: 0.5, y: 0.5 };
    placement = {
      width,
      height,
      left: offsetAlong(box.width, width, focus.x),
      top: offsetAlong(box.height, height, focus.y),
    };
  }

  return (
    <div
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        press.current = null;
      }}
      className={`relative min-h-0 flex-1 touch-none select-none overflow-hidden ${
        zoom.kind === "zoomed" ? "cursor-zoom-out" : "cursor-zoom-in"
      }`}
    >
      <Image
        key={shot.src}
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        draggable={false}
        sizes="100vw"
        style={placement}
        className="absolute max-w-none"
      />
    </div>
  );
}

/**
 * Where an image of `size` starts along a stage of `extent`: centred when it
 * fits, otherwise shifted so the focus fraction of the stage shows the same
 * fraction of the image - pointer at the right edge, image's right edge.
 */
function offsetAlong(extent: number, size: number, focus: number): number {
  return size <= extent ? (extent - size) / 2 : -(size - extent) * focus;
}

function clampUnit(n: number): number {
  return Math.min(1, Math.max(0, n));
}
