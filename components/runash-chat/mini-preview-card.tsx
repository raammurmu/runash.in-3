"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Leaf, Sparkles } from "lucide-react";

export type PreviewMessage = {
  id: string | number;
  role: "assistant" | "user";
  content: string;
  created_at?: string;
};

export type QuickPrompt = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MiniPreviewCardProps = {
  title: string;
  subtitle: string;
  sessionId: number | null;
  loadingSession: boolean;
  messagesPreview: PreviewMessage[];
  quickPrompts: QuickPrompt[];
  relativeTime: (timestamp?: string) => string;
  prompt: string;
  setPrompt: (value: string) => void;
  onSelectQuickPrompt: (prompt: string) => void;
  onSubmitPrompt: () => void;
};

export function MiniPreviewCard({
  title,
  subtitle,
  sessionId,
  loadingSession,
  messagesPreview,
  quickPrompts,
  relativeTime,
  prompt,
  setPrompt,
  onSelectQuickPrompt,
  onSubmitPrompt,
}: MiniPreviewCardProps) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{title}</h4>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {sessionId ? `Session #${sessionId}` : "New session"}
        </Badge>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border bg-orange-50 p-2 dark:bg-gray-900">
          <div className="font-medium text-orange-700 dark:text-orange-400">
            Messages
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {messagesPreview.length || 0} in preview
          </div>
        </div>
        <div className="rounded-md border bg-green-50 p-2 dark:bg-gray-900">
          <div className="font-medium text-green-700 dark:text-green-400">
            Agent mode
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Commerce + payment
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-64 rounded-md border p-3">
        <div className="space-y-2">
          {loadingSession && (
            <div className="text-sm text-gray-500">Loading preview...</div>
          )}
          {!loadingSession && messagesPreview.length === 0 && (
            <div className="text-sm text-gray-600">
              No messages yet — start a session to see previews
            </div>
          )}
          {messagesPreview.map((message) => (
            <div
              key={message.id}
              className={`rounded-md border p-2 text-xs ${message.role === "user" ? "bg-orange-50 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`font-medium ${message.role === "assistant" ? "text-orange-700 dark:text-orange-400" : "text-gray-700 dark:text-gray-200"}`}
                >
                  {message.role === "assistant" ? "RunAsh Agent" : "You"}
                </span>
                <span className="text-[11px] text-gray-500">
                  {relativeTime(message.created_at)}
                </span>
              </div>
              <p className="line-clamp-3 text-gray-700 dark:text-gray-300">
                {message.content}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-3 space-y-2">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Quick agent prompts
        </div>
        <div className="grid grid-cols-1 gap-2">
          {quickPrompts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectQuickPrompt(item.prompt)}
                className="flex items-start gap-2 rounded-md border p-2 text-left transition-colors hover:bg-orange-50 dark:hover:bg-gray-900"
              >
                <Icon className="mt-0.5 h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-xs font-medium">{item.label}</div>
                  <div className="text-[11px] text-gray-500">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask the agent like Codex… (Tip: /bundle, /checkout, /support)"
          className="min-h-[88px]"
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Enter to send in chat after redirect • Shift+Enter for multiline
          </span>
          <span>{prompt.length} chars</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => setPrompt(`${prompt}${prompt ? "\n" : ""}/bundle `)}
          >
            /bundle
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              setPrompt(`${prompt}${prompt ? "\n" : ""}/checkout `)
            }
          >
            /checkout
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => setPrompt(`${prompt}${prompt ? "\n" : ""}/support `)}
          >
            /support
          </Button>
        </div>
        <Button
          onClick={onSubmitPrompt}
          disabled={!prompt.trim()}
          className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white"
        >
          Ask & Continue
        </Button>
      </div>

      <div className="mt-3 flex gap-3 text-xs text-gray-500">
        <span className="flex items-center">
          <Leaf className="mr-1 h-3 w-3 text-green-500" /> Organic Focus
        </span>
        <span className="flex items-center">
          <Sparkles className="mr-1 h-3 w-3 text-orange-500" /> Agentic AI
        </span>
      </div>
    </Card>
  );
}
