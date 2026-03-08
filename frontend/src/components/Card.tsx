import type { PropsWithChildren, ReactNode } from "react";

type Tone = "sky" | "amber" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  sky: "card-tone-sky",
  amber: "card-tone-amber",
  neutral: "card-tone-neutral",
};

export function Card({
  title,
  eyebrow,
  action,
  tone = "neutral",
  children,
}: PropsWithChildren<{
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  tone?: Tone;
}>) {
  return (
    <section className={`card ${TONE_CLASS[tone]}`}>
      <div className="card-header">
        <div>
          {eyebrow ? <div className="card-eyebrow">{eyebrow}</div> : null}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
