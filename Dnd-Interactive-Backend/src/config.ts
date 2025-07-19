import config from "@colyseus/tools";
import { StateHandlerRoom } from "./rooms/StateHandlerRoom";
// import multer from "multer";
// import * as Minio from "minio";
import { playground } from "@colyseus/playground";
import { monitor } from "@colyseus/monitor";
import { JWT } from "@colyseus/auth";
import { WebSocketTransport } from "@colyseus/ws-transport";
import MinioClient from "./Minio/MinioClient";
import multer from "multer";
import sharp from "sharp";
import ytdl from "@distube/ytdl-core";
import { ImageCatalogDAO, ImageCatalogDB } from "./Database/Tables/ImageCatalogDB";
import { AudioCatalogDAO, AudioCatalogDB } from "./Database/Tables/AudioCatalogDB";
import { GAME_NAME } from "dnd-interactive-shared";

export default config({
  options: {
    // transport: new uWebSocketsTransport(),
    // driver: new RedisDriver(),
    // presence: new RedisPresence(),
  },
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer
      .define(GAME_NAME, StateHandlerRoom)
      // filterBy allows us to call joinOrCreate and then hold one game per channel
      // https://discuss.colyseus.io/topic/345/is-it-possible-to-run-joinorcreatebyid/3
      .filterBy(["channelId"]);
  },
  initializeTransport: function (opts) {
    return new WebSocketTransport({
      ...opts,
      maxPayload: 1024 * 1000, // TODO: too lazy to change this right now. This needs to limit the amount of data to the client to prevent crashes.
    });
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     */

    //setup the minio storage
    const storage = multer.memoryStorage(); // Store files in memory
    const upload = multer({ storage: storage });

    // const minioClient = new Minio.Client({
    //   endPoint: process.env.MINIO_ENDPOINT!,
    //   port: +process.env.MINIO_PORT!,
    //   useSSL: false,
    //   accessKey: process.env.MINIO_ACCESS_KEY!,
    //   secretKey: process.env.MINIO_SECRET_KEY!,
    // });

    // custom express methods

    // If you don't want people accessing your server stats, comment this line.
    //router.use("/colyseus", monitor(server as Partial<MonitorOptions>));

    // Fetch token from developer portal and return to the embedded app
    app.post("/token", async (req, res) => {
      try {
        const response = await fetch(`https://discord.com/api/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.VITE_CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: req.body.code,
          }),
        });

        const { access_token } = (await response.json()) as {
          access_token: string;
        };

        //
        // Retrieve user data from Discord API
        // https://discord.com/developers/docs/resources/user#user-object
        //
        const profile = await (
          await fetch(`https://discord.com/api/users/@me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${access_token}`,
            },
          })
        ).json();

        // TODO: store user profile into a database
        const user = profile;

        res.send({
          access_token: access_token, // Discord Access Token
          token: await JWT.sign(user), // Colyseus JWT token
          user: user, // User data
        });
      } catch (e: any) {
        console.error(e);
        res.status(400).send({ error: e.message });
      }
    });

    // app.get("/getImage/:bucket/:imageName", async (req, res) => {

    // TODO: All endpoints need to use JWT authentication to secure it from outside use. Only members inside of colyseus rooms should access this endpoint
    app.get("/getImage/:userId/images/:imageName", async (req, res) => {
      try {
        const fileName = req.params.imageName;
        const userId = req.params.userId;
        const bucket = process.env.MINIO_BUCKET!;

        if (!fileName) return res.status(400).json({ error: "File name is required" });
        if (!MinioClient.getInstance().bucketExists(bucket))
          return res.status(400).json({ error: "BUCKET DOES NOT EXIST" });

        // call out to minio to grab the image
        const stream = await MinioClient.getInstance().getObject(
          `${bucket}`,
          `${userId}/images/${fileName}`,
        );
        stream.pipe(res);
      } catch (e: any) {
        console.error(e);
        res.destroy(e);
      }
    });
    // app.post("/uploadImage/:bucket", upload.single("image"), async (req, res) => {
    app.post("/uploadImage/:userId", upload.single("image"), async (req, res) => {
      // TODO: Add some authentication and limits to prevent image spam.

      try {
        const bucket = process.env.MINIO_BUCKET!;
        const userId = req.params.userId;
        if (!req.file) return res.status(400).send("No file uploaded.");
        if (!(await MinioClient.getInstance().bucketExists(bucket)))
          return res.status(400).json({ error: "BUCKET DOES NOT EXIST" });

        const file = req.file;
        const fileName = `${userId}/images/${Date.now()}-${file.originalname}`;
        const fileStream = file.buffer;
        const { width, height } = await sharp(fileStream).metadata();

        await ImageCatalogDB.getInstance().create(
          new ImageCatalogDAO(userId, fileName, width!, height!),
        );
        await MinioClient.getInstance().putObject(bucket, `${fileName}`, fileStream, file.size);

        const response = {
          fileName: fileName,
        };
        res.status(200).send(response);
      } catch (e: any) {
        console.error(e);
        res.destroy(e);
      }
    });

    app.get("/getAudio/:userId/audio/:audioName", async (req, res) => {
      try {
        const audioName = req.params.audioName;
        const userId = req.params.userId;
        const bucket = process.env.MINIO_BUCKET!;
        if (!audioName) return res.status(400).json({ error: "File name is required" });
        if (!MinioClient.getInstance().bucketExists(bucket))
          return res.status(400).json({ error: "BUCKET DOES NOT EXIST" });

        // call out to minio to grab the image
        const stream = await MinioClient.getInstance().getObject(
          `${bucket}`,
          `${userId}/audio/${audioName}`,
        );
        stream.pipe(res);
      } catch (e) {
        console.error(`Something went wrong with getAudio`);
        console.error(e);
      }
    });

    app.post("/uploadAudio/:userId", upload.single("audio"), async (req, res) => {
      const bucket = process.env.MINIO_BUCKET!;
      const userId = req.params.userId;
      if (!req.file) return res.status(400).send("No file uploaded");
      if (!(await MinioClient.getInstance().bucketExists(bucket)))
        return res.status(400).json({ error: "BUCKET DOES NOT EXIST" });

      const file = req.file;
      const fileName = `${userId}/audio/${Date.now()}-${file.originalname}`;
      const fileStream = file.buffer;

      await AudioCatalogDB.getInstance().create(new AudioCatalogDAO(userId, fileName));
      await MinioClient.getInstance().putObject(bucket, `${fileName}`, fileStream, file.size);
      const response = {
        fileName: fileName,
      };
      res.status(200).send(response);
    });

    app.post("/uploadAudio/:userId/youtube", async (req, res) => {
      try {
        const userId = req.params.userId;
        const youtubeUrl = req.body.link;
        const bucket = process.env.MINIO_BUCKET!;

        if (!(await MinioClient.getInstance().bucketExists(bucket)))
          return res.status(400).json({ error: "BUCKET DOES NOT EXIST" });
        if (youtubeUrl === undefined) return res.status(400).json({ error: "No URL provided." });

        // get basic youtube information
        const videoInfo = await ytdl.getBasicInfo(youtubeUrl);
        const videoName = `${userId}/audio/${Date.now()}-${videoInfo.videoDetails.title}.mp3`;
        const youtubeStream = ytdl(youtubeUrl, { filter: "audioonly", quality: "highestaudio" });

        await AudioCatalogDB.getInstance().create(new AudioCatalogDAO(userId, videoName));
        await MinioClient.getInstance().putObject(bucket, videoName, youtubeStream);

        const response = {
          fileName: videoName,
        };
        res.status(200).send(response);
      } catch (e) {
        console.error(e);
        res.status(400).json({ error: "Something went wrong" });
      }
    });
    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    // if (process.env.NODE_ENV !== "production") {
    //   app.use("/", playground);
    // }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    //app.use("/colyseus", monitor());

    //
    // See more about the Authentication Module:
    // https://docs.colyseus.io/authentication/
    //
    // app.use(auth.prefix, auth.routes())
    //
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
