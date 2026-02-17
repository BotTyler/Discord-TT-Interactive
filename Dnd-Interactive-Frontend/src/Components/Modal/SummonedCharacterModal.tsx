import { ChangeEvent, useRef, useState } from "react";
import { NewLoadImage } from "../NewLoadImage/NewLoadImage";
import Modal from "./Modal";
import { MARKER_SIZE_CATEGORIES } from "../../shared/MarkerOptions";

/**
 * Component responsible for handling any edits needing to be done on an enemy player.
 * This component utilizes the Modal component and will send the data to the server when completed.
 */
export default function EditCharacterModal(
  {
    callback,
    title,
    name,
    avatarUri,
    size_category
  }:
    {
      name: string;
      title: string,
      avatarUri?: string;
      size_category?: MARKER_SIZE_CATEGORIES;
      callback: (data: { name: string; size_category: MARKER_SIZE_CATEGORIES; avatarUri: string; } | undefined) => void
    }) {

  const [_name, setName] = useState<string>(name);
  const [_sizeCategory, setSizeCategory] = useState<MARKER_SIZE_CATEGORIES>(size_category ?? "MEDIUM");
  const [_defaultAvatar, setAvatar] = useState<string | null>(avatarUri ?? null);

  const newloadImageRef = useRef<any>(null);

  const handleNameChange = (name: string) => {
    setName(name);
  };

  const uploadBody = (
    <div className="container-fluid">
      <NewLoadImage
        startingImage={_defaultAvatar !== null ? `/colyseus/getImage/${_defaultAvatar}` : undefined}
        ref={newloadImageRef} />
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
        {/* <input */}
        {/*   className="form-control" */}
        {/*   type="number" */}
        {/*   id="enemySize" */}
        {/*   value={_size} */}
        {/*   onChange={(e: ChangeEvent<HTMLInputElement>) => { */}
        {/*     handleSizeChange(+e.currentTarget.value); */}
        {/*   }} */}
        {/* /> */}

        <div className="btn-group" role="group" aria-label="Radio Button Size Selector">
          <input
            type="radio"
            className="btn-check"
            name="SizeSelectorRadio"
            id="TinySelectorRadio"
            onChange={() => { setSizeCategory("TINY") }}
            checked={_sizeCategory === "TINY"}
          />
          <label className="btn btn-outline-primary" htmlFor="TinySelectorRadio">Tiny</label>

          <input
            type="radio"
            className="btn-check"
            name="SizeSelectorRadio"
            id="SmallSelectorRadio"
            onChange={() => { setSizeCategory("SMALL") }}
            checked={_sizeCategory === "SMALL"}
          />
          <label className="btn btn-outline-primary" htmlFor="SmallSelectorRadio">Small</label>

          <input
            type="radio"
            className="btn-check"
            name="SizeSelectorRadio"
            id="MediumSelectorRadio"
            onChange={() => { setSizeCategory("MEDIUM") }}
            checked={_sizeCategory === "MEDIUM"}
          />
          <label className="btn btn-outline-primary" htmlFor="MediumSelectorRadio">Medium</label>

          <input
            type="radio"
            className="btn-check"
            name="SizeSelectorRadio"
            id="LargeSelectorRadio"
            onChange={() => { setSizeCategory("LARGE") }}
            checked={_sizeCategory === "LARGE"}
          />
          <label className="btn btn-outline-primary" htmlFor="LargeSelectorRadio">Large</label>

          <input
            type="radio"
            className="btn-check"
            name="SizeSelectorRadio"
            id="HugeSelectorRadio"
            onChange={() => { setSizeCategory("HUGE") }}
            checked={_sizeCategory === "HUGE"}
          />
          <label className="btn btn-outline-primary" htmlFor="HugeSelectorRadio">Huge</label>

          <input
            type="radio"
            className="btn-check"
            name="SizeSelectorRadio"
            id="GargantuanSelectorRadio"
            onChange={() => { setSizeCategory("GARGANTUAN") }}
            checked={_sizeCategory === "GARGANTUAN"}
          />
          <label className="btn btn-outline-primary" htmlFor="GargantuanSelectorRadio">Gargantuan</label>
        </div>
      </div>
    </div >
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
        callback({ name: _name, size_category: _sizeCategory, avatarUri: imageSrc });
      }}
    />
  );
}
