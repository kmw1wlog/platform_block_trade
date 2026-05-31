"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { chargeCookies, cookiePacks, getCookieBalance } from "@/lib/cookies";
import { addEvent } from "@/lib/storage";
import type { CookiePack } from "@/lib/types";

export function CookieStoreClient() {
  const [balance, setBalance] = useState(0);
  const [selected, setSelected] = useState<CookiePack | null>(null);

  useEffect(() => {
    setBalance(getCookieBalance());
  }, []);

  function openCheckout(pack: CookiePack) {
    addEvent({ type: "cookie_pack_selected", packId: pack.id, createdAt: new Date().toISOString() });
    addEvent({ type: "demo_checkout_opened", packId: pack.id, createdAt: new Date().toISOString() });
    setSelected(pack);
  }

  function completeDemoCheckout(pack: CookiePack) {
    setBalance(chargeCookies(pack));
    addEvent({ type: "demo_checkout_completed", packId: pack.id, createdAt: new Date().toISOString() });
    setSelected(null);
  }

  return (
    <div className="mx-auto w-[calc(100vw-4rem)] max-w-full space-y-5 md:w-full md:max-w-4xl">
      <section className="rounded-3xl bg-slate-950 p-6 text-white">
        <p className="text-xs font-bold text-emerald-300">쿠키 굽기</p>
        <h1 className="mt-2 text-3xl font-black">적용 요청에 쓰는 데모 쿠키</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          실제 결제는 진행하지 않습니다. 트레이딩뷰/예스트레이더 적용 요청 흐름을 검증하기 위한 데모 충전입니다.
        </p>
        <div className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-lg font-black text-slate-950">
          보유 {balance}개
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {cookiePacks.map((pack) => (
          <Card key={pack.id} className="space-y-4">
            <div>
              <p className="text-sm font-bold text-emerald-700">쿠키 {pack.cookies}개</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{pack.price.toLocaleString("ko-KR")}원</h2>
              <p className="mt-1 text-sm text-slate-500">
                {pack.discountPct > 0 ? `${pack.discountPct}% 할인 · 정가 ${pack.originalPrice.toLocaleString("ko-KR")}원` : "기준가"}
              </p>
            </div>
            <Button className="w-full rounded-2xl" onClick={() => openCheckout(pack)}>
              데모 결제창 보기
            </Button>
          </Card>
        ))}
      </div>

      {selected ? (
        <Modal open={Boolean(selected)} title="데모 결제창" onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-700">
              실제 결제가 아닌 데모입니다. 완료를 누르면 브라우저 localStorage에 쿠키 {selected.cookies}개가 충전됩니다.
            </p>
            <Button className="w-full rounded-2xl" onClick={() => completeDemoCheckout(selected)}>
              데모 충전 완료
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
