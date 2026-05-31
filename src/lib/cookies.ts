import { createId } from "./id";
import type { CookiePack, CookieTransaction } from "./types";

const balanceKey = "siktalk.cookies.balance";
const transactionKey = "siktalk.cookies.transactions";

export const cookiePacks: CookiePack[] = [
  { id: "cookies_10", cookies: 10, originalPrice: 5000, price: 5000, discountPct: 0 },
  { id: "cookies_50", cookies: 50, originalPrice: 25000, price: 23750, discountPct: 5 },
  { id: "cookies_100", cookies: 100, originalPrice: 50000, price: 45000, discountPct: 10 },
];

export function getCookieBalance(): number {
  if (typeof window === "undefined") return 0;
  const value = Number(window.localStorage.getItem(balanceKey));
  return Number.isFinite(value) ? value : 0;
}

export function getCookieTransactions(): CookieTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(transactionKey);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as CookieTransaction[]) : [];
  } catch {
    return [];
  }
}

export function chargeCookies(pack: CookiePack): number {
  const nextBalance = getCookieBalance() + pack.cookies;
  writeBalance(nextBalance);
  addTransaction({
    id: createId("cookie_charge"),
    type: "charge",
    amount: pack.cookies,
    reason: `${pack.cookies}개 데모 충전`,
    createdAt: new Date().toISOString(),
  });
  return nextBalance;
}

export function spendCookies(amount: number, reason: string): boolean {
  const balance = getCookieBalance();
  if (balance < amount) return false;
  writeBalance(balance - amount);
  addTransaction({
    id: createId("cookie_spend"),
    type: "spend",
    amount: -amount,
    reason,
    createdAt: new Date().toISOString(),
  });
  return true;
}

function writeBalance(balance: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(balanceKey, String(Math.max(0, balance)));
}

function addTransaction(transaction: CookieTransaction): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(transactionKey, JSON.stringify([transaction, ...getCookieTransactions()]));
}
