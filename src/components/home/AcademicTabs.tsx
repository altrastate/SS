"use client";

import { useState } from "react";
import { A_LEVEL_SUBJECTS, O_LEVEL_SUBJECTS } from "@/lib/site-media";

export function AcademicTabs() {
  const [tab, setTab] = useState<"o" | "a">("o");
  return (
    <div className="tabs">
      <div className="tab-btns">
        <button type="button" className={tab === "o" ? "on" : undefined} onClick={() => setTab("o")}>
          O' Level · S.1–S.4
        </button>
        <button type="button" className={tab === "a" ? "on" : undefined} onClick={() => setTab("a")}>
          A' Level · S.5–S.6
        </button>
      </div>
      <div className={`tab${tab === "o" ? " on" : ""}`}>
        <p>
          A broad foundation under the competence-based lower secondary curriculum, preparing girls and boys
          for the Uganda Certificate of Education (UCE). Confirm the current subject list with the school.
        </p>
        <div className="chips">
          {O_LEVEL_SUBJECTS.map((subject) => (
            <span key={subject}>{subject}</span>
          ))}
        </div>
      </div>
      <div className={`tab${tab === "a" ? " on" : ""}`}>
        <p>
          Specialised Arts and Science combinations leading to the Uganda Advanced Certificate of Education
          (UACE). Combinations are confirmed by the school office.
        </p>
        <div className="chips">
          {A_LEVEL_SUBJECTS.map((subject) => (
            <span key={subject}>{subject}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
