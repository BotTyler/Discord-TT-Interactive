import { Room } from "colyseus";
import { ImageCatalogDAO, ImageCatalogDB } from "../../Database/Tables/ImageCatalogDB";
import { LoadImage } from "../../shared/LoadDataInterfaces";
import { Player } from "../../shared/Player";
import { State } from "../../shared/State";

export function RegisterAssetStateHandler(room: Room<State>): void {
  // A method to gather all images submitted by the user that is stored in the minio database.
  // room.method will only return the name of the image and should be used in junction with the getImage method to download.
  room.onMessage("getImageList", async (client, _data) => {
    const player: Player | null = room.state.getPlayerBySessionId(client.sessionId);
    if (player === null) return;

    const imageCatalog: ImageCatalogDAO[] =
      await ImageCatalogDB.getInstance().selectAllImagesByPlayerId(player.userId);
    const mappedImages: LoadImage[] = imageCatalog.map((image: ImageCatalogDAO): LoadImage => {
      return { image_name: image.image_name };
    });

    client.send("getImageListResult", mappedImages);
  });
}
