import { TraditionsShell } from "@/components/traditions/TraditionsShell";
import { getTraditionNavForest } from "@/lib/data/tradition-articles";
import { SHOW_TRADITIONS } from "@/lib/feature-flags";

export default async function TraditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!SHOW_TRADITIONS) return children;

  const forest = await getTraditionNavForest();

  return <TraditionsShell forest={forest}>{children}</TraditionsShell>;
}
