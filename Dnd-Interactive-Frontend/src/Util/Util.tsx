export function formatDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export function removeColyseusPath(fullSrcUrl: string): string {
  const regex = /\/colyseus\/getImage\/(.*)/gm
  const match = regex.exec(fullSrcUrl);
  return match ? match[1] : fullSrcUrl;
}

export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}
