"use client";

import { useId, useRef, useState, type DragEvent, type FormEvent } from "react";

const FEEDS = ["School Socials", "District Socials", "Both"] as const;

type Feed = (typeof FEEDS)[number];

type FieldName = "ambassador" | "event" | "date" | "feed" | "files";

type Errors = Partial<Record<FieldName, string>>;

type ScoopFile = {
  id: string;
  file: File;
};

const fieldClass =
  "parlor-field w-full rounded-2xl px-4 py-3 text-base text-chocolate outline-none placeholder:text-chocolate-soft/70";

function isMedia(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

function ticketName(event: string, date: string, ambassador: string, fileName: string) {
  const piece = (value: string) =>
    value
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  return `${piece(event)}_${date}_${piece(ambassador)}${ext}`;
}

export function TheCounter() {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const ambassadorRef = useRef<HTMLInputElement>(null);
  const eventRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLSelectElement>(null);
  const [ambassador, setAmbassador] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [feed, setFeed] = useState<Feed | "">("");
  const [files, setFiles] = useState<ScoopFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const media = incoming.filter(isMedia);
    const rejected = incoming.length - media.length;

    setFiles((current) => [
      ...current,
      ...media.map((file) => ({ id: `${file.name}-${file.size}-${file.lastModified}`, file })),
    ]);

    setErrors((current) => {
      const next = { ...current };
      delete next.files;
      if (rejected > 0) {
        next.files = "Only images and video can go in the scoop.";
      }
      return next;
    });
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!ambassador.trim()) next.ambassador = "Add the ambassador’s name.";
    if (!eventName.trim()) next.event = "Name the event.";
    if (!eventDate) next.date = "Pick the event date.";
    if (!feed) next.feed = "Choose where this scoop should go.";
    if (files.length === 0) next.files = "Add at least one image or video.";
    return next;
  }

  function focusFirst(next: Errors) {
    const order: FieldName[] = ["ambassador", "event", "date", "feed", "files"];
    const first = order.find((name) => next[name]);
    const map = {
      ambassador: ambassadorRef.current,
      event: eventRef.current,
      date: dateRef.current,
      feed: feedRef.current,
      files: inputRef.current,
    };
    if (first) map[first]?.focus();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirst(next);
      return;
    }

    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 1400);
  }

  function reset() {
    setAmbassador("");
    setEventName("");
    setEventDate("");
    setFeed("");
    setFiles([]);
    setErrors({});
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  const errorEntries = Object.entries(errors) as [FieldName, string][];

  return (
    <section
      className="relative rounded-[2rem] border border-pink/80 bg-vanilla/90 p-5 shadow-[0_18px_50px_rgb(60_36_21/0.08)] sm:p-8"
      aria-labelledby={`${formId}-title`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-wide text-chocolate-soft uppercase">
            Student desk
          </p>
          <h1
            id={`${formId}-title`}
            className="font-display text-4xl leading-tight text-chocolate sm:text-5xl"
          >
            The Counter <span aria-hidden="true">🍦</span>
          </h1>
        </div>
        <p className="hidden max-w-44 rounded-full bg-mint px-3 py-2 text-center text-sm font-bold text-chocolate sm:block">
          Approve first. Then it leaves the freezer.
        </p>
      </div>

      <p className="mb-6 max-w-xl text-lg leading-relaxed text-chocolate-soft">
        Assemble the photos and video for this event. The scoop stays here until an administrator
        approves it.
      </p>

      {status === "done" ? (
        <div className="rounded-3xl bg-mint/70 p-6" role="status">
          <h2 className="font-display text-3xl text-chocolate">
            In the freezer <span aria-hidden="true">🍨</span>
          </h2>
          <p className="mt-2 text-lg text-chocolate">
            {eventName.trim()} from {ambassador.trim()} is waiting on an administrator. Target feed:{" "}
            {feed}.
          </p>
          <ul className="mt-4 space-y-2">
            {files.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-vanilla px-4 py-3 font-mono text-sm break-all text-chocolate"
              >
                {ticketName(eventName, eventDate, ambassador, item.file.name)}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-chocolate px-6 text-base font-bold text-cream transition hover:bg-chocolate-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
          >
            Assemble another scoop
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate aria-describedby={`${formId}-note`}>
          {errorEntries.length > 0 ? (
            <div
              className="mb-5 rounded-2xl bg-pink/70 px-4 py-3 text-chocolate"
              role="alert"
            >
              <p className="font-bold">The counter still needs a few details.</p>
              <ul className="mt-1 list-disc pl-5">
                {errorEntries.map(([name, message]) => (
                  <li key={name}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-ambassador`} className="mb-2 block font-bold">
                Ambassador Name
              </label>
              <input
                ref={ambassadorRef}
                id={`${formId}-ambassador`}
                name="ambassador"
                type="text"
                autoComplete="name"
                value={ambassador}
                onChange={(event) => setAmbassador(event.target.value)}
                className={fieldClass}
                aria-invalid={Boolean(errors.ambassador)}
                aria-describedby={errors.ambassador ? `${formId}-ambassador-error` : undefined}
                disabled={status === "loading"}
              />
              {errors.ambassador ? (
                <p id={`${formId}-ambassador-error`} className="mt-2 text-sm font-semibold">
                  {errors.ambassador}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${formId}-event`} className="mb-2 block font-bold">
                Event Name
              </label>
              <input
                ref={eventRef}
                id={`${formId}-event`}
                name="event"
                type="text"
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
                className={fieldClass}
                aria-invalid={Boolean(errors.event)}
                aria-describedby={errors.event ? `${formId}-event-error` : undefined}
                disabled={status === "loading"}
              />
              {errors.event ? (
                <p id={`${formId}-event-error`} className="mt-2 text-sm font-semibold">
                  {errors.event}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${formId}-date`} className="mb-2 block font-bold">
                Event Date
              </label>
              <input
                ref={dateRef}
                id={`${formId}-date`}
                name="date"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                className={fieldClass}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? `${formId}-date-error` : undefined}
                disabled={status === "loading"}
              />
              {errors.date ? (
                <p id={`${formId}-date-error`} className="mt-2 text-sm font-semibold">
                  {errors.date}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${formId}-feed`} className="mb-2 block font-bold">
                Target Feed
              </label>
              <select
                ref={feedRef}
                id={`${formId}-feed`}
                name="feed"
                value={feed}
                onChange={(event) => setFeed(event.target.value as Feed | "")}
                className={fieldClass}
                aria-invalid={Boolean(errors.feed)}
                aria-describedby={errors.feed ? `${formId}-feed-error` : undefined}
                disabled={status === "loading"}
              >
                <option value="">Choose a feed</option>
                {FEEDS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.feed ? (
                <p id={`${formId}-feed-error`} className="mt-2 text-sm font-semibold">
                  {errors.feed}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <h2 id={`${formId}-scoop`} className="font-display text-3xl text-chocolate">
              The Scoop <span aria-hidden="true">🍨</span>
            </h2>
            <p id={`${formId}-scoop-help`} className="mt-1 text-chocolate-soft">
              Drop images or video here, or browse files.
            </p>
            <label
              htmlFor={`${formId}-files`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`parlor-drop mt-3 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl px-4 py-8 text-center ${
                dragging ? "is-hot" : ""
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                🍧
              </span>
              <span className="mt-2 text-lg font-bold">
                {dragging ? "Let go to add the scoop" : "Images and video"}
              </span>
              <span className="mt-1 text-sm text-chocolate-soft">JPG, PNG, GIF, WEBP, MP4, MOV</span>
              <input
                ref={inputRef}
                id={`${formId}-files`}
                name="scoop"
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                aria-describedby={`${formId}-scoop-help`}
                aria-invalid={Boolean(errors.files)}
                disabled={status === "loading"}
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            {errors.files ? (
              <p className="mt-2 text-sm font-semibold" role="alert">
                {errors.files}
              </p>
            ) : null}

            {files.length > 0 ? (
              <ul className="mt-4 space-y-2" aria-label="Files in this scoop">
                {files.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3"
                  >
                    <span className="min-w-0 truncate text-sm font-semibold">{item.file.name}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full px-3 py-1 text-sm font-bold text-chocolate underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
                      onClick={() =>
                        setFiles((current) => current.filter((entry) => entry.id !== item.id))
                      }
                      disabled={status === "loading"}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <p id={`${formId}-note`} className="mt-6 text-sm text-chocolate-soft sm:hidden">
            Approve first. Then it leaves the freezer.
          </p>

          <button
            type="submit"
            className="parlor-submit mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-pink-deep px-6 text-lg font-extrabold text-chocolate transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:cursor-wait disabled:bg-pink sm:w-auto"
            disabled={status === "loading"}
            aria-busy={status === "loading"}
          >
            {status === "loading" ? "Chilling the scoop…" : "Send to the Freezer 🍦"}
          </button>
          <p className="sr-only" aria-live="polite">
            {status === "loading" ? "Sending the scoop to the freezer." : ""}
          </p>
        </form>
      )}
    </section>
  );
}
