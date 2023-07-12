import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { D3Annotator } from '../components/d3demo/d3Annotator';
import FormDialog from '../components/mini-demos/labelPopup';
import styles from '../styles/svgAnnotator.module.css';
import Chip from '@mui/material/Chip';
import { labelData, Point } from '../types/svgTypes'



export default function Viewer(): JSX.Element {

  const svgRef = useRef<SVGSVGElement | null>(null);
  const imageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState<Boolean>(false)
  const [dialogueOpen, setDialogueOpen] = useState<Boolean>(false)
  const [polygonLabels, setPolygonLabels] = useState<labelData[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Point[][]>([]);
  const [currentZoom, setCurrentZoom] = useState(1)
  
  let height = 0
  let width = 0
  useEffect(() => {
    height = imageRef.current?.getBoundingClientRect().height
    width = imageRef.current?.getBoundingClientRect().width

    console.log(width, height)
  }, [])
  //console.log(height)

  return (
    <div>
      <Link href="/">
        <h1>go back</h1>
      </Link>
      <h1>D3 Annotator demo</h1>
      {/* <h2>{dims[0]}, {dims[1]}</h2> */}
      <h3>{currentZoom*100}%</h3>
      <button onClick = {()=> setIsDrawing(!isDrawing)}>{isDrawing ? "Stop drawing" : "Start drawing"}</button>
      <div style={{position: 'relative', width: '80vw', height: '60.5vh', margin: 'auto' }}>
        <svg
          ref={svgRef}
          className = {styles.svg}
          id = "parent"

          // just having width & height doesn't work because then the polygons don't slide with the image.

          // width = "100%"
          // height = "100%"
          //preserveAspectRatio = "xMidYMid meet"


          // this doesn't work because then the coordinate system is always changing on zoom, so the polygons don't stay in the right place
          // viewBox={"0 0" + ` ${imageRef.current?.getBoundingClientRect().width}` + ` ${imageRef.current?.getBoundingClientRect().height}`}

          // this is the closest one to work
          viewBox="0 0 1000 362.52569580078125"

          >
            
            <image 
              href="/images/maddoxdev.jpg" 
              ref = {imageRef} 
              // having just a width no height is useful so that the height of the image doesn't automatically match the container
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
