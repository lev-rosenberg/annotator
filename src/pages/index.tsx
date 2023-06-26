import React from 'react';
import KonvaAnnotator from '../components/konvaAnnotator';
import SvgAnnotator from '../components/svgAnnotator';
import D3Annotator from '../components/d3Annotator'
import PaperAnnotator from '../components/paperAnnotator'
import TwoAnnotator from '../components/twoAnnotator'


function Home(): JSX.Element {
  return (
    <div>
      <h1>Annotator testing</h1>
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