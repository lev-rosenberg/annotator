import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import D3Annotator from '../components/d3Annotator';
import FormDialog from '../components/labelPopup';
import styles from '../styles/svgAnnotator.module.css';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image'


interface Vertex {
  x: number;
  y: number;
}

export default function Viewer(): JSX.Element {

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draw, setDraw] = useState<Boolean>(false)
  const [dialogueOpen, setDialogueOpen] = useState<Boolean>(false)
  const [polygonLabels, setPolygonLabels] = useState<string[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Vertex[][]>([]);
  const [currentZoom, setCurrentZoom] = useState(1)
  useEffect(() => {
     svgRef.current = document.querySelector('svg'); // Get the reference to the <svg> element
  }, [svgRef]);


  return (
    <div>
      <Link href="/">
        <h1>go back</h1>
      </Link>
      <h1>D3 Annotator demo</h1>
      <h3>{currentZoom*100}%</h3>
      <button onClick = {()=> setDraw(!draw)}>{draw ? "Stop drawing" : "Start drawing"}</button>
      <div style={{position: 'relative', width: 'fit-content', height: 'fit-content', margin: 'auto' }}>
        
        <svg
          className = {styles.svg}
          id = "svg"
          ref={svgRef}
          width="1200"
          height="800" 
        >
          <image href="/images/bubbles.jpeg" height="100%" width="100%" className = {styles.img}/>
        </svg>
        
        <D3Annotator 
          svgElement={svgRef} 
          isDrawing = {draw} 
          setOpen={setDialogueOpen} 
          polygonLabels={polygonLabels}
          polygonPoints = {polygonPoints}
          setPolygonPoints = {setPolygonPoints}
          width={svgRef.current?.getBoundingClientRect().width}
          height={svgRef.current?.getBoundingClientRect().height}
          setCurrentZoom = {setCurrentZoom}
        />
        <FormDialog 
          open={dialogueOpen} 
          setOpen={setDialogueOpen} 
          labels = {polygonLabels} 
          setLabels ={setPolygonLabels}
        />
        <ul className = {styles.li}>
          {polygonPoints.map((polygon, i) => (
            <li>
              <h3>polygon {i} </h3>
              {polygon.map(coords => (
                <p>x: {coords.x}    y: {coords.y}</p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
