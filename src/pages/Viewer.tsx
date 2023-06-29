import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import D3Annotator from '../components/d3Annotator';
import FormDialog from '../components/labelPopup';

import styles from '../styles/svgAnnotator.module.css';
export default function Viewer(): JSX.Element {

  const svgRef = useRef<SVGSVGElement | null>(null);
  const imgSize = { x: 1000, y: 600 };
  const [draw, setDraw] = useState<Boolean>(false)
  const [dialogueOpen, setDialogueOpen] = useState<Boolean>(false)
  const [polygonLabels, setPolygonLabels] = useState<string[]>([]);



  useEffect(() => {
     svgRef.current = document.querySelector('svg'); // Get the reference to the <svg> element
  }, [svgRef]);
  console.log(polygonLabels)
  return (
    <div>
      <Link href="/">
        <h1>go back</h1>
      </Link>
      <h1>D3 Annotator demo</h1>
      <button onClick = {()=> setDraw(!draw)}>{draw ? "Stop drawing" : "Start drawing"}</button>
      <div style={{ position: 'relative', width: '90vw', height: '60vh', margin: 'auto' }}>
        <svg
          className = {styles.svg}
          id = "svg"
          ref={svgRef}
           // viewBox={`0 0 ${imgSize.x} ${imgSize.y}`}
          width="100%"
           height="100%"
        />
        
        <D3Annotator 
          svgElement={svgRef} 
          isDrawing = {draw} 
          setOpen={setDialogueOpen} 
          polygonLabels={polygonLabels} 
        />
        <FormDialog 
          open={dialogueOpen} 
          setOpen={setDialogueOpen} 
          labels = {polygonLabels} 
          setLabels ={setPolygonLabels}/>
      </div>
    </div>
  );
}
