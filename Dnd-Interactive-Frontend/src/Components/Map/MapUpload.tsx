import React, { useRef } from "react";
import Modal from "../Modal/Modal";
import { NewLoadImage } from "../NewLoadImage/NewLoadImage";

export interface ClientMapDataInterface {
  mapBase64: string;
  iconHeight: number;
  name: string;
}

/**
 * Component that utilizes the Modal component to display a map upload to the user. This class will also send that data to the server to be syncronized between all clients connected.
 */
export default function MapUpload({ callback }: { callback: (data: ClientMapDataInterface | undefined) => void }) {
  // const [avatarUri, setAvatarUri] = React.useState<string>(enemyavatarUri);
  const [size, setSize] = React.useState<number>(25);
  const [name, setName] = React.useState<string>("");

  const newloadImageRef = useRef<any>(null);

  const handlePlayerSizeChange = React.useCallback((size: number) => {
    setSize(size);
  }, []);

  const uploadBody = (
    <div className="container-fluid">
      <NewLoadImage ref={newloadImageRef} />
      <div className="mb-3">
        <label htmlFor="CampaignNameInput" className="form-label">
          Campaign Name
        </label>
        <input
          className="form-control"
          type="text"
          id="CampaignNameInput"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
          }}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="enemySize" className="form-label">
          Icon Height
        </label>
        <input
          className="form-control"
          type="number"
          id="enemySize"
          value={size}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handlePlayerSizeChange(+e.currentTarget.value);
          }}
        />
      </div>
    </div>
  );

  return (
    <Modal
      Title="Map Upload"
      children={uploadBody}
      closeCallback={() => {
        // setFile(undefined);
        // setPlayerHeight(25);
        callback(undefined);
      }}
      submitCallback={async () => {
        if (!newloadImageRef.current) return;
        const imageSrc = await newloadImageRef.current.getMinioFileUrl();
        if (!imageSrc) callback(undefined);
        callback({ mapBase64: imageSrc, iconHeight: size, name: name });
      }}
    />
  );
}
