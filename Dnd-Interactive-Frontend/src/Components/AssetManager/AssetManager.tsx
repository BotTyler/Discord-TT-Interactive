import { useEffect, useState } from "react";
import { useAuthenticatedContext } from "../../ContextProvider/useAuthenticatedContext";
import { Col, Image, Row } from "react-bootstrap";
import { getFileNameFromMinioString } from "../../Util/Util";

export default function AssetManager() {
  const authContext = useAuthenticatedContext();
  const [imgList, setImgList] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (authContext.room === null) return;
    const handleImageListResponse = (val: any) => {
      setImgList(val.map((obj: any) => {
        return obj.image_name;
      }));

    }
    const imageListResponseListener = authContext.room.onMessage("getImageListResult", handleImageListResponse);

    authContext.room.send("getImageList");

    return () => {
      imageListResponseListener();
    }
  }, []);

  return <div className="w-100 h-auto">
    <Row direction="horizontal" gap={3}>
      {imgList ? imgList.map((imgUrl: any) => {
        return <Col key={`Image-${imgUrl}`} bsPrefix="col-4" className="my-1 border-bottom">
          <Image src={`/colyseus/getImage/${imgUrl}`} loading="lazy" fluid />
          <p className="p-0 m-0 mb-1 text-center">{getFileNameFromMinioString(imgUrl)}</p>
        </Col>
      }) : <p>loading</p>}
    </Row>
  </div>

}
