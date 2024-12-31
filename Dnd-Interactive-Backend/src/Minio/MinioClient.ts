import * as Minio from "minio";
export default class MinioClient {
  public static instance: Minio.Client;
  public static getInstance(): Minio.Client {
    if (this.instance === undefined) {
      this.instance = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT!,
        port: +process.env.MINIO_PORT!,
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY!,
        secretKey: process.env.MINIO_SECRET_KEY!,
      });
    }

    return this.instance;
  }

  constructor() {
    console.warn("This class should not be initialized manually, please use the MinioClient.getInstance() method.");
  }
}
