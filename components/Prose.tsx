import type { ReactNode } from "react";

import type { ProseRun } from "@/content/site";

/**
 * A show or work title. Art-CV convention sets these in italics and leaves
 * institution names roman; this component is the one place that convention is
 * spelled, so the CV list and the bio cannot drift into disagreeing about it.
 */
export function WorkTitle({ children }: { children: ReactNode }) {
  return <em>{children}</em>;
}

/**
 * Renders a run of prose in which work titles are italicised - the inline
 * counterpart to `PostBody`'s block union. The switch is exhaustive: adding a
 * new run kind is a compile error until it is handled here.
 *
 * The result is a mixed array of strings and elements. Only the elements need
 * a key; bare strings in a React array do not, which is why the `text` case
 * returns the string rather than wrapping it in a keyed fragment.
 */
export function Prose({ runs }: { runs: ReadonlyArray<ProseRun> }) {
  return runs.map((run, i) => {
    switch (run.kind) {
      case "text":
        return run.text;
      case "title":
        return <WorkTitle key={i}>{run.text}</WorkTitle>;
      default: {
        const unhandled: never = run;
        return unhandled;
      }
    }
  });
}
