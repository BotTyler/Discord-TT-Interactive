import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

export const s3Storage: DndS3Client = createS3Client();

function createS3Client(): DndS3Client {
  const endpoint: string | null = process.env.RUSTFS_ENDPOINT ?? null;
  const publicEndpoint: string | null = process.env.RUSTFS_PUBLIC_ENDPOINT ?? null;
  const accessKey: string | null = process.env.RUSTFS_ACCESS_KEY ?? null;
  const secretKey: string | null = process.env.RUSTFS_SECRET_KEY ?? null;
  const bucket: string | null = process.env.RUSTFS_BUCKET ?? null;
  const region: string = process.env.RUSTFS_REGION ?? "us-east-1";

  if (
    endpoint === null ||
    publicEndpoint === null ||
    accessKey === null ||
    secretKey === null ||
    bucket === null
  ) {
    throw new Error("RUSTFS properties are missing");
  }
  return new DndS3Client({
    accessKey: accessKey,
    secretKey: secretKey,
    endpoint: endpoint,
    bucket: bucket,
    region: region,
    publicEndpoint: publicEndpoint,
  });
}

interface S3ServiceConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  publicEndpoint: string;
}

interface ObjectInfo {
  key: string;
  size: number;
  lastModified?: Date;
  contentType?: string;
  etag?: string;
}

class DndS3Client {
  private readonly client: S3Client;
  private readonly signingClient: S3Client;
  private readonly bucket: string;

  constructor(config: S3ServiceConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

    this.signingClient = new S3Client({
      endpoint: config.publicEndpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
    this.bucket = config.bucket;
  }

  // This function will throw errors if the bucket cannot be found or reached.
  // It is not advised to create that bucket here as configurations on the host will need to be taken into consideration.
  // The preference is to fail-fast and fix manually.
  public async ensureBucket(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
  }

  // ---------- Upload ----------

  /** Upload a whole buffer in one request. Good for small files. */
  async upload(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
      }),
    );
  }

  /** Upload a stream using multipart. Good for large files. */
  async uploadStream(
    key: string,
    stream: Readable,
    contentType?: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
        Metadata: metadata,
      },
    });
    await upload.done();
  }

  // ---------- Download ----------

  /** Returns a readable stream, or null if the object doesn't exist. */
  async getStream(
    key: string,
  ): Promise<{ stream: Readable; contentType?: string; contentLength?: number } | null> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return {
        stream: res.Body as Readable,
        contentType: res.ContentType,
        contentLength: res.ContentLength,
      };
    } catch (err) {
      if (this.isNotFound(err)) return null;
      throw err;
    }
  }

  // ---------- Metadata ----------

  async exists(key: string): Promise<boolean> {
    return (await this.head(key)) !== null;
  }

  /** Returns object info without downloading it, or null if missing. */
  async head(key: string): Promise<ObjectInfo | null> {
    try {
      const res = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return {
        key,
        size: res.ContentLength ?? 0,
        lastModified: res.LastModified,
        contentType: res.ContentType,
        etag: res.ETag,
      };
    } catch (err) {
      if (this.isNotFound(err)) return null;
      throw err;
    }
  }

  /** Lists objects under a prefix. Handles pagination for you. */
  async list(prefix = "", maxKeys = 1000): Promise<ObjectInfo[]> {
    const results: ObjectInfo[] = [];
    let token: string | undefined;

    do {
      const res = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: token,
          MaxKeys: Math.min(1000, maxKeys - results.length),
        }),
      );
      for (const obj of res.Contents ?? []) {
        results.push({
          key: obj.Key!,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified,
          etag: obj.ETag,
        });
      }
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token && results.length < maxKeys);

    return results;
  }

  // ---------- Modify ----------

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /** Deletes many keys, batching in groups of 1000 (the S3 limit). */
  async deleteMany(keys: string[]): Promise<void> {
    for (let i = 0; i < keys.length; i += 1000) {
      const batch = keys.slice(i, i + 1000);
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      );
    }
  }

  async deletePrefix(prefix: string): Promise<void> {
    const objects = await this.list(prefix, Number.MAX_SAFE_INTEGER);
    await this.deleteMany(objects.map((o) => o.key));
  }

  // ---------- Presigned URLs ----------

  getDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      this.signingClient,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  getUploadUrl(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
    return getSignedUrl(
      this.signingClient,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  // ---------- Internals ----------

  private isNotFound(err: unknown): boolean {
    const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
    return (
      e?.name === "NoSuchKey" ||
      e?.name === "NotFound" ||
      e?.name === "NoSuchBucket" ||
      e?.$metadata?.httpStatusCode === 404
    );
  }
}
