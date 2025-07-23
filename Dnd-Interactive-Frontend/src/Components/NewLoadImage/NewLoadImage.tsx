import { LoadImage } from "../../../shared/src/LoadDataInterfaces";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import { getFileNameFromMinioString } from "../../Util/Util";

// Although the onChange method can be used to get the image url. This will not be linked with pg or minio. When the image should be used, we should use the forward ref method (getMinioFileUrl) to ensure the file is properly placed.
// onChange will provide the full url to get the image within a src tag. But this should not be used for creating or updating players **************************************
export const NewLoadImage = forwardRef(function NewLoadImage({ startingImageSrc, imgSrcPrefix, showPreview = true, onChange }: { startingImageSrc: string; imgSrcPrefix: string; showPreview?: boolean; onChange?: (imageUrl: string) => void }, ref: any) {
  const authContext = useAuthenticatedContext();

  const [imgSrc, setImgSrc] = useState<string>(`${imgSrcPrefix}${startingImageSrc}`);
  const [imageFile, setImageFile] = useState<{ file: File | undefined; imgsrc: string } | undefined>(undefined);
  const [knownImageList, setKnownImageList] = useState<LoadImage[]>([]);
  const [isLoadActive, setLoadActive] = useState<boolean>(true); // If true the load page should be shown first

  useEffect(() => {
    setImgSrc(`${imgSrcPrefix}${startingImageSrc}`);
  }, [startingImageSrc]);

  useEffect(() => {
    if (!onChange) return;
    if (!imageFile) {
      onChange(imgSrc);
      return;
    }
    if (!imageFile.file) {
      onChange(`/colyseus/getImage/${imageFile.imgsrc}`);
      return;
    }

    onChange(imageFile.imgsrc);
  }, [imgSrc, imageFile]);

  useImperativeHandle(
    ref,
    () => {
      return {
        async getMinioFileUrl(): Promise<string | undefined> {
          // If there is no image file then we can return the original imgSrc
          if (!imageFile) return imgSrc;

          // If no new file is here there must be some src image from an already existing minio instance
          if (!imageFile.file) return imageFile.imgsrc;

          // A new File was uploaded we need to send this data to minio
          const formData = new FormData();
          formData.append("image", imageFile.file);
          const response = await authContext.client.http
            .post(`/uploadImage/${authContext.user.id}`, {
              body: formData,
            })
            .catch((e) => {
              throw new Error(e);
            });
          const data = response.data;
          return data.fileName;
        },
      };
    },
    [imgSrc, imageFile]
  );

  const handleFileChange = useCallback((e: any) => {
    const file = e.target.files[0];
    if (file === undefined) return;
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
    if (!imageFile) return imgSrc;
    if (!imageFile.file) return `/colyseus/getImage/${imageFile.imgsrc}`;
    return imageFile.imgsrc;
  };

  const resetValues = () => {
    setImageFile(undefined);
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
            name="btnradio"
            id="btnradio1"
            autoComplete="off"
            checked={isLoadActive === true}
            value={0}
            onChange={(e) => {
              startCapturingImageList();
              setLoadActive(+e.target.value === 0);
              resetValues();
            }}
          />
          <label className="btn btn-outline-primary" htmlFor="btnradio1">
            Load
          </label>

          <input
            type="radio"
            className="btn-check"
            name="btnradio"
            id="btnradio2"
            autoComplete="off"
            value={1}
            checked={isLoadActive === false}
            onChange={(e) => {
              setLoadActive(+e.target.value === 0);
              resetValues();
            }}
          />
          <label className="btn btn-outline-primary" htmlFor="btnradio2">
            New
          </label>
        </div>

        {isLoadActive ? (
          <select
            className={`form-select`}
            aria-label="Default select example"
            onChange={(e) => {
              const index = +e.target.value;
              const ImageObject = knownImageList[index];
              setImageFile({ file: undefined, imgsrc: ImageObject.image_name });
            }}
          >
            <option value={""}>Select Image</option>
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
