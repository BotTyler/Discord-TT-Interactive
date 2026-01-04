import React from "react";
import SimpleNavbar from "../../SimpleNavbar/SimpleNavbar";
import ChatBox from "../General/Chatbox/Chat";
import PlayerInitiativeTrackerPanel from "./PlayerInitiativeTracker/PlayerInitiativeTrackerPanel";

export default function PlayerSidePanel() {

  const contentList: { title: string; content: React.ReactNode }[] = [
    { title: "Chat", content: <ChatBox /> },
    { title: "Initiative", content: <PlayerInitiativeTrackerPanel /> },
  ];
  const [curContent, setContent] = React.useState<React.ReactNode>(contentList[0].content);
  return (
    <div className="w-100 h-100 overflow-hidden d-flex flex-column">
      {/* Content */}
      <div className="w-100 d-flex flex-column" style={{ flex: "1", height: "1px" }}>
        {/* Nav Bar */}
        <div className="w-100">
          <SimpleNavbar
            callback={(content: React.ReactNode) => {
              setContent(content);
            }}
            tabs={contentList}
          />
        </div>
        {/*  rest of content */}
        <div className="w-100 overflow-auto" style={{ flex: "1", height: "1px" }}>
          {curContent}
        </div>
      </div>
    </div>
  );
}
