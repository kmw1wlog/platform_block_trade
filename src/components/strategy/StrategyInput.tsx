"use client";

import { useState } from "react";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { MockBacktestReport } from "@/components/report/MockBacktestReport";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { quickIdeaButtons, quickIdeas } from "@/lib/constants";
import { addEvent, saveReport, updateStrategy } from "@/lib/storage";
import type { MockBacktestReport as Report, StrategyCard as StrategyCardType } from "@/lib/types";
import { StrategyCard } from "./StrategyCard";

export function StrategyInput() {
  const [rawIdea, setRawIdea] = useState(quickIdeas[0]);
  const [strategy, setStrategy] = useState<StrategyCardType | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createStrategy() {
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const response = await fetch("/api/strategy/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawIdea }),
      });
      const data = (await response.json()) as { strategy?: StrategyCardType; error?: string };
      if (!response.ok || !data.strategy) throw new Error(data.error ?? "전략 카드를 만들지 못했습니다.");
      setStrategy(data.strategy);
      addEvent({
        type: "strategy_created",
        strategyId: data.strategy.id,
        strategyType: data.strategy.strategyType,
        createdAt: new Date().toISOString(),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function runBacktest(target: StrategyCardType) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/strategy/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: target }),
      });
      const data = (await response.json()) as { report?: Report; error?: string };
      if (!response.ok || !data.report) throw new Error(data.error ?? "모의검증을 만들지 못했습니다.");
      saveReport(data.report);
      addEvent({ type: "mock_backtest_generated", strategyId: target.id, createdAt: new Date().toISOString() });
      const next = { ...target, hasReport: true, updatedAt: new Date().toISOString() };
      updateStrategy(next);
      setStrategy(next);
      setReport(data.report);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="py-6">
          <h1 className="max-w-3xl text-4xl font-black tracking-normal text-slate-950 md:text-5xl">
            말하면 전략 카드가 된다, 식톡
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            조건식 몰라도 괜찮습니다. 말로 적으면 AI가 진입·청산·종목·필터 조건으로 나눠줍니다.
          </p>
          <p className="mt-3 text-sm font-semibold text-amber-800">
            현재는 전략 정리와 모의검증용 MVP이며, 실제 투자 추천이나 자동매매 기능을 제공하지 않습니다.
          </p>
        </section>

        <Card className="space-y-4">
          <Textarea
            rows={5}
            placeholder="예: 거래량이 갑자기 늘고 전고점을 돌파하면 관심종목으로 보고 싶어."
            value={rawIdea}
            onChange={(event) => setRawIdea(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {quickIdeaButtons.map((item) => (
              <Button key={item.label} variant="ghost" className="min-h-9 px-3 py-1" onClick={() => setRawIdea(item.idea)}>
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createStrategy} disabled={loading}>
              {loading ? "정리 중..." : "전략 카드 만들기"}
            </Button>
            {error ? <span className="text-sm font-semibold text-rose-600">{error}</span> : null}
          </div>
        </Card>

        {strategy ? <StrategyCard strategy={strategy} onBacktest={runBacktest} /> : null}
        {strategy && report ? <MockBacktestReport strategy={strategy} report={report} /> : null}
      </div>

      <aside className="space-y-4">
        <DisclaimerBanner />
        <Card>
          <h2 className="text-lg font-black text-slate-950">AI 코치</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            식톡은 정확한 조건식 생성기가 아니라, 아이디어를 비교 가능한 문장형 전략 카드로 정리하는 작업공간입니다.
          </p>
        </Card>
      </aside>
    </div>
  );
}
