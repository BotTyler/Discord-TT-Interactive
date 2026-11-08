export function formatDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export function getFileNameFromMinioString(minioFileName: string): string {
  try {
    const regex = /\d+\/(audio|images)\/\d+-(.*)\..*/gm;
    return [...minioFileName.matchAll(regex)][0][2]; // there only should be one match and we want the second element at that match.
    // 0 -> first match
    // 2 -> second group in that match (0=initial string) (1=either audio or images) (2=name of the file)
  } catch (_err: any) {
    console.error("Found the broken image this is due to the image name changes. Definietly part of that damn fucking list.");
    return "DAMN BROKEN IMAGE NAME";
  }
}

export function removeColyseusPath(fullSrcUrl: string): string {
  const regex = /\/colyseus\/getImage\/(.*)/gm
  const match = regex.exec(fullSrcUrl);
  return match ? match[1] : fullSrcUrl;
}

export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}
