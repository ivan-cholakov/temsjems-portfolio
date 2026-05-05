"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PROJECTS, SITE } from "@/content/site";

export function HomeCanvas() {
  const scroller = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<"start" | "middle" | "end">("start");

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) setEdge("start");
      else if (el.scrollLeft <= 2) setEdge("start");
      else if (el.scrollLeft >= max - 2) setEdge("end");
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

  // Custom smooth-scroll: slower (900ms) and ease-out-expo for a cinematic glide.
  const animRef = useRef<number | null>(null);
  const animateTo = (target: number, duration = 900) => {
    const el = scroller.current;
    if (!el) return;
    if (animRef.current != null) cancelAnimationFrame(animRef.current);
    const start = el.scrollLeft;
    const distance = target - start;
    if (distance === 0) return;
    const startTime = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
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
    const target = Math.max(0, Math.min(max, el.scrollLeft + dir * el.clientWidth * 0.7));
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
    el.setPointerCapture(e.pointerId);
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
    if (Math.abs(dx) > 4) dragMoved.current = true;
    samplesRef.current.push({ x: e.clientX, t: performance.now() });
    if (samplesRef.current.length > 8) samplesRef.current.shift();
    el.scrollLeft = s.left - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || !dragState.current) return;
    dragState.current = null;
    el.style.cursor = "";
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);

    if (!dragMoved.current) return;

    // Velocity from the last ~120 ms of motion samples.
    const samples = samplesRef.current;
    if (samples.length < 2) return;
    const last = samples[samples.length - 1];
    const cutoff = last.t - 120;
    const earliest = samples.find((p) => p.t >= cutoff) ?? samples[0];
    const dt = last.t - earliest.t;
    if (dt < 6) return;
    const rawV = -(last.x - earliest.x) / dt; // px/ms; finger right ⇒ scroll left
    const velocity = Math.sign(rawV) * Math.min(Math.abs(rawV), 6);
    if (Math.abs(velocity) < 0.05) return;

    if (animRef.current != null) cancelAnimationFrame(animRef.current);
    let v = velocity;
    let lastT = performance.now();
    // Decay 0.96 per ~16ms ≈ exp(-2.5/sec) → momentum lasts ~1.2-1.6s for a mid-fling.
    const tick = (now: number) => {
      const frameDt = Math.min(now - lastT, 32);
      lastT = now;
      el.scrollLeft += v * frameDt;
      v *= Math.pow(0.96, frameDt / 16);
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 0) { el.scrollLeft = 0; v = 0; }
      else if (el.scrollLeft >= max) { el.scrollLeft = max; v = 0; }
      if (Math.abs(v) > 0.015) animRef.current = requestAnimationFrame(tick);
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
    <section className="relative mx-auto max-w-[1600px] px-6 md:px-10">
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
          {/* Leading spacer so the first slide can snap to the centre */}
          <div aria-hidden className="shrink-0 w-[6vw] md:w-[12vw]" />

          {PROJECTS.map((p, i) => (
            <a
              key={p.slug}
              href={`/work/${p.slug}/`}
              draggable={false}
              className="shrink-0 group flex flex-col items-start"
            >
              <div className="relative h-[44vh] md:h-[58vh]">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={p.width}
                  height={p.height}
                  priority={i < 2}
                  draggable={false}
                  className="block h-full w-auto select-none object-contain"
                  sizes="(max-width: 768px) 70vw, 32vw"
                />
              </div>
              <span className="mt-3 font-display text-h3 text-ink">
                {p.title}
              </span>
            </a>
          ))}

          <div aria-hidden className="shrink-0 w-[6vw] md:w-[12vw]" />
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
