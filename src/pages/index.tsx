import React from 'react';
import KonvaAnnotator from '../components/konvaAnnotator';
import SvgAnnotator from '../components/svgAnnotator';
import D3Annotator from '../components/d3Annotator'
import PaperAnnotator from '../components/paperAnnotator'
import Viewer from '../pages/Viewer'
import Link from 'next/link'


function Home(): JSX.Element {
  return (
    <div>
      <Link href="./Viewer">
        <h1>Annotator testing</h1>
      </Link>
      {/* <h2>Two (SVG) Based</h2>
      <TwoAnnotator /> */}
      <h2>Konva (canvas) Based</h2>
      <KonvaAnnotator />
      <h2>Inline SVG Based</h2>
      <SvgAnnotator />
      <h2>D3 (SVG) Based</h2>
      <D3Annotator />
      <h2>Paper (Canvas) Based</h2>
      <PaperAnnotator />
    </div>
  );
};
export default Home;