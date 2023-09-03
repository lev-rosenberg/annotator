import Link from "next/link";
import { useState } from "react";
import InstructionsDialog from "./instructionsPopup";
interface HeaderProps {
  name: string;
  frameworks: string[];
}

export default function Header(props: HeaderProps) {
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const links: { [key: string]: string } = {
    D3: "/D3Viewer",
    visx: "/VisxViewer",
    Konva: "/KonvaViewer",
  };
  return (
    <div>
      <div className="page-header">
        <h3>{props.name} Demo</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link className="headerButton" href={links[props.frameworks[0]]}>
            <h5>{props.frameworks[0]} Demo</h5>
          </Link>
          <Link className="headerButton" href={links[props.frameworks[1]]}>
            <h5>{props.frameworks[1]} demo</h5>
          </Link>
          <h5
            className="headerButton"
            onClick={() => setInstructionsOpen(true)}
          >
            Instructions
          </h5>
          <InstructionsDialog
            dialogueOpen={instructionsOpen}
            close={() => setInstructionsOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
