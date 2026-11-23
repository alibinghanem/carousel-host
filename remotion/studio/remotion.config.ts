/**
 * All configuration options: https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Chromium مثبت مسبقاً في البيئة (لا تنزيل): نبحث عن أي نسخة headless_shell متوفرة
import { existsSync, readdirSync } from "node:fs";

const findBrowser = (): string | null => {
  const root = "/opt/pw-browsers";
  if (!existsSync(root)) return null;
  for (const d of readdirSync(root).filter((x) => x.startsWith("chromium_headless_shell")).sort().reverse()) {
    for (const rel of ["chrome-headless-shell-linux64/chrome-headless-shell", "chrome-linux/headless_shell"]) {
      const f = `${root}/${d}/${rel}`;
      if (existsSync(f)) return f;
    }
  }
  return null;
};
const browser = findBrowser();
if (browser) Config.setBrowserExecutable(browser);
