import Link from "next/link";

const groups = [
  "전체 전략",
  "최근 생성한 전략",
  "최근 모의검증한 전략",
  "변환 요청한 전략",
  "진입식",
  "청산식",
  "종목식",
  "필터식",
  "리스크 관리식",
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
      <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">식 서랍</div>
      <nav className="space-y-1">
        {groups.map((group) => (
          <Link
            key={group}
            href="/drawer"
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            {group}
          </Link>
        ))}
      </nav>
      <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        조건식 몰라도 괜찮습니다. 먼저 말로 정리하고, 필요한 변환 수요만 기록합니다.
      </div>
    </aside>
  );
}
