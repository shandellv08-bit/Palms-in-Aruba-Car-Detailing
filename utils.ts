import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Decimalish = { toNumber: () => number };

export function formatAWG(
  amount: number | string | Decimalish | null | undefined
): string {
  const n =
    typeof amount === "string"
      ? parseFloat(amount)
      : typeof amount === "object" && amount !== null
      ? amount.toNumber()
      : amount ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AWG",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace("AWG", "Afl.");
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
