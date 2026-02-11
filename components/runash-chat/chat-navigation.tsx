"use client";

import { Button } from "@/components/ui/button";
import { Bot, CreditCard, LayoutGrid, Settings } from "lucide-react";

type ChatNavigationProps = {
  onOverview: () => void;
  onAgents: () => void;
  onPayments: () => void;
  onSettings: () => void;
};

export function ChatNavigation({
  onOverview,
  onAgents,
  onPayments,
  onSettings,
}: ChatNavigationProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white/70 p-2 dark:bg-gray-900/70">
      <Button variant="ghost" size="sm" onClick={onOverview}>
        <LayoutGrid className="mr-2 h-4 w-4" /> Overview
      </Button>
      <Button variant="ghost" size="sm" onClick={onAgents}>
        <Bot className="mr-2 h-4 w-4" /> Live Agents
      </Button>
      <Button variant="ghost" size="sm" onClick={onPayments}>
        <CreditCard className="mr-2 h-4 w-4" /> Payments
      </Button>
      <Button variant="ghost" size="sm" onClick={onSettings}>
        <Settings className="mr-2 h-4 w-4" /> Settings
      </Button>
    </div>
  );
}
