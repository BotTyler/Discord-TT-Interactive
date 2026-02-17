import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import { getFileNameFromMinioString, removeColyseusPath } from "../../Util/Util";
import { useMessageContext } from "../../ContextProvider/Messages/MessageContextProvider";
import { TOAST_LEVEL } from "../../ContextProvider/Messages/Toast";
import { LoadImage } from "../../shared/LoadDataInterfaces";

// Although the onChange method can be used to get the image url. This will not be linked with pg or minio. When the image should be used, we should use the forward ref method (getMinioFileUrl) to ensure the file is properly placed.
// onChange will provide the full url to get the image within a src tag. But this should not be used for creating or updating players **************************************
export const NewLoadImage = forwardRef(function NewLoadImage({
  onChange,
  showPreview = true,
  startingImage,
}: {
  onChange?: (imageUrl: string) => void
  showPreview?: boolean;
  startingImage?: string;
}, ref: any) {


  const authContext = useAuthenticatedContext();
  const toastContext = useMessageContext();
  const placeholder = "Assets/placeholder.png";

  // This object will hold values that are either loaded from a new file or selected from an existing object.
  // The file will be loaded from an existing object if file is null.
  // If file exist then the file will need to by streamed to MINIO first before usage.
  const [imageFile, setImageFile] = useState<{ file: File | null; imgsrc: string } | null>(null);

  const [presetImage, setPreset] = useState<string | null>(startingImage ?? null);
  const [knownImageList, setKnownImageList] = useState<LoadImage[]>([]);
  const [isLoadActive, setLoadActive] = useState<boolean>(true); // If true the load page should be shown first

  useEffect(() => {
    setPreset(startingImage ?? null);
  }, [startingImage]);


  // Listen to any changes the would require some sort of update.
  // NOTE: This will not be an authoritative source for usage in the app.
  // Please use the getMinioFileUrl method to make sure the data is properly handled.
  // This method should only be used in cases where a component wants to handle the preview of the image.
  useEffect(() => {
    if (!onChange) return;

    if (imageFile !== null) {
      // Determine if a new file was loaded or if an existing one was used
      if (imageFile.file !== null) {
        // This is a new load to which the correct MINIO url is not prefixed.
        onChange(`${imageFile.imgsrc}`);
        return;
      } else {
        // This means the file was loaded from an existing save.
        // the correct file extension should already be included.
        onChange(`/colyseus/getImage/${imageFile.imgsrc}`);
        return;
      }
    }

    // No New File detected. Lets see if preset exist.
    if (presetImage !== null) {
      onChange(`/colyseus/getImage/${presetImage}`);
      return;
    }

    // There is nothing to call change with.
    onChange(placeholder);
    return;
  }, [imageFile]);


  useImperativeHandle(
    ref,
    () => {
      return {
        // This function will be the main call for submitting objects.
        // This will need to handle all image uploads to the server and send back the proper access URL.
        async getMinioFileUrl(): Promise<string | undefined> {

          if (imageFile !== null) {
            // Either a load or a new file was uploaded.
            if (imageFile.file !== null) {
              // This is a new file lets upload it to minio.
              const formData = new FormData();
              formData.append("image", imageFile.file);
              const response = await authContext.client.http
                .post(`/uploadImage/${authContext.user.id}`, {
                  body: formData,
                })
                .catch((e) => {
                  toastContext.addToast("[ERROR]", "Failed to upload image", TOAST_LEVEL.ERROR);
                  throw new Error(e);
                });
              toastContext.addToast("[SUCCESS]", "Image Uploaded!!", TOAST_LEVEL.SUCCES);
              const data = response.data;
              return data.fileName;

            } else {
              // A preselected image was used. Lets use the imgSrc.
              return removeColyseusPath(imageFile.imgsrc);
            }
          }

          if (presetImage !== null) {
            return removeColyseusPath(presetImage);
          }


          toastContext.addToast("[ERROR]", "No Image available to use.", TOAST_LEVEL.ERROR);
          return undefined;

        },
      };
    },
    [presetImage, imageFile]
  );

  const handleFileChange = useCallback((e: any) => {
    const file: File | null = e.target.files[0] ?? null;
    if (file === null) return;
    setImageFile({ file: file, imgsrc: URL.createObjectURL(file) });
  }, []);

  useEffect(() => {
    authContext.room.send("getImageList");
    const result = authContext.room.onMessage("getImageListResult", (data: LoadImage[]) => {
      setKnownImageList(data);
    });

    return () => {
      result();
    };
  }, []);

  const getFullImgSrc = (): string => {

    // Determine if a new object is being used.
    if (imageFile !== null) {
      // Determine if it is a new file or loaded from an already created object.
      if (imageFile.file !== null) {
        // A new Object was created. For right now we can just use the src.
        // The minio url will be created when it is needed.
        return imageFile.imgsrc;
      } else {
        return `/colyseus/getImage/${imageFile.imgsrc}`;
      }
    }

    // Determine if there is a preset
    if (presetImage !== null) {
      return presetImage;
    }

    // if all else fails use the placeholder.
    return placeholder;
  };

  const resetValues = () => {
    setImageFile(null);
  };

  const startCapturingImageList = () => {
    authContext.room.send("getImageList");
  };

  return (
    <div className="mb-3 row">
      {showPreview ? (
        <div className="col-3">
          <img src={getFullImgSrc()} className="img-fluid" />
        </div>
      ) : (
        ""
      )}
      <div className="col">
        <div className="btn-group w-100" role="group" aria-label="Basic radio toggle button group">
          <input
            type="radio"
            className="btn-check"
            name="NewLoadImage"
            id="LoadImage"
            autoComplete="off"
            checked={isLoadActive === true}
            value={0}
            onChange={(e) => {
              startCapturingImageList();
              setLoadActive(+e.target.value === 0);
              resetValues();
            }}
          />
          <label className="btn btn-outline-primary" htmlFor="LoadImage">
            Load
          </label>

          <input
            type="radio"
            className="btn-check"
            name="NewLoadImage"
            id="NewImage"
            autoComplete="off"
            value={1}
            checked={isLoadActive === false}
            onChange={(e) => {
              setLoadActive(+e.target.value === 0);
              resetValues();
            }}
          />
          <label className="btn btn-outline-primary" htmlFor="NewImage">
            New
          </label>
        </div>

        {isLoadActive ? (
          <select
            className={`form-select`}
            aria-label="Default select example"
            onChange={(e) => {
              const index = +e.target.value;

              if (index <= -1) {
                // reset
                setImageFile(null);
              } else {
                // Another load image was used.
                const ImageObject = knownImageList[index];
                setImageFile({ file: null, imgsrc: ImageObject.image_name });
              }
            }}
          >
            <option value={-1}>Select Image</option>
            {knownImageList.map((val: LoadImage, i: number) => {
              return (
                <option value={i} key={`KnownImageList-${val.image_name}-${i}`}>
                  {getFileNameFromMinioString(val.image_name)}
                </option>
              );
            })}
          </select>
        ) : (
          <input className={`form-control`} type="file" id="formFile" accept="image/*" onChange={handleFileChange} />
        )}
      </div>
    </div>
  );
});
