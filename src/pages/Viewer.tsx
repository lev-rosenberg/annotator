import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import D3Annotator from '../components/d3Annotator';

export default function Viewer(): JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const imgSize = { x: 1000, y: 600 };
  console.log(svgRef)

  useEffect(() => {
    svgRef.current = document.querySelector('svg'); // Get the reference to the <svg> element
  }, [svgRef]);

  return (
    <div>
      <Link href="/">
        <h1>go back</h1>
      </Link>
      <h1>D3 Annotator demo</h1>
      <div style={{ position: 'relative', width: '90vw', height: '60vh', margin: 'auto' }}>
        <svg
          ref={svgRef}
          // viewBox={`0 0 ${imgSize.x} ${imgSize.y}`}
          width="100%"
           height="100%"
        />
        {svgRef.current && <D3Annotator svgElement={svgRef} />}
      </div>
    </div>
  );
}
