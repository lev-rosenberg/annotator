import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import {fromJson, customJson} from '../components/d3demo/loadJson'
import Link from 'next/link';
import { D3Annotator } from '../components/d3demo/d3Annotator';
import FormDialog from '../components/d3demo/labelPopup';
import styles from '../styles/svgAnnotator.module.css';
import Chip from '@mui/material/Chip';
import { Dims, LabelData, Point } from '../types/annotatorTypes'

export default function D3Viewer(): JSX.Element {

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
    img.src = '/images/maddoxdev.jpg'
    handleResize();

    if (img.naturalWidth, img.naturalHeight) {
      //const jsonData = customJson(0, img.naturalWidth, img.naturalHeight);
      const jsonData = fromJson('data.json');

      console.log(jsonData)
      setPolygonPoints(jsonData.polygonPoints);
      setPolygonLabels(jsonData.polygonLabels);
    }
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);

  }, [])

  let scaleFactor = 1
  if (divDimensions && imgDimensions) {
    scaleFactor = 1/(divDimensions?.width / imgDimensions?.width)
  }
  console.log(scaleFactor)

  function handleResize() {
      setDivDimensions({
        width: divRef.current?.clientWidth,
         height: divRef.current?.clientHeight,
      });
  }

  function handleChangeImage(image: string, num) {
    setCurrImage(image)
    setIsDrawing(false)
    const img = new Image();
    img.onload = function(){
      setImgDimensions({width: img.naturalWidth, height: img.naturalHeight})
      const jsonData = customJson(num, img.naturalWidth, img.naturalHeight);
      //const jsonData = fromJson('data.json');
      console.log(jsonData)
      setPolygonPoints(jsonData.polygonPoints);
      setPolygonLabels(jsonData.polygonLabels);
      scaleFactor = 1/(divDimensions?.width / imgDimensions?.width)
    };
    img.src = image
  }
  
  return (
    <div>
      <Link href="/">
        <h3>go back</h3>
      </Link>
      <Link href="/KonvaViewer">
        <h3>Konva Demo</h3>
      </Link>
      <h3>D3 Annotator demo</h3>
      <div 
        >
        <div className = {styles.headerRow}>
          <button onClick = {()=> setIsDrawing(!isDrawing)}>{isDrawing ? "Stop drawing" : "Start drawing"}</button>
          <div>
            <button 
              onClick = {() => handleChangeImage('/images/maddoxdev.jpg', 0)}
              className = "reset">
                idk what this is tbh (this one is normal)
            </button>
            <button 
              onClick = {() => handleChangeImage('/images/bigimage.jpg', 0)}
              className = "reset">
                tractor go brrrr (this img is huge)
            </button>
            <button 
              onClick = {() => handleChangeImage('/images/bottles.jpg', 50)}
              className = "reset">
                shampoo (this one has lots o' polygons)
            </button> 
          </div>
        </div>
        <div ref = {divRef} style = {{position: 'relative', maxWidth: '85vw',  margin: 'auto', overflowY: 'clip'}}>
          <svg
            ref = {svgRef}
            className = {styles.svg}
            id = "parent"
            width = "100%"
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
                    display: label.visible ? 'flex' : 'none'
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
              <button className = "reset">Fit to container</button>
              <button className = "fullsize" >Zoom to 100%</button>
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
