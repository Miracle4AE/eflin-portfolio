#!/usr/bin/env node
/**
 * Portfolio asset validator — reports missing, oversized, or misnamed files.
 * Does not fail the build by default. Exit code 1 only with --strict.
 *
 * Usage:
 *   node scripts/validate-assets.mjs
 *   node scripts/validate-assets.mjs --strict
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC_IMAGES = path.join(ROOT, "public", "images");
const PROJECTS_TS = path.join(ROOT, "src", "data", "projects.ts");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".webp"]);
const VIDEO_EXT = new Set([".mp4"]);
const ALLOWED_EXT = new Set([...IMAGE_EXT, ...VIDEO_EXT]);

/** Warn thresholds in bytes */
const SIZE_LIMITS = {
  portrait: 600 * 1024,
  cover: 800 * 1024,
  hero: 1200 * 1024,
  gallery: 700 * 1024,
  video: 12 * 1024 * 1024,
  videoCritical: 20 * 1024 * 1024,
};

const GALLERY_NAME = /^gallery-\d{2}\.(jpg|jpeg|webp)$/i;
const STANDARD_PROJECT_FILES = ["cover.jpg", "hero.jpg"];
const OPTIONAL_PROJECT_FILES = ["hero.mp4"];

const strict = process.argv.includes("--strict");

const issues = { error: [], warn: [], info: [] };

function add(level, message) {
  issues[level].push(message);
}

function fileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseProjects(content) {
  const projects = [];
  const blocks = content.split(/\{\s*\n\s*slug:/).slice(1);

  for (const block of blocks) {
    const slugMatch = block.match(/^ "([^"]+)"/);
    if (!slugMatch) continue;

    const slug = slugMatch[1];
    const galleryFiles = [...block.matchAll(/file:\s*"([^"]+)"/g)].map((m) => m[1]);

    projects.push({ slug, galleryFiles });
  }

  return projects;
}

function listDirSafe(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return null;
  }
}

function isEmptyGitkeepFolder(dir) {
  const entries = listDirSafe(dir);
  if (!entries) return false;
  const visible = entries.filter((e) => e !== ".DS_Store");
  return visible.length === 1 && visible[0] === ".gitkeep";
}

function classifyProjectFile(filename) {
  if (filename === "cover.jpg") return "cover";
  if (filename === "hero.jpg") return "hero";
  if (filename === "hero.mp4") return "video";
  if (GALLERY_NAME.test(filename)) return "gallery";
  return "other";
}

function checkFile(filePath, relativePath, kind) {
  if (!fs.existsSync(filePath)) return false;

  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);

  if (!ALLOWED_EXT.has(ext)) {
    add("warn", `Unsupported format: ${relativePath} (${ext || "no extension"})`);
  }

  if (basename !== basename.toLowerCase()) {
    add("warn", `Likely wrong name (use lowercase): ${relativePath}`);
  }

  if (/\s/.test(basename)) {
    add("warn", `Filename contains spaces: ${relativePath}`);
  }

  if (kind === "gallery" && !GALLERY_NAME.test(basename)) {
    add("warn", `Gallery file should match gallery-NN.jpg: ${relativePath}`);
  }

  const size = fileSize(filePath);
  if (size === null) return true;

  let limit = SIZE_LIMITS.gallery;
  if (kind === "portrait") limit = SIZE_LIMITS.portrait;
  else if (kind === "cover") limit = SIZE_LIMITS.cover;
  else if (kind === "hero") limit = SIZE_LIMITS.hero;
  else if (kind === "video") limit = SIZE_LIMITS.video;

  if (kind === "video" && size > SIZE_LIMITS.videoCritical) {
    add("warn", `Video very large (${formatBytes(size)}): ${relativePath} — aim under ${formatBytes(SIZE_LIMITS.video)}`);
  } else if (size > limit) {
    add("warn", `Oversized (${formatBytes(size)}, recommended ≤ ${formatBytes(limit)}): ${relativePath}`);
  }

  return true;
}

