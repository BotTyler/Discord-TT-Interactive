import React, { ReactNode } from "react";

export default function SimpleNavbar({ tabs, callback }: { tabs: { title: string; content: ReactNode }[]; callback: (content: ReactNode) => void }) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  return (
    <>
      <ul className="nav nav-tabs" style={{ userSelect: "none" }}>
        {tabs.map((tab, i) => {
          return (
            <li className="nav-item" key={`SimpleNavbar-${tab.title}-${i}`}>
              <a
                className={`nav-link ${i === activeIndex ? "active" : ""}`}
                onClick={() => {
                  setActiveIndex(i);
                  callback(tab.content);
                }}
              >
                {tab.title}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
