"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Moon, Palette, Sun } from "lucide-react";

type Locale = "en" | "hi" | "es";
type Accent = "orange" | "teal" | "violet" | "green" | "red";

type SidebarSettingsCardProps = {
  title: string;
  languageLabel: string;
  profileLabel: string;
  pwaLabel: string;
  theme: string | undefined;
  locale: Locale;
  accent: Accent;
  onToggleTheme: () => void;
  onSetLocale: (locale: Locale) => void;
  onSetAccent: (accent: Accent) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenPwa: () => void;
};

export function SidebarSettingsCard({
  title,
  languageLabel,
  profileLabel,
  pwaLabel,
  theme,
  locale,
  accent,
  onToggleTheme,
  onSetLocale,
  onSetAccent,
  onOpenProfile,
  onOpenSettings,
  onOpenPwa,
}: SidebarSettingsCardProps) {
  return (
    <Card className="p-4">
      <h4 className="mb-2 font-semibold">{title}</h4>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4" /> Theme
          </span>
          <Button size="sm" variant="outline" onClick={onToggleTheme}>
            {theme === "dark" ? (
              <>
                <Sun className="mr-1 h-4 w-4" /> Light
              </>
            ) : (
              <>
                <Moon className="mr-1 h-4 w-4" /> Dark
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> {languageLabel}
          </span>
          <div className="flex gap-1">
            {(["en", "hi", "es"] as Locale[]).map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={locale === lang ? "default" : "outline"}
                onClick={() => onSetLocale(lang)}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2">
            <Palette className="h-4 w-4" /> Accent color
          </div>
          <div className="flex flex-wrap gap-2">
            {(["orange", "teal", "violet", "green", "red"] as Accent[]).map(
              (tone) => (
                <button
                  key={tone}
                  type="button"
                  aria-label={`Set ${tone} accent`}
                  onClick={() => onSetAccent(tone)}
                  className={`h-6 w-6 rounded-full border-2 ${accent === tone ? "border-black dark:border-white" : "border-transparent"}`}
                  style={{
                    background:
                      tone === "orange"
                        ? "#f97316"
                        : tone === "teal"
                          ? "#06b6d4"
                          : tone === "violet"
                            ? "#8b5cf6"
                            : tone === "green"
                              ? "#10b981"
                              : "#ef4444",
                  }}
                />
              ),
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="w-full" onClick={onOpenProfile}>
            {profileLabel}
          </Button>
          <Button variant="outline" className="w-full" onClick={onOpenSettings}>
            Settings
          </Button>
        </div>

        <Button variant="outline" className="w-full" onClick={onOpenPwa}>
          {pwaLabel}
        </Button>
      </div>
    </Card>
  );
}
