import fs from "fs";
import path from "path";
import { buildFallbackSiteContent } from "../src/lib/content/fallback";

const outputPath = path.join(process.cwd(), "content", "site-content.json");
const content = buildFallbackSiteContent();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
