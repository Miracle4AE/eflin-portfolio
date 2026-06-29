import fs from "fs";
import path from "path";
import { buildFallbackSiteContent } from "@/lib/content/fallback";
import type { SiteContent } from "@/lib/content/types";

export const CONTENT_FILE_PATH = path.join(
  process.cwd(),
  "content",
  "site-content.json",
);

let cachedContent: SiteContent | null = null;
let cacheMtime = 0;

function readJsonFile(): SiteContent | null {
  try {
    if (!fs.existsSync(CONTENT_FILE_PATH)) return null;
    const stat = fs.statSync(CONTENT_FILE_PATH);
    if (cachedContent && stat.mtimeMs === cacheMtime) {
      return cachedContent;
    }
    const raw = fs.readFileSync(CONTENT_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as SiteContent;
    cachedContent = parsed;
    cacheMtime = stat.mtimeMs;
    return parsed;
  } catch (error) {
    console.warn("[Content] Failed to read site-content.json:", error);
    return null;
  }
}

export function loadSiteContent(): SiteContent {
  const fromFile = readJsonFile();
  if (fromFile) return fromFile;
  return buildFallbackSiteContent();
}

export function writeSiteContent(content: SiteContent): void {
  const dir = path.dirname(CONTENT_FILE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONTENT_FILE_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  cachedContent = content;
  cacheMtime = fs.statSync(CONTENT_FILE_PATH).mtimeMs;
}

export function canWriteContentFile(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ADMIN_ENABLE_FILE_WRITE === "true"
  );
}

export function invalidateContentCache(): void {
  cachedContent = null;
  cacheMtime = 0;
}
