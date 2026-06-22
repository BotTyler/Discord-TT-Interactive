import config from "@colyseus/tools";
import { StateHandlerRoom } from "./rooms/StateHandlerRoom";
import { JWT } from "@colyseus/auth";
import { WebSocketTransport } from "@colyseus/ws-transport";
import MinioClient from "./Minio/MinioClient";
import multer from "multer";
import sharp from "sharp";
import { ImageCatalogDAO, ImageCatalogDB } from "./Database/Tables/ImageCatalogDB";
import { GAME_NAME } from "./shared/Constants";
import {
  AuthenticationDetail,
  IDiscordGuildsMembersResource,
  IDiscordUserResource,
  UserDetail,
} from "./shared/UserDetails";
import { sanitize } from "./Util/Utils";
import { getUserAvatarUrl, getUserDisplayName } from "./Util/DiscordAuthenticationUtils";

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

    // Fetch token from developer portal and return to the embedded app
    app.post("/token", async (req, res) => {
      const body: any = req.body();
      if (body == null || body.guildId == null || body.code == null) res.status(400).send(null);
      const guildId: string = sanitize(body.guildId);
      const code: string = sanitize(body.code);

      try {
        /*
          ======================================
          Get oauth2 token for discord
          ======================================
        */
        const access_token: string = await fetch(`https://discord.com/api/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.VITE_CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
          }),
        })
          .then((value: Response): Promise<{ access_token: string }> => value.json())
          .then((json: { access_token: string }): string => json.access_token);

        /*
        ====================================================================
        Retrieve user data from Discord API
        https://discord.com/developers/docs/resources/user#user-object
        ====================================================================
        */
        const discordUserProfile: IDiscordUserResource = await (
          await fetch(`https://discord.com/api/users/@me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${access_token}`,
            },
          })
        )
          .json()
          .then((value: any): IDiscordUserResource => {
            return value as IDiscordUserResource;
          });

        /*
        ====================================================================
        Retrieve current guild data from Discord API
        ====================================================================
        */
        const discordGuild: IDiscordGuildsMembersResource = await fetch(
          `https://discord.com/api/users/@me/guilds/${guildId}/member`,
          {
            method: "get",
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )
          .then(async (j) => j.json())
          .catch((e) => {
            console.log(e);
            return null;
          });

        /*
          =================================================================
          Construct User Details
          =================================================================
        */
        const userDeatil: UserDetail = {
          id: discordUserProfile.id,
          name: getUserDisplayName(discordGuild, discordUserProfile),
          avartar_uri: getUserAvatarUrl(discordGuild, discordUserProfile),
          discriminator: discordUserProfile.discriminator,
        };

        const authDetail: AuthenticationDetail = {
          user: userDeatil,
          jwt: await JWT.sign(userDeatil),
          access_token: access_token,
        };
        res.send(authDetail);
      } catch (e: any) {
        console.error(e);
        res.status(400).send(null);
      }
    });

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
    app.post("/uploadImage/:userId", upload.single("image"), async (req, res) => {
      // TODO: Add some authentication and limits to prevent image spam.

      try {
        const bucket = process.env.MINIO_BUCKET!;
        const userId: string = req.params.userId[0];
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
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
