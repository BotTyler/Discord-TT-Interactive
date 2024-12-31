import { useRef, useState, ChangeEvent } from "react";
import Modal from "../../Modal/Modal";
import { useAuthenticatedContext } from "../../../ContextProvider/useAuthenticatedContext";
import { NewLoadImage } from "../../NewLoadImage/NewLoadImage";

/**
 * Component responsible for handling any edits needing to be done on an enemy player.
 * This component utilizes the Modal component and will send the data to the server when completed.
 */
export default function EditEnemyModal({ callback, enemyname, enemysize, enemyavatarUri, totalHp }: { enemyname: string; enemysize: number; enemyavatarUri: string; totalHp: number; callback: (data: { name: string; size: number; avatarUri: string; hp: number } | undefined) => void }) {
  const [name, setName] = useState<string>(enemyname);
  const [size, setSize] = useState<number>(enemysize);
  const [THP, setTotalHp] = useState<number>(totalHp);

  const newloadImageRef = useRef<any>(null);

  const handleEnemySizeChange = (size: number) => {
    setSize(size);
  };
  const handleEnemyNameChange = (name: string) => {
    setName(name);
  };

  const uploadBody = (
    <div className="container-fluid">
      <NewLoadImage startingImageSrc={enemyavatarUri} imgSrcPrefix={"/colyseus/getImage/"} ref={newloadImageRef} />
      <div className="mb-3">
        <label htmlFor="enemyName" className="form-label">
          Name
        </label>
        <input
          className="form-control"
          type="text"
          id="enemyName"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleEnemyNameChange(e.currentTarget.value);
          }}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="enemySize" className="form-label">
          Size
        </label>
        <input
          className="form-control"
          type="number"
          id="enemySize"
          value={size}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleEnemySizeChange(+e.currentTarget.value);
          }}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="enemyTotalHp" className="form-label">
          Total Hp
        </label>
        <input
          className="form-control"
          type="number"
          id="enemyTotalHp"
          value={THP}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setTotalHp(+e.currentTarget.value);
          }}
        />
      </div>
    </div>
  );

  return (
    <Modal
      Title="Enemy"
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
        callback({ name: name, size: size, avatarUri: imageSrc, hp: THP });
      }}
    />
  );
}
