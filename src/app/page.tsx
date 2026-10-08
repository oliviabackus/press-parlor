import { TheCounter } from "@/components/TheCounter";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="parlor-sprinkles" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <p className="text-sm font-extrabold tracking-[0.22em] text-chocolate-soft uppercase">
            Press Parlor
          </p>
          <p className="font-display text-5xl leading-none text-chocolate sm:text-6xl">
            THE Scoop!!
          </p>
        </header>
        <TheCounter />
      </div>
      <div className="parlor-floor relative mt-8 h-16 w-full" aria-hidden="true" />
    </div>
  );
}
