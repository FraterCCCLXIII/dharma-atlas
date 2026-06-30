export function HomeHero() {
  return (
    <section
      className="relative min-h-[min(52dvh,28rem)] overflow-hidden"
      aria-label="Welcome"
    >
      <img
        src="/hero-monks.png"
        alt="Two Buddhist monks standing together at a temple entrance"
        className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
        fetchPriority="high"
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(52dvh,28rem)] max-w-6xl items-end px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-24 lg:px-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Discover the Dharma Everywhere
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Meditation centers, monasteries, and people across traditions — one
            living directory for your path.
          </p>
        </div>
      </div>
    </section>
  );
}
