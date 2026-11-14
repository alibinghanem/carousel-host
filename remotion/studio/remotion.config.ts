/**
 * All configuration options: https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Chromium مثبت مسبقاً في البيئة (لا تنزيل)
Config.setBrowserExecutable(
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
);
