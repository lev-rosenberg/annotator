import React from 'react';
import KonvaAnnotator from '../components/konvaAnnotator';
import SvgAnnotator from '../components/svgAnnotator';
import D3Annotator from '../components/d3Annotator'
import PaperAnnotator from '../components/paperAnnotator'
import SVGJSAnnotator from '../components/svgjsAnnotator'
import TwoAnnotator from '../components/twoAnnotator'

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