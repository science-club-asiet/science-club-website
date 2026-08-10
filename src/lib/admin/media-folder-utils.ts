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
  const set = new Set<string>(["general", "events", "posts", "people", "brand", "forms", "applications", ...customFolders]);

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
 * Checks if an asset's folder matches the active folder filter.
 * - includeSubfolders = true: matches exact folder + all nested subfolders (recursive)
 * - includeSubfolders = false: matches ONLY exact folder
 */
export function isAssetInFolder(
  assetFolder: string | null | undefined,
  filterFolder: string,
  includeSubfolders: boolean = false
): boolean {
  if (filterFolder === "all") return true;
  const folder = (assetFolder || "general").trim().toLowerCase();
  const filter = filterFolder.trim().toLowerCase();

  if (includeSubfolders) {
    return folder === filter || folder.startsWith(filter + "/");
  }
  return folder === filter;
}

/**
 * Gets direct child subfolders for a given folder path.
 */
export function getDirectSubfolders(allFolders: string[], currentFolder: string): string[] {
  if (!currentFolder || currentFolder === "all") {
    // For root, return root level folders (e.g., "events", "posts", etc.)
    const set = new Set<string>();
    allFolders.forEach((f) => {
      const root = f.split("/")[0];
      if (root) set.add(root);
    });
    return Array.from(set).sort();
  }

  const prefix = currentFolder.trim().toLowerCase() + "/";
  const subSet = new Set<string>();

  allFolders.forEach((f) => {
    const lower = f.trim().toLowerCase();
    if (lower.startsWith(prefix) && lower !== currentFolder.toLowerCase()) {
      const relative = lower.slice(prefix.length);
      const firstSeg = relative.split("/")[0];
      if (firstSeg) {
        subSet.add(`${currentFolder}/${firstSeg}`);
      }
    }
  });

  return Array.from(subSet).sort();
}
