"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { platformLabels } from "@/lib/constants";
import { recordConversionClick } from "@/lib/storage";
import type { ConversionPlatform, StrategyCard } from "@/lib/types";
import { FakeDoorModal } from "./FakeDoorModal";

const platforms: ConversionPlatform[] = [
  "tradingview",
  "kiwoom",
  "yestrader",
  "mts",
  "webhook",
  "telegram",
];

export function ConversionButtons({ strategy }: { strategy: StrategyCard }) {
  const [selected, setSelected] = useState<ConversionPlatform | null>(null);

  function open(platform: ConversionPlatform) {
    recordConversionClick(strategy.id, platform, strategy.strategyType, "card");
    setSelected(platform);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-950">플랫폼 변환 요청</h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <Button key={platform} variant="secondary" onClick={() => open(platform)}>
            {platformLabels[platform]} 변환 요청
          </Button>
        ))}
      </div>
      {selected ? (
        <FakeDoorModal
          strategy={strategy}
          platform={selected}
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
