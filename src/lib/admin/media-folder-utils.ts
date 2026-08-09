export type FolderNode = {
  path: string;
  name: string;
  depth: number;
  count: number;
};

/**
 * Extracts a deduplicated, sorted list of all folder paths (including subfolders) from media assets.
 */
export function getDynamicFolders(assets: { folder?: string | null }[], customFolders: string[] = []): string[] {
  const set = new Set<string>(["general", "events", "posts", "people", "brand", ...customFolders]);

  assets.forEach((asset) => {
    if (asset.folder) {
      const trimmed = asset.folder.trim().toLowerCase();
      if (!trimmed) return;
      
      // Add path and all parent paths for subfolder support (e.g., "events/2026/workshops")
      const segments = trimmed.split("/");
      let currentPath = "";
      segments.forEach((seg) => {
        if (!seg) return;
        currentPath = currentPath ? `${currentPath}/${seg}` : seg;
        set.add(currentPath);
      });
    }
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Formats folder paths into clean display labels (e.g., "events/2026" -> "events / 2026").
 */
export function formatFolderLabel(folderPath: string): string {
  if (!folderPath || folderPath === "all") return "All Assets";
  return folderPath
    .split("/")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" / ");
}

/**
 * Checks if an asset's folder matches the active folder filter (supporting subfolders).
 * E.g., if active filter is "events", matches "events", "events/2026", and "events/workshops".
 */
export function isAssetInFolder(assetFolder: string | null | undefined, filterFolder: string): boolean {
  if (filterFolder === "all") return true;
  const folder = (assetFolder || "general").trim().toLowerCase();
  const filter = filterFolder.trim().toLowerCase();
  return folder === filter || folder.startsWith(filter + "/");
}
