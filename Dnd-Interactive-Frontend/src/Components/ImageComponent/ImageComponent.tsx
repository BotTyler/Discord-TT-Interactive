import { useEffect, useState } from "react";
import { GetImageUri } from "../../Util/ImageUtils";

export default function ImageComponent({ className, source }: { className: string, source: string }) {

  const [mSource, setSource] = useState<string>(source);
  const [mClassName, setClassname] = useState<string>(className);


  useEffect(() => {
    GetImageUri(source).then((val: string): void => {
      setSource(val);
    });
  }, [source])

  useEffect(() => {
    setClassname(className)
  }, [className])


  return <img src={mSource} className={mClassName} />;
}
