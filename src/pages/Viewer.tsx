import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import D3Annotator from '../components/d3Annotator';
import FormDialog from '../components/labelPopup';

import styles from '../styles/svgAnnotator.module.css';

interface Vertex {
  x: number;
  y: number;
}

export default function Viewer(): JSX.Element {

  const svgRef = useRef<SVGSVGElement | null>(null);
  const imgSize = { x: 1000, y: 600 };
  const [draw, setDraw] = useState<Boolean>(false)
  const [dialogueOpen, setDialogueOpen] = useState<Boolean>(false)
  const [polygonLabels, setPolygonLabels] = useState<string[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Vertex[][]>([]);
  const [labelCoords, setLabelCoords] = useState<Vertex[]>([])


  // function findBottomRight(points: Vertex[]) {
  //   var bottom_left: Vertex = {x: 10000, y:0}

  //   points.map((pt) => {
  //     if (pt.x < bottom_left.x && pt.y > bottom_left.y) {bottom_left = pt}
  //   })
  //   setLabelCoords([...labelCoords, bottom_left])
  // }
  // useEffect(() => {
  //   polygonPoints.map((polygon) => {
  //     findBottomRight(polygon)
  //   })
  //   console.log(labelCoords)
  // }), []


  useEffect(() => {
     svgRef.current = document.querySelector('svg'); // Get the reference to the <svg> element
     
  }, [svgRef]);

  

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
          polygonPoints = {polygonPoints}
          setPolygonPoints = {setPolygonPoints}
        />
        <FormDialog 
          open={dialogueOpen} 
          setOpen={setDialogueOpen} 
          labels = {polygonLabels} 
          setLabels ={setPolygonLabels}/>

          {/* now i have to find the bottom of each polygon */}
        
      </div>
    </div>
  );
}
