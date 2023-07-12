import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { D3Annotator } from '../components/d3demo/d3Annotator';
import FormDialog from '../components/mini-demos/labelPopup';
import styles from '../styles/svgAnnotator.module.css';
import Chip from '@mui/material/Chip';
import { labelData, Point } from '../types/svgTypes'



export default function Viewer(): JSX.Element {

  const svgRef = useRef<SVGSVGElement | null>(null);
  const divRef = useRef<HTMLDivElement | undefined>()
  const imageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [dialogueOpen, setDialogueOpen] = useState<boolean>(false)
  const [polygonLabels, setPolygonLabels] = useState<labelData[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Point[][]>([]);
  const [currentZoom, setCurrentZoom] = useState(1)
  const [dimensions, setDimensions] = useState([])
  const [scaleFactor, setScaleFactor] = useState(1)
  
  useEffect(() => {
    const img = new Image();
    img.onload = function(){
     setDimensions([img.naturalWidth, img.naturalHeight])
    };
    img.src = "/images/maddoxdev.jpg"
  }, [])
  const divWidth = divRef.current?.clientWidth
  const scale = dimensions[1]/divWidth
  console.log(scale)
  //setScaleFactor(scale)


  // console.log(scaleFactor)

  return (
    <div>
      <Link href="/">
        <h1>go back</h1>
      </Link>
      <h1>D3 Annotator demo</h1>
      {/* <h2>{dims[0]}, {dims[1]}</h2> */}
      <h3>{currentZoom*100}%</h3>
      <button onClick = {()=> setIsDrawing(!isDrawing)}>{isDrawing ? "Stop drawing" : "Start drawing"}</button>
      <div 
        ref = {divRef}
        style={{position: 'relative', width: '80vw', height: '40vh', margin: 'auto' }}>
        <svg
          ref={svgRef}
          className = {styles.svg}
          id = "parent"
          width = "100%"
          // height = "100%"

          /*  TO DO: 
          1) calculate a scale factor based on the width or height and the viewbox width or height size. 
          2) be able to zoom to 100% of the ACTUAL image size
          */
          viewBox= {"0 0 " + `${dimensions[0]} ${dimensions[1]}`} // s
        >
            
            <image 
              href="/images/maddoxdev.jpg" 
              id = "hi"
              ref = {imageRef} 
              preserveAspectRatio = "none"
              width = "100%"
              className = {styles.img}
            />
        </svg>

        {/* {polygonLabels.map((label, i) => {
          return (
              <Chip 
                label={label.label} 
                color="primary"
                size = "small"
                key = {i}
                sx={{
                  position: 'absolute', 
                  top: `${label.coords?.y}px`, 
                  left: `${label.coords?.x}px`,
                  zIndex: label.visible ? '1' : '-5'
                }} 
              />
          )
        })} */}
        <D3Annotator 
          svgElement={svgRef} 
          isDrawing = {isDrawing} 
          setIsDrawing = {setIsDrawing}
          setDialogueOpen={setDialogueOpen} 
          dialogueOpen = {dialogueOpen}
          polygonLabels={polygonLabels}
          setPolygonLabels = {setPolygonLabels}
          polygonPoints = {polygonPoints}
          setPolygonPoints = {setPolygonPoints}
          setCurrentZoom = {setCurrentZoom}
          scaleFactor = {scale}
        />
        {/* <FormDialog 
          dialogueOpen={dialogueOpen} 
          setDialogueOpen={setDialogueOpen} 
          polygonLabels={polygonLabels}
          setPolygonLabels ={setPolygonLabels}
        /> */}
        <ul className = {styles.li}>
          {polygonPoints.map((polygon, i) => (
            <li key = {i}>
              <h3>polygon {i} </h3>
              {polygon.map((coords, j) => (
                <p key = {j} >x: {coords.x}    y: {coords.y}</p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
