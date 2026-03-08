const SUI_DECIMALS = 1_000_000_000;

export function toSui(mist: string | number | bigint | null | undefined): string {
  if (mist === null || mist === undefined) return "0.0000";
  return (Number(mist) / SUI_DECIMALS).toFixed(4);
}

export function shortAddress(address?: string | null): string {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function parseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Request failed.";
}
