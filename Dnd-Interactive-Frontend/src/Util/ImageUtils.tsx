import { ToastContextInterface, useMessageContext } from "../ContextProvider/Messages/MessageContextProvider";
import { TOAST_LEVEL } from "../ContextProvider/Messages/Toast";
import { ColyseusAuthenticationDetail, useAuthenticatedContext } from "../ContextProvider/useAuthenticatedContext";

const authContext: ColyseusAuthenticationDetail | null = useAuthenticatedContext() ?? null;
const messageContext: ToastContextInterface = useMessageContext();

interface ImageResponse {
  src: string,
  name: string
}

interface UploadImageResponse {
  fileName: string
}

export async function GetImageUri(path: string): Promise<string> {
  // Check if the path provided is grabbing locally.
  if (path.startsWith("Assets")) return path;

  // Guard against any other urls being used.
  if (!path.startsWith("/colyseus")) {
    console.warn("Improper setup for image path. This image may fail to load.", path);
  }

  // Ask for a Url from colyseus
  if (authContext === null || authContext.client === null) {
    console.error("AuthContext is somehow null");
    return "Assets/placeholder.png";
  }
  const imgSrc: string = await authContext.client.http
    .get<ImageResponse>(`/getImage/${path}`)
    .then(res => res.data())
    .then((value: ImageResponse): string => {
      return value.src;
    }).catch((err: any): string => {
      console.error("Could not getImage", err);
      return "Assets/placeholder.png";
    });

  // Contact Minio to stream the image.
  console.log(imgSrc);


  // Return the stream
  return "Assets/placeholder.png";
}

export async function UploadImage(file: File): Promise<string | null> {
  if (authContext === null || authContext.client === null) {
    console.error("AuthContext is somehow null");
    return null;
  }

  const formData: FormData = new FormData();
  formData.append("image", file);
  const response: UploadImageResponse | null = await authContext.client.http
    .post(`/uploadImage`, {
      body: formData,
    })
    .then(res => res.data)
    .then((value: UploadImageResponse): UploadImageResponse | null => {
      if (value == null || value.fileName === null)
        return null;
      return value;
    })
    .catch((e: any): null => {
      messageContext.addToast("[ERROR]", "Failed to upload image", TOAST_LEVEL.ERROR);
      console.error("[ERROR]", "Failed to upload image", e);
      return null;
    });
  messageContext.addToast("[SUCCESS]", "Image Uploaded!!", TOAST_LEVEL.SUCCES);
  return response === null ? null : response.fileName;
}
