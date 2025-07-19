import { MessageInterface } from "../../../../ContextProvider/Messages/MessageHandler";
import { useAuthenticatedContext } from "../../../../ContextProvider/useAuthenticatedContext";

export default function MessageBubble({ message }: { message: MessageInterface }) {
  const authContext = useAuthenticatedContext();
  const isCurrentPerson = (): boolean => {
    return authContext.user.id === message.userId;
  };

  const getRegularMessageBubble = () => {
    return (
      <div className={`w-75 h-auto my-1 align-self-start`} style={{ color: "white" }}>
        {/* Header (Name) */}
        <div className="container-fluid p-0 g-0 d-flex justify-content-between">
          <p style={{ fontSize: "12px" }} className="m-0 fw-bolder">
            {message.displayName}
          </p>
          <p style={{ fontSize: "12px" }} className="m-0 fw-bolder">
            {message.type}
          </p>
        </div>
        <div className="container-fluid bg-gradient rounded" style={{ background: "#908f8d" }}>
          <p className="fs-5 m-0 my-1">{message.message}</p>
        </div>
        <div className="container-fluid text-end p-0 g-0">
          <p style={{ fontSize: "10px" }} className="m-0">
            {message.created.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  const getCurrentUserMessageBubble = () => {
    return (
      <div className={`w-75 h-auto my-1 align-self-end`} style={{ color: "white" }}>
        {/* Header (Name) */}
        <div className="container-fluid p-0 g-0 d-flex justify-content-between">
          <p style={{ fontSize: "12px" }} className="m-0 fw-bolder">
            {message.displayName}
          </p>
          <p style={{ fontSize: "12px" }} className="m-0 fw-bolder">
            {message.type}
          </p>
        </div>
        <div className="container-fluid bg-gradient rounded" style={{ background: "#908f8d" }}>
          <p className="fs-5 m-0 my-1">{message.message}</p>
        </div>
        <div className="container-fluid text-end p-0 g-0">
          <p style={{ fontSize: "10px" }} className="m-0">
            {message.created.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };
  return <>{isCurrentPerson() ? getCurrentUserMessageBubble() : getRegularMessageBubble()}</>;
}
