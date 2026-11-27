import { Client } from "colyseus";
import { ImageCatalogDAO, ImageCatalogDB } from "../../Database/Tables/ImageCatalogDB";
import { LoadImage } from "../../shared/LoadDataInterfaces";
import { Player } from "../../shared/Player";
import { StateHandlerRoom } from "../StateHandlerRoom";
import { logger } from "../../logger/logger";

export function RegisterAssetStateHandler(room: StateHandlerRoom): void {
  // A method to gather all images submitted by the user that is stored in the minio database.
  // room.method will only return the name of the image and should be used in junction with the getImage method to download.
  room.onMessage("getImageList", async (client: Client, _data: any) => {
    logger.info({ client: client }, "Gathering image list");
    const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
    if (player === null) {
      logger.warn({ client: client }, "Client is not found within this room");
      return;
    }

    const imageCatalog: ImageCatalogDAO[] =
      await ImageCatalogDB.getInstance().selectAllImagesByPlayerId(player.userId);
    const mappedImages: LoadImage[] = imageCatalog.map((image: ImageCatalogDAO): LoadImage => {
      return { name: image.name, path: image.image_location };
    });
    client.send("getImageListResult", mappedImages);
  });
}
