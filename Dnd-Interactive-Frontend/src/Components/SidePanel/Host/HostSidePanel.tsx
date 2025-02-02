import React from "react";
import ImportExport from "./ImportExport";
import EnemyListPanel from "./EnemyList/EnemyListPanel";
import SimpleNavbar from "../../SimpleNavbar/SimpleNavbar";
import InitiativeTrackerPanel from "./InitiativeTracker/InitiativeTrackerPanel";
import ChatBox from "../General/Chatbox/Chat";
import AudioBox from "../General/AudioBox/AudioBox";
import HealthDeathTrackerPanel from "./HealthDeathTracker/HealthDeathTrackerPanel";
import HandoutsPanel from "./Handouts/HandoutsPanels";
import RichTextEditor from "../../RichTextEditor/RichTextEditor";

export default function HostSidePanel() {
  const contentList: { title: string; content: React.ReactNode }[] = [
    //{ title: "Notes", content: <RichTextEditor /> },
    { title: "Enemy List", content: <EnemyListPanel /> },
    { title: "Initiative Tracker", content: <InitiativeTrackerPanel /> },
    { title: "Chat", content: <ChatBox /> },
    { title: "Audio", content: <AudioBox /> },
    { title: "HP", content: <HealthDeathTrackerPanel /> },
    { title: "Handout", content: <HandoutsPanel /> },
  ];
  const [curContent, setContent] = React.useState<React.ReactNode>(contentList[0].content);
  return (
    <div className="w-100 h-100 overflow-hidden d-flex flex-column">
      {/* Gamestate buttons */}
      <div className="w-100">
        <ImportExport />
      </div>
      {/* Content */}
      <div className="w-100 d-flex flex-column" style={{ flex: "1 1 auto", height: "1px" }}>
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
        <div className="w-100 my-1 border rounded border-secondary overflow-auto" style={{ flex: "1 1 auto", height: "1px" }}>
          {curContent}
        </div>
      </div>
    </div>
  );
}
