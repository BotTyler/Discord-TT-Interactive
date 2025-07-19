import React from "react";
import { useMessageContext } from "../../../../ContextProvider/Messages/MessageContextProvider";
import { MessageInterface } from "../../../../ContextProvider/Messages/MessageHandler";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

export default function ChatBox() {
  const messageContext = useMessageContext();
  const [messages, setMessages] = React.useState<MessageInterface[]>(messageContext.getAllMessage());
  const [atBottom, setAtBottom] = React.useState<boolean>(true);

  const chatboxRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleMessageChange = (val: any) => {
      setMessages(val.detail.val);
      if (!chatboxRef.current) return;
      const atBottom = chatboxRef.current.scrollHeight - chatboxRef.current.clientHeight <= chatboxRef.current.scrollTop + 1;
      setAtBottom(atBottom);
    };

    window.addEventListener("MessageAdd", handleMessageChange);

    return () => {
      window.removeEventListener("MessageAdd", handleMessageChange);
    };
  }, []);

  React.useEffect(() => {
    if (chatboxRef.current) {
      if (atBottom) chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight; // Scroll to bottom
    }
  }, [messages]);

  return (
    <div className="w-100 h-100 d-flex flex-column" style={{ background: "#211d19" }}>
      {/* Chat Messages */}
      <div className="container-fluid overflow-auto d-flex flex-column" style={{ flex: "1", height: "1px" }} ref={chatboxRef}>
        {messages.map((message: MessageInterface, i) => {
          return <MessageBubble message={message} key={`Message-${message.userId}-${message.created.toISOString()}-${i}`} />;
        })}
      </div>
      {/* Input */}
      <div className="w-100 h-auto">
        <ChatInput />
      </div>
    </div>
  );
}
