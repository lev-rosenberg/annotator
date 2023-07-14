import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3'
import Link from 'next/link';
import { D3Annotator } from '../components/d3demo/d3Annotator';
import FormDialog from '../components/mini-demos/labelPopup';
import styles from '../styles/svgAnnotator.module.css';
import Chip from '@mui/material/Chip';
import { Dims, LabelData, Point } from '../types/svgTypes'



export default function Viewer(): JSX.Element {

  const svgRef = useRef<SVGSVGElement | null>(null);
  const imgRef = useRef<SVGImageElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null)
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [dialogueOpen, setDialogueOpen] = useState<boolean>(false)
  const [polygonLabels, setPolygonLabels] = useState<LabelData[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Point[][]>([]);
  const [currentZoom, setCurrentZoom] = useState(1)
  const [imgDimensions, setImgDimensions] = useState<Dims>()
  const [divDimensions, setDivDimensions] = useState<Dims>()
  const [currImage, setCurrImage] = useState('/images/maddoxdev.jpg')
  
  useEffect(() => {
    const img = new Image();
    img.onload = function(){
      setImgDimensions({width: img.naturalWidth, height: img.naturalHeight})
    };
    img.src = currImage
    
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [currImage])

  let scaleFactor = 1
  if (divDimensions && imgDimensions) {
    scaleFactor = 1/(divDimensions?.width / imgDimensions?.width)
  }

  function handleResize() {
      setDivDimensions({
        width: divRef.current?.clientWidth,
         height: divRef.current?.clientHeight,
      });
  }

  function handleChangeImage(image: string) {
    setCurrImage(image)
    setPolygonPoints([])
    setPolygonLabels([])
  }
  
  return (
    <div>
      <Link href="/">
        <h1>go back</h1>
      </Link>
      <h1>D3 Annotator demo</h1>
      
      <div 
        >
        <div className = {styles.headerRow}>
          <button onClick = {()=> setIsDrawing(!isDrawing)}>{isDrawing ? "Stop drawing" : "Start drawing"}</button>
          <div>
            <button onClick = {() => handleChangeImage('/images/maddoxdev.jpg')}>idk what this is tbh</button>
            <button onClick = {() => handleChangeImage('/images/bigimage.jpg')}>tractor go brrrr</button>
            <button onClick = {() => handleChangeImage('/images/wires.jpg')}>wire me up</button> 
          </div>
        </div>
        <div ref = {divRef} style = {{position: 'relative', width: '85vw', margin: 'auto' }}>
          <svg
            ref = {svgRef}
            className = {styles.svg}
            id = "parent"
            width = "100%"
            /*  TO DO: 
            1) be able to zoom to 100% of the ACTUAL image size
            2) labels at the correct vertex
            3) move polygons from the middle
            */
            viewBox= {"0 0 " + `${imgDimensions?.width} ${imgDimensions?.height}`} // s
          >
              <image 
                href={currImage}
                ref = {imgRef}
                width = "100%"
                className = {styles.img}
              />
          </svg>
          
          

          {polygonLabels.map((label, i) => {
            return (
                <Chip 
                  label={label.label} 
                  color="primary"
                  size = "small"
                  key = {i}
                  sx={{
                    position: 'absolute', 
                    top: `${label.coords?.y/scaleFactor}px`, 
                    left: `${label.coords?.x/scaleFactor}px`,
                    zIndex: label.visible ? '1' : '-5'
                  }} 
                />
            )
          })}

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
            scaleFactor = {scaleFactor}
          />

          <FormDialog 
            dialogueOpen={dialogueOpen} 
            setDialogueOpen={setDialogueOpen} 
            polygonLabels={polygonLabels}
            setPolygonLabels ={setPolygonLabels}
          />
        </div>
        <div className = {styles.footerRow}>
            <div>Current Zoom: {Math.round(currentZoom*100)}%</div>
            <div>
              <button id = "reset" >Fit to container</button>
              <button id = "fullsize" >Zoom to 100%</button>
            </div>
          </div>
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