function findDuplicateSizes(fileRecords) {
  const bySize = new Map();
  for (const { relativePath, size } of fileRecords) {
    if (size === null || size === 0) continue;
    const key = String(size);
    if (!bySize.has(key)) bySize.set(key, []);
    bySize.get(key).push(relativePath);
  }

  for (const [sizeKey, paths] of bySize) {
    if (paths.length > 1) {
      const uniqueProjects = new Set(
        paths.map((p) => {
          const m = p.match(/projects\/([^/]+)\//);
          return m ? m[1] : p;
        }),
      );
      if (uniqueProjects.size > 1) {
        add(
          "info",
          `Same file size (${formatBytes(Number(sizeKey))}) — possible duplicate placeholder: ${paths.join(", ")}`,
        );
      }
    }
  }
}

function printManifest(projects) {
  console.log("\n── Expected asset manifest ──\n");

  console.log("Site");
  console.log("  portrait.jpg\n");

  for (const { slug, galleryFiles } of projects) {
    console.log(`${slug.charAt(0).toUpperCase() + slug.slice(1)}:`);
    for (const file of STANDARD_PROJECT_FILES) {
      console.log(`  ${file}`);
    }
    console.log("  hero.mp4 (optional)");
    for (const file of galleryFiles) {
      console.log(`  ${file}`);
    }
    console.log("");
  }
}

function main() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   Eflin Portfolio — Asset Validator  ║");
  console.log("╚══════════════════════════════════════╝\n");

  if (!fs.existsSync(PROJECTS_TS)) {
    add("error", `Missing ${path.relative(ROOT, PROJECTS_TS)}`);
    printReport();
    process.exit(strict ? 1 : 0);
  }

  const projectsContent = fs.readFileSync(PROJECTS_TS, "utf8");
  const projects = parseProjects(projectsContent);

  if (projects.length === 0) {
    add("error", "No projects parsed from projects.ts — check file format.");
  }

  const fileRecords = [];
  const portraitPath = path.join(PUBLIC_IMAGES, "portrait.jpg");
  const portraitRelative = "/images/portrait.jpg";

  if (!checkFile(portraitPath, portraitRelative, "portrait")) {
    add("warn", `Missing portrait: ${portraitRelative}`);
  } else {
    fileRecords.push({ relativePath: portraitRelative, size: fileSize(portraitPath) });
  }

  const projectsDir = path.join(PUBLIC_IMAGES, "projects");
  const diskSlugs = listDirSafe(projectsDir) ?? [];

  for (const entry of diskSlugs) {
    const entryPath = path.join(projectsDir, entry);
    if (!fs.statSync(entryPath).isDirectory()) continue;

    if (!projects.find((p) => p.slug === entry)) {
      add("info", `Orphan folder (not in projects.ts): projects/${entry}/`);
    }
  }

  for (const { slug, galleryFiles } of projects) {
    const projectDir = path.join(projectsDir, slug);
    const projectRelative = `projects/${slug}`;

    if (!fs.existsSync(projectDir)) {
      add("warn", `Missing project folder: public/images/${projectRelative}/`);
    } else if (isEmptyGitkeepFolder(projectDir)) {
      add("info", `Empty placeholder folder: public/images/${projectRelative}/ (.gitkeep only)`);
    }

    for (const file of STANDARD_PROJECT_FILES) {
      const filePath = path.join(projectDir, file);
      const relativePath = `/images/${projectRelative}/${file}`;
      const kind = classifyProjectFile(file);

      if (!checkFile(filePath, relativePath, kind)) {
        add("warn", `Missing ${slug}: ${file}`);
      } else {
        fileRecords.push({ relativePath, size: fileSize(filePath) });
      }
    }

    for (const file of OPTIONAL_PROJECT_FILES) {
      const filePath = path.join(projectDir, file);
      const relativePath = `/images/${projectRelative}/${file}`;
      if (fs.existsSync(filePath)) {
        checkFile(filePath, relativePath, "video");
        fileRecords.push({ relativePath, size: fileSize(filePath) });
      }
    }

    const referencedGallery = new Set(galleryFiles);
    for (const file of galleryFiles) {
      const filePath = path.join(projectDir, file);
      const relativePath = `/images/${projectRelative}/${file}`;

      if (!checkFile(filePath, relativePath, "gallery")) {
        add("warn", `Missing gallery (referenced in projects.ts): ${slug}/${file}`);
      } else {
        fileRecords.push({ relativePath, size: fileSize(filePath) });
      }
    }

    if (fs.existsSync(projectDir)) {
      const onDisk = listDirSafe(projectDir) ?? [];
      for (const name of onDisk) {
        if (name === ".gitkeep" || name === ".DS_Store") continue;
        const kind = classifyProjectFile(name);
        if (kind === "other") {
          add(
            "warn",
            `Unexpected filename in ${slug}/: ${name} — use cover.jpg, hero.jpg, gallery-NN.jpg, or hero.mp4`,
          );
        }
        if (kind === "gallery" && !referencedGallery.has(name)) {
          add("info", `Unreferenced gallery file (not in projects.ts): ${slug}/${name}`);
        }
      }
    }
  }

  findDuplicateSizes(fileRecords);

  const totalExpected =
    1 +
    projects.length * STANDARD_PROJECT_FILES.length +
    projects.reduce((n, p) => n + p.galleryFiles.length, 0);
  const present = fileRecords.length;

  add(
    "info",
    `Coverage: ${present} / ${totalExpected} required assets on disk (${projects.length} projects)`,
  );

  if (present === 0) {
    add(
      "info",
      "All images are using gradient fallbacks — site is safe. Add files per ASSET_GUIDE.md when ready.",
    );
  }

  printManifest(projects);
  printReport();

  const hasErrors = issues.error.length > 0;
  const hasWarnings = issues.warn.length > 0;

  if (strict && (hasErrors || hasWarnings)) {
    process.exit(1);
  }

  process.exit(hasErrors && strict ? 1 : 0);
}

function printReport() {
  console.log("── Validation report ──\n");

  if (issues.error.length === 0 && issues.warn.length === 0 && issues.info.length === 0) {
    console.log("✓ All checks passed.\n");
    return;
  }

  const sections = [
    ["Errors", issues.error, "✖"],
    ["Warnings", issues.warn, "⚠"],
    ["Info", issues.info, "·"],
  ];

  for (const [title, items, icon] of sections) {
    if (items.length === 0) continue;
    console.log(`${title}:`);
    for (const item of items) {
      console.log(`  ${icon} ${item}`);
    }
    console.log("");
  }

  console.log("Docs: ASSET_GUIDE.md · REAL_PROJECT_CHECKLIST.md");
  console.log("Run with --strict to exit non-zero on warnings.\n");
}

main();
