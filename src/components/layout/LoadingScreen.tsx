import { SiteLogo } from "@/components/layout/SiteLogo";

interface LoadingScreenProps {
  message?: string;
  minHeightClassName?: string;
}

export function LoadingScreen({
  message = "Loading…",
  minHeightClassName = "min-h-dvh",
}: LoadingScreenProps) {
  return (
    <div
      className={`flex w-full ${minHeightClassName} flex-col items-center justify-center gap-4 px-6 text-center`}
    >
      <SiteLogo className="justify-center" variant="wordmark" />
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  );
}
