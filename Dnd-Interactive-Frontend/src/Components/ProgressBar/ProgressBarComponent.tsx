import { clamp } from "../../Util/Util";

export function ProgressDiv({ current, max }: { current: number; max: number; }) {
  type RGB = { r: number; g: number; b: number };

  function hsvToRgb(h: number, s: number, v: number): RGB {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 80) {
      r = c; g = x; b = 0;
    } else if (h >= 80 && h <= 120) {
      r = x; g = c; b = 0;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  function numberToColor(): string {
    const clamped = Math.max(0, Math.min(1, current / max));
    const hue = 120 * clamped;

    const rgb: RGB = hsvToRgb(hue, 1, 1);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  }

  return (
    <div className="w-100 h-100" style={{ backgroundColor: 'white' }}>
      <div className="h-100 p-0" style={{ background: numberToColor(), width: `${clamp(current * 100 / max, 0, 100)}%`, transition: "width 0.3s ease" }}>
      </div>
    </div>
  )
}
