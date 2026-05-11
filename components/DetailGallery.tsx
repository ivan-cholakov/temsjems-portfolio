"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { ExtraImage } from "@/content/site";

type Props = {
  images: ExtraImage[];
  projectTitle: string;
};

type Lightbox = { kind: "closed" } | { kind: "open"; index: number };

export function DetailGallery({ images, projectTitle }: Props) {
  const [box, setBox] = useState<Lightbox>({ kind: "closed" });
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native <dialog> imperatively so we get the modal a11y stack
  // for free: focus trap, return-focus on close, ESC handling, ::backdrop,
  // and inert page beneath.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (box.kind === "open" && !dialog.open) dialog.showModal();
    if (box.kind === "closed" && dialog.open) dialog.close();
  }, [box]);

  // Arrow-key nav between details while open.
  useEffect(() => {
    if (box.kind !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && box.index > 0) {
        e.preventDefault();
        setBox({ kind: "open", index: box.index - 1 });
      }
      if (e.key === "ArrowRight" && box.index < images.length - 1) {
        e.preventDefault();
        setBox({ kind: "open", index: box.index + 1 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [box, images.length]);

  if (images.length === 0) return null;

  const close = () => setBox({ kind: "closed" });
  const open = box.kind === "open" ? images[box.index] : null;
  const total = images.length;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-start gap-3 md:mt-8 md:gap-4">
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => setBox({ kind: "open", index: i })}
            aria-label={
              img.label
                ? `Open detail ${i + 1} — ${img.label}`
                : `Open detail ${i + 1}`
            }
            className="group relative h-[88px] w-[88px] overflow-hidden bg-paper md:h-[112px] md:w-[112px]"
          >
            <Image
              src={img.src}
              alt=""
              width={img.width}
              height={img.height}
              sizes="112px"
              className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            />
            <span className="pointer-events-none absolute left-1 top-1 bg-paper/90 px-1 py-[2px] text-[0.6rem] font-mono uppercase tracking-[0.18em] text-ink">
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-ink/95 p-0 text-paper backdrop:bg-ink/80"
      >
        {open && box.kind === "open" && (
          <div
            className="relative flex h-full w-full flex-col items-center justify-center px-4 py-6 md:px-10 md:py-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close lightbox"
              className="absolute right-4 top-4 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-paper/80 transition-colors hover:text-paper md:right-8 md:top-6"
            >
              CLOSE ×
            </button>

            <Image
              src={open.src}
              alt={open.alt ?? `${projectTitle} — detail ${box.index + 1}`}
              width={open.width}
              height={open.height}
              sizes="(min-width: 768px) 90vw, 100vw"
              priority
              className="block max-h-[80vh] w-auto object-contain"
            />

            {total > 1 && (
              <div className="mt-4 flex items-center justify-center gap-8 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/70 md:mt-6">
                <button
                  type="button"
                  onClick={() => setBox({ kind: "open", index: box.index - 1 })}
                  disabled={box.index === 0}
                  aria-label="Previous detail"
                  className="transition-colors hover:text-paper disabled:pointer-events-none disabled:opacity-30"
                >
                  ← PREV
                </button>
                <button
                  type="button"
                  onClick={() => setBox({ kind: "open", index: box.index + 1 })}
                  disabled={box.index === total - 1}
                  aria-label="Next detail"
                  className="transition-colors hover:text-paper disabled:pointer-events-none disabled:opacity-30"
                >
                  NEXT →
                </button>
              </div>
            )}

            {open.note && (
              <p className="mt-3 max-w-[60ch] text-center font-sans italic text-paper/60 md:mt-4">
                {open.note}
              </p>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
