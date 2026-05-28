import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/" className="text-xl font-black tracking-normal text-slate-950">
          식톡
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/drawer" className="hover:text-emerald-700">식 서랍</Link>
          <Link href="/library" className="hover:text-emerald-700">자료실</Link>
          <Link href="/dashboard" className="hover:text-emerald-700">대시보드</Link>
          <Link href="/admin" className="hover:text-emerald-700">베타 신청</Link>
        </nav>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">쿠키 0개</span>
          <Badge tone="emerald">Free 플랜</Badge>
        </div>
      </div>
    </header>
  );
}
