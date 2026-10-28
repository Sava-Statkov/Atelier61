/** Choosing files for the import: dropped folders, pictures only, titles from file names. */

/** Files dropped onto the page, including the contents of dropped folders. */
export async function filesFromDrop(items: DataTransferItemList): Promise<File[]> {
  const entries = [...items].map((i) => i.webkitGetAsEntry()).filter((e): e is FileSystemEntry => e !== null);
  const files: File[] = [];
  const walk = async (entry: FileSystemEntry): Promise<void> => {
    if (entry.isFile) {
      files.push(await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject)));
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      // readEntries returns at most 100 entries per call.
      for (;;) {
        const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
        if (!batch.length) break;
        for (const child of batch) await walk(child);
      }
    }
  };
  for (const entry of entries) await walk(entry);
  return files;
}

/** Keeps pictures (also formats that will be refused with a reason, such as HEIC) and sorts by name. */
export function picturesOnly(files: File[]): File[] {
  return files
    .filter((f) => f.type.startsWith("image/") || /\.(heic|heif|tiff?)$/i.test(f.name))
    .sort((a, b) => a.name.localeCompare(b.name, "bg", { numeric: true }));
}

/** A title from a file name, unless the name is a camera's ("IMG_2034.jpg" gives none). */
export function titleFromFileName(name: string): string | null {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!base || /^(img|dsc|dscn|dscf|pxl|p|pic|photo|image|scan|screenshot|whatsapp image)[\s-]*[\d\s-]+$/i.test(base)) return null;
  if (/^[\d\s-]+$/.test(base)) return null;
  return base;
}
