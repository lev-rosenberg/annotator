import React from "react";
import SvgAnnotator from "../components/mini-demos/svgAnnotator";
import PaperAnnotator from "../components/mini-demos/paperAnnotator";
import SVGJSAnnotator from "../components/mini-demos/svgjsAnnotator";
import TwoAnnotator from "../components/mini-demos/twoAnnotator";
import KonvaViewer from "./KonvaViewer";

import Link from "next/link";

function Home(): JSX.Element {
  return (
    <div>
      <KonvaViewer />
    </div>
  );
}
export default Home;
