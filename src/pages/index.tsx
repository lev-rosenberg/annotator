import React from 'react';
import KonvaAnnotator from '../components/mini-demos/konvaAnnotator';
import SvgAnnotator from '../components/mini-demos/svgAnnotator';
import { D3Annotator } from '../components/d3demo/d3Annotator'
import PaperAnnotator from '../components/mini-demos/paperAnnotator'
import SVGJSAnnotator from '../components/mini-demos/svgjsAnnotator'
import TwoAnnotator from '../components/mini-demos/twoAnnotator'

import Viewer from '../pages/Viewer'
import Link from 'next/link'


function Home(): JSX.Element {
  return (
    <div>
      <Link href="./Viewer">
      <h1>D3 Annotator testing</h1>
      </Link>a
      <h2>SVG.js</h2>
      <SVGJSAnnotator />
      <h2>Konva (canvas) Based</h2>
      <KonvaAnnotator />
      <h2>Inline SVG Based</h2>
      <SvgAnnotator />
      <h2>Two (renderer agnostic)</h2>
      <TwoAnnotator />
      <h2>Paper (Canvas) Based</h2>
      <PaperAnnotator />
    </div>
  );
};
export default Home;