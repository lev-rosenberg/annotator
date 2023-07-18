import React from 'react';
import SvgAnnotator from '../components/mini-demos/svgAnnotator';
import PaperAnnotator from '../components/mini-demos/paperAnnotator'
import SVGJSAnnotator from '../components/mini-demos/svgjsAnnotator'
import TwoAnnotator from '../components/mini-demos/twoAnnotator'

import Viewer from './D3Viewer'
import Link from 'next/link'


function Home(): JSX.Element {
  return (
    <div>
      <Link href="./D3Viewer">
      <h1>D3 Annotator testing</h1>
      </Link>
      <Link href="./KonvaViewer">
      <h1>Konva Annotator testing</h1>
      </Link>
      <h2>SVG.js</h2>
      <SVGJSAnnotator />
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