"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HOME_CAROUSEL, SITE } from "@/content/site";

/** Within this many pixels of either end, the rail counts as parked there. */
const EDGE_TOLERANCE_PX = 2;
/** At or below this much scrollable width, the rail does not overflow at all. */
const NO_OVERFLOW_PX = 1;
/** Fraction of the visible rail one arrow press travels. */
const STEP_VIEWPORT_FRACTION = 0.7;
/** Arrow-press glide, slower than a native smooth scroll for a cinematic feel. */
const GLIDE_MS = 900;
/** Ease-out exponent for that glide; 4 is a quartic, which lands softly. */
const GLIDE_EASE_EXPONENT = 4;
/** Pointer travel that separates a click on a work from a drag of the rail. */
const DRAG_THRESHOLD_PX = 4;
/** Recent pointer positions kept for the release-velocity estimate. */
const VELOCITY_SAMPLE_COUNT = 8;
/** How far back the release velocity is measured. */
const VELOCITY_WINDOW_MS = 120;
/** Shortest sample span that still yields a trustworthy velocity. */
const VELOCITY_MIN_SPAN_MS = 6;
/** Ceiling on fling speed, so a violent flick still reads as a glide. */
const MAX_VELOCITY_PX_PER_MS = 6;
/** Below this the fling has arrived; anything less is not visible motion. */
const MIN_VELOCITY_PX_PER_MS = 0.05;
/** Momentum decay per frame, and the frame it is quoted against. */
const VELOCITY_DECAY_PER_FRAME = 0.96;
const FRAME_MS = 16;
/** Longest frame the momentum integrates in one step, so a stall cannot leap. */
const MAX_FRAME_MS = 32;
/** Momentum stops here rather than crawling to zero. */
const MOMENTUM_STOP_PX_PER_MS = 0.015;
/** Wider than this and a work is landscape: it gets the reduced height below. */
const LANDSCAPE_RATIO_MIN = 1.3;
/** Works eagerly loaded: the two that are on screen before any scroll. */
const CARDS_IN_VIEW = 2;
/** Air at both ends of the rail, so the first and last work can reach the centre. */
const EDGE_SPACER_CLASS = "shrink-0 w-[6vw] md:w-[12vw]";

export function HomeCanvas() {
  const scroller = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<"start" | "middle" | "end">("start");

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= NO_OVERFLOW_PX) setEdge("start");
      else if (el.scrollLeft <= EDGE_TOLERANCE_PX) setEdge("start");
      else if (el.scrollLeft >= max - EDGE_TOLERANCE_PX) setEdge("end");
      else setEdge("middle");
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const animRef = useRef<number | null>(null);
  const animateTo = (target: number, duration = GLIDE_MS) => {
    const el = scroller.current;
    if (!el) return;
    if (animRef.current != null) cancelAnimationFrame(animRef.current);
    const start = el.scrollLeft;
    const distance = target - start;
    if (distance === 0) return;
    const startTime = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, GLIDE_EASE_EXPONENT);
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      el.scrollLeft = start + distance * ease(t);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const step = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.max(
      0,
      Math.min(max, el.scrollLeft + dir * el.clientWidth * STEP_VIEWPORT_FRACTION),
    );
    animateTo(target);
  };

  useEffect(() => {
    return () => {
      if (animRef.current != null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Mouse drag-to-scroll with velocity-tracked momentum on release.
  // (Touch uses native scroll, which already has momentum + no snap.)
  const dragState = useRef<{ x: number; left: number } | null>(null);
  const dragMoved = useRef(false);
  const samplesRef = useRef<Array<{ x: number; t: number }>>([]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scroller.current;
    if (!el) return;
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    // NB: pointer capture is intentionally NOT set here. Capturing on
    // pointerdown makes the browser suppress the synthesized `click`, which
    // kills native anchor navigation on a plain click. We capture lazily in
    // onPointerMove once a real drag starts (see below).
    dragState.current = { x: e.clientX, left: el.scrollLeft };
    dragMoved.current = false;
    samplesRef.current = [{ x: e.clientX, t: performance.now() }];
    el.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    const el = scroller.current;
    if (!s || !el) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX && !dragMoved.current) {
      dragMoved.current = true;
      // A real drag has started: now capture the pointer so movement and
      // release are still tracked if the cursor leaves the scroller. Doing it
      // here (not on pointerdown) preserves native `click` for plain taps.
      el.setPointerCapture(e.pointerId);
    }
    samplesRef.current.push({ x: e.clientX, t: performance.now() });
    if (samplesRef.current.length > VELOCITY_SAMPLE_COUNT) samplesRef.current.shift();
    el.scrollLeft = s.left - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || !dragState.current) return;
    dragState.current = null;
    el.style.cursor = "";
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);

    if (!dragMoved.current) return;

    // Velocity from the last stretch of motion samples.
    const samples = samplesRef.current;
    if (samples.length < 2) return;
    const last = samples[samples.length - 1];
    const cutoff = last.t - VELOCITY_WINDOW_MS;
    const earliest = samples.find((p) => p.t >= cutoff) ?? samples[0];
    const dt = last.t - earliest.t;
    if (dt < VELOCITY_MIN_SPAN_MS) return;
    const rawV = -(last.x - earliest.x) / dt; // px/ms; finger right ⇒ scroll left
    const velocity = Math.sign(rawV) * Math.min(Math.abs(rawV), MAX_VELOCITY_PX_PER_MS);
    if (Math.abs(velocity) < MIN_VELOCITY_PX_PER_MS) return;

    if (animRef.current != null) cancelAnimationFrame(animRef.current);
    let v = velocity;
    let lastT = performance.now();
    // The per-frame decay works out to about exp(-2.5/sec), so momentum lasts
    // ~1.2-1.6s for a mid-fling.
    const tick = (now: number) => {
      const frameDt = Math.min(now - lastT, MAX_FRAME_MS);
      lastT = now;
      el.scrollLeft += v * frameDt;
      v *= Math.pow(VELOCITY_DECAY_PER_FRAME, frameDt / FRAME_MS);
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 0) { el.scrollLeft = 0; v = 0; }
      else if (el.scrollLeft >= max) { el.scrollLeft = max; v = 0; }
      if (Math.abs(v) > MOMENTUM_STOP_PX_PER_MS) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="shell relative mx-auto">
      <div className="relative">
        <ArrowButton
          direction="prev"
          disabled={edge === "start"}
          onClick={() => step(-1)}
        />
        <ArrowButton
          direction="next"
          disabled={edge === "end"}
          onClick={() => step(1)}
        />

        <div
          ref={scroller}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          className="
            no-scrollbar flex gap-6 overflow-x-auto
            pb-2 cursor-grab select-none
            md:gap-10
          "
        >
          <div aria-hidden className={EDGE_SPACER_CLASS} />

          {HOME_CAROUSEL.map((p, i) => {
            // Every item shares one container height, so titles sit on a common
            // baseline. A landscape piece would render far wider at full height
            // and dominate the row, so it gets a reduced image height (matching
            // the portraits' footprint area) and is centred vertically in the
            // container — keeping its centre aligned with the other works.
            const isLandscape = p.width / p.height > LANDSCAPE_RATIO_MIN;
            return (
            <a
              key={p.slug}
              href={`/work/${p.slug}/`}
              draggable={false}
              className="shrink-0 group flex flex-col items-center"
            >
              <div className="relative flex h-[44vh] items-center justify-center md:h-[58vh]">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={p.width}
                  height={p.height}
                  priority={i < CARDS_IN_VIEW || p.lcp}
                  draggable={false}
                  className={
                    isLandscape
                      ? "block h-[30vh] w-auto select-none object-contain md:h-[40vh]"
                      : "block h-full w-auto select-none object-contain"
                  }
                  sizes="(max-width: 768px) 70vw, 32vw"
                />
              </div>
              <span className="mt-2 text-center font-display text-h3 text-ink">
                {p.title}
              </span>
            </a>
            );
          })}

          <div aria-hidden className={EDGE_SPACER_CLASS} />
        </div>
      </div>

      <p className="mt-8 text-center font-sans text-lead italic text-ink">
        {SITE.tagline}
      </p>
    </section>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "Previous works" : "Next works"}
      disabled={disabled}
      onClick={onClick}
      className={`
        absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center
        rounded-full border border-ink/20 bg-paper/80 backdrop-blur-[2px]
        h-11 w-11 text-ink transition
        hover:border-ink/60 disabled:cursor-default disabled:opacity-25
        md:flex
        ${isPrev ? "left-2" : "right-2"}
      `}
    >
      <span aria-hidden className="font-display text-h3 leading-none">
        {isPrev ? "←" : "→"}
      </span>
    </button>
  );
}
