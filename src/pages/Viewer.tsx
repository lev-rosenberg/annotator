import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import D3Annotator from '../components/d3Annotator';

export default function Viewer(): JSX.Element {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
      svgRef.current = document.querySelector('svg'); // Get the reference to the <svg> element
    }, []);

  return (
    <div>
      <Link href="/">
        <h1>go back</h1>
      </Link>
      <h1>Annotator testing actually fr tho</h1>
      <div style={{ position: 'relative', width: '1000px', height: '600px' }}>
        <svg
          ref={svgRef}
          style={{ position: 'absolute', top: 0, left: 0 }}
          width="1000"
          height="600"
        >
          <image
            xlinkHref="/images/mock-data.svg"
            width="1000"
            height="600"
          />
          <polyline/>
        </svg>
        <D3Annotator svgElement={svgRef} />
      </div>
    </div>
  );
}
