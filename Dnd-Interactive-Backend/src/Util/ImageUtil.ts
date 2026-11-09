import sharp, { Metadata } from "sharp";

export class ImageRejectedError extends Error {
  constructor(
    public readonly status: 400 | 413 | 415,
    message: string,
  ) {
    super(message);
  }
}

const ALLOWED_FORMATS = new Set(["png", "jpeg", "webp", "gif"]);
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024; // 10 MB after re-encoding
const MAX_DIMENSION = 2048; // max width/height of each frame
const MAX_FRAMES = 100; // animation length cap
const MAX_TOTAL_PIXELS = 4096 * 4096; // frames x width x height

export async function SanitizeImage(
  input: Buffer,
): Promise<{ buffer: Buffer; metadata: Metadata }> {
  try {
    // Read header info first, without decoding any pixels
    const meta = await sharp(input).metadata();

    // Check to make sure the sharp parsing header matches the file we expect.
    if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
      throw new ImageRejectedError(415, "Unsupported file type");
    }

    // props to support animated images (GIFs)
    const frames = meta.pages ?? 1;
    const frameWidth = meta.width ?? 0;
    const frameHeight = meta.pageHeight ?? meta.height ?? 0;

    if (frames > MAX_FRAMES) {
      throw new ImageRejectedError(413, `Too many frames (max ${MAX_FRAMES})`);
    }
    if (frameWidth * frameHeight * frames > MAX_TOTAL_PIXELS) {
      throw new ImageRejectedError(413, "Image is too large");
    }

    const animated = frames > 1;

    // Decode for real. Anything that isn't pixel data is discarded on re-encode.
    let pipeline = sharp(input, {
      animated,
      pages: animated ? frames : 1,
      limitInputPixels: MAX_TOTAL_PIXELS,
    });

    if (!animated) {
      pipeline = pipeline.rotate(); // apply EXIF orientation for stills
    }

    const output: Buffer = await pipeline
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    if (output.length > MAX_OUTPUT_BYTES) {
      throw new ImageRejectedError(413, "Processed image is too large");
    }

    return { buffer: output, metadata: meta };
  } catch (err) {
    throw new ImageRejectedError(400, `Image sanitization failed: ${err}`);
  }
}
