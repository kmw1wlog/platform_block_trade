"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { seedStrategies } from "@/lib/seed-strategies";
import { StrategyCard } from "./StrategyCard";

export function LibraryClient() {
  const [query, setQuery] = useState("");
  const strategies = seedStrategies.filter((strategy) =>
    `${strategy.title} ${strategy.rawIdea}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">자료실</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          예시 전략 카드 20개입니다. 실제 투자 추천이 아니라 전략 정리 예시입니다.
        </p>
      </div>
      <Input placeholder="예시 전략 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="space-y-4">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} compact />
        ))}
      </div>
    </div>
  );
}
