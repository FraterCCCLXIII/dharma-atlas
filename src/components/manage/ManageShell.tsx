import type { ReactNode } from "react";

export function ManageShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface text-ink">
      <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6 md:pb-10 md:pt-5 lg:px-8">
        {children}
      </main>
    </div>
  );
}
