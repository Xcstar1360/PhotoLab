import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export function resolveUploadPath(inputPath: string): string {
  // Strip leading /uploads/ prefix (URL-format) and any .. segments
  const normalized = inputPath
    .replace(/^\/?uploads[\/\\]/, "")
    .replace(/^[\/\\]+/, "");

  const resolved = path.resolve(UPLOADS_DIR, normalized);

  if (!resolved.startsWith(UPLOADS_DIR + path.sep) && resolved !== UPLOADS_DIR) {
    throw new Error("Path traversal detected");
  }

  return resolved;
}
