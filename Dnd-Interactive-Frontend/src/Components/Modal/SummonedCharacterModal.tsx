import { ChangeEvent, useRef, useState } from "react";
import { NewLoadImage } from "../NewLoadImage/NewLoadImage";
import Modal from "./Modal";
import { useGameState } from "../../ContextProvider/GameStateContext/GameStateProvider";

/**
 * Component responsible for handling any edits needing to be done on an enemy player.
 * This component utilizes the Modal component and will send the data to the server when completed.
 */
export default function EditCharacterModal({ callback, title, name, avatarUri, totalHp, size }: { name: string; title: string, avatarUri: string; totalHp: number; size?: number; callback: (data: { name: string; size: number; avatarUri: string; hp: number } | undefined) => void }) {
  const gamestateContext = useGameState();

  const [_name, setName] = useState<string>(name);
  const [_size, setSize] = useState<number>(size ?? gamestateContext.getIconHeight());
  const [_defaultAvatar, setAvatar] = useState<string>(avatarUri);
  const [_totalHp, setTotalHp] = useState<number>(totalHp);

  const newloadImageRef = useRef<any>(null);

  const handleSizeChange = (size: number) => {
    setSize(size);
  };
  const handleNameChange = (name: string) => {
    setName(name);
  };

  const uploadBody = (
    <div className="container-fluid">
      <NewLoadImage startingImageSrc={_defaultAvatar} imgSrcPrefix={"/colyseus/getImage/"} ref={newloadImageRef} />
      <div className="mb-3">
        <label htmlFor="enemyName" className="form-label">
          Name
        </label>
        <input
          className="form-control"
          type="text"
          id="enemyName"
          value={_name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleNameChange(e.currentTarget.value);
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
          value={_size}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleSizeChange(+e.currentTarget.value);
          }}
        />
      </div>
      {/* Removed for new side panel layout */}
      {/* <div className="mb-3"> */}
      {/*   <label htmlFor="enemyTotalHp" className="form-label"> */}
      {/*     Total Hp */}
      {/*   </label> */}
      {/*   <input */}
      {/*     className="form-control" */}
      {/*     type="number" */}
      {/*     id="enemyTotalHp" */}
      {/*     value={THP} */}
      {/*     onChange={(e: ChangeEvent<HTMLInputElement>) => { */}
      {/*       setTotalHp(+e.currentTarget.value); */}
      {/*     }} */}
      {/*   /> */}
      {/* </div> */}
    </div>
  );

  return (
    <Modal
      Title={title}
      children={uploadBody}
      closeCallback={() => {
        callback(undefined);
      }}
      submitCallback={async () => {
        if (!newloadImageRef.current) return;
        const imageSrc = await newloadImageRef.current.getMinioFileUrl();
        if (!imageSrc) callback(undefined);
        callback({ name: _name, size: _size, avatarUri: imageSrc, hp: _totalHp });
      }}
    />
  );
}
