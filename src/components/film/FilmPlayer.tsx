"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { FilmStatus } from "@/content/types";
import styles from "./film.module.css";

export type FilmPlayerData = {
  status: FilmStatus;
  title: string;
  poster?: { src: string; width: number; height: number; alt: string; blur: string };
  sources: Array<{ src: string; type: string }>;
  tracks: Array<{ src: string; srclang: string; label: string; kind: "subtitles" | "captions"; default?: boolean }>;
  chapters: Array<{ start: number; title: string; links: Array<{ href: string; label: string }> }>;
  transcript: Array<{ start?: number; speaker?: string; text: string }>;
};

export type FilmLabels = {
  planned: string;
  inProduction: string;
  play: string;
  chapters: string;
  transcript: string;
  related: string;
  noSound: string;
};

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Documentary player. Nothing is downloaded until the visitor presses play: before that only the
 * poster (or an empty, labelled screen) is shown. Sound never starts on its own.
 */
export function FilmPlayer({ film, labels, headingLevel = 3 }: { film: FilmPlayerData; labels: FilmLabels; headingLevel?: 2 | 3 }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const available = film.status === "available" && film.sources.length > 0;
  const H = `h${headingLevel}` as const;

  const seek = (t: number) => {
    setPlaying(true);
    // The video element mounts on the first play; wait a frame for it.
    requestAnimationFrame(() => {
      const v = video.current;
      if (!v) return;
      v.currentTime = t;
      void v.play();
    });
  };

  return (
    <div className={styles.player}>
      <div className={styles.screen}>
        {playing && available ? (
          <video ref={video} controls autoPlay playsInline preload="metadata" poster={film.poster?.src}>
            {film.sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
            {film.tracks.map((t) => (
              <track key={t.src} src={t.src} srcLang={t.srclang} label={t.label} kind={t.kind} default={t.default} />
            ))}
          </video>
        ) : (
          <>
            {film.poster && (
              <Image
                src={film.poster.src}
                alt={film.poster.alt}
                fill
                sizes="(min-width: 60rem) 60vw, 100vw"
                placeholder="blur"
                blurDataURL={film.poster.blur}
                className={styles.poster}
              />
            )}
            {available ? (
              <button type="button" className={styles.play} onClick={() => setPlaying(true)}>
                <span aria-hidden="true" className={styles.playIcon} />
                {labels.play}
              </button>
            ) : (
              <p className={styles.status} role="status">
                {film.status === "in-production" ? labels.inProduction : labels.planned}
              </p>
            )}
          </>
        )}
      </div>
      {available && <p className={styles.hint}>{labels.noSound}</p>}

      {film.chapters.length > 0 && (
        <section className={styles.chapters} aria-label={labels.chapters}>
          <H className={styles.subheading}>{labels.chapters}</H>
          <ol>
            {film.chapters.map((c) => (
              <li key={c.start}>
                <button type="button" onClick={() => seek(c.start)} disabled={!available}>
                  <span className={styles.time}>{clock(c.start)}</span> {c.title}
                </button>
                {c.links.length > 0 && (
                  <p className={styles.chapterLinks}>
                    {labels.related}:{" "}
                    {c.links.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 && ", "}
                        <Link href={l.href}>{l.label}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {film.transcript.length > 0 && (
        <details className={styles.transcript}>
          <summary>{labels.transcript}</summary>
          <div>
            {film.transcript.map((line, i) => (
              <p key={i}>
                {line.start !== undefined && (
                  <button type="button" className={styles.time} onClick={() => seek(line.start!)} disabled={!available}>
                    {clock(line.start)}
                  </button>
                )}{" "}
                {line.speaker && <strong>{line.speaker}: </strong>}
                {line.text}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
