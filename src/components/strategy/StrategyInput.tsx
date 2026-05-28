"use client";

import { useEffect, useRef, useState } from "react";
import { MockBacktestReport } from "@/components/report/MockBacktestReport";
import { Textarea } from "@/components/ui/Textarea";
import { quickIdeaButtons, quickIdeas } from "@/lib/constants";
import { addEvent, saveReport, updateStrategy } from "@/lib/storage";
import type { MockBacktestReport as Report, StrategyCard as StrategyCardType } from "@/lib/types";
import { StrategyCard } from "./StrategyCard";

export function StrategyInput() {
  const [rawIdea, setRawIdea] = useState("");
  const [strategy, setStrategy] = useState<StrategyCardType | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
  }, [rawIdea]);

  async function createStrategy() {
    const idea = rawIdea.trim();
    if (!idea) {
      setError("전략 아이디어를 한 문장으로 적어주세요.");
      return;
    }
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const response = await fetch("/api/strategy/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawIdea: idea }),
      });
      const data = (await response.json()) as { strategy?: StrategyCardType; error?: string };
      if (!response.ok || !data.strategy) throw new Error(data.error ?? "전략 카드를 만들지 못했습니다.");
      setStrategy(data.strategy);
      setRawIdea("");
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
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-5xl flex-col">
      <div className="flex flex-1 flex-col gap-5">
        <section className={`mx-auto max-w-2xl pt-8 text-center ${strategy ? "hidden md:block" : ""}`}>
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-black text-white shadow-sm">
            식
          </div>
          <h1 className="text-2xl font-black tracking-normal text-slate-950 md:text-4xl">말하면 전략 카드</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
            아이디어를 적으면 진입, 청산, 필터로 나눠 정리합니다.
          </p>
        </section>

        {!strategy ? (
          <div className="mx-auto mt-auto max-w-2xl space-y-3 pb-24 md:pb-0">
            <div className="grid gap-2 text-sm font-semibold text-slate-800">
              {quickIdeaButtons.slice(0, 3).map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex min-h-12 items-center gap-4 rounded-2xl bg-white px-2 text-left transition hover:bg-slate-50 md:px-4"
                  onClick={() => setRawIdea(item.idea)}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-lg">
                    {["↗", "⌁", "▤"][index]}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {strategy ? (
          <div className="mx-auto max-w-5xl space-y-5 pb-28 md:pb-0">
            <StrategyCard strategy={strategy} onBacktest={runBacktest} />
            {report ? <MockBacktestReport strategy={strategy} report={report} /> : null}
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 px-4 pb-4 pt-3 backdrop-blur md:sticky md:bottom-4 md:mx-auto md:mt-6 md:w-full md:max-w-3xl md:rounded-3xl md:border md:px-4 md:shadow-lg md:ring-1 md:ring-slate-100">
        {error ? <p className="mb-2 text-center text-sm font-semibold text-rose-600">{error}</p> : null}
        <div className="flex items-end gap-2 rounded-full bg-slate-100 px-2 py-2 ring-1 ring-slate-200">
          <button
            type="button"
            aria-label="예시"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-3xl leading-none shadow-sm"
            onClick={() => setRawIdea(quickIdeas[0])}
          >
            +
          </button>
          <Textarea
            ref={textareaRef}
            rows={1}
            placeholder="전략 아이디어 입력"
            value={rawIdea}
            onChange={(event) => setRawIdea(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void createStrategy();
              }
            }}
            className="max-h-28 min-h-10 min-w-0 flex-1 resize-none !rounded-none !border-0 !bg-transparent px-1 py-2 text-base leading-6 shadow-none focus:!border-transparent focus:!ring-0"
          />
          <button
            type="button"
            aria-label="전략 카드 만들기"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xl font-black text-white transition disabled:bg-slate-300"
            onClick={createStrategy}
            disabled={loading}
          >
            {loading ? "…" : "↑"}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
          <span>실제 투자 추천 아님</span>
          <span>·</span>
          <span>모의검증용</span>
        </div>
      </div>
    </div>
  );
}
