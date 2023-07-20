import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import KonvaAnnotator from "../components/konvaDemo/konvaAnnotator";
import Konva from "konva";
import { Point, LabelData } from "../types/annotatorTypes";
import styles from "../styles/konvaAnnotator.module.css";
import FormDialog from "../components/labelPopup";
import Chip from "@mui/material/Chip";

export default function KonvaViewer(): JSX.Element {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");
  const [currZoom, setCurrZoom] = useState(0.2);
  const [polygonPoints, setPolygonPoints] = useState<Point[][]>([]);
  const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);
  const [polygonLabels, setPolygonLabels] = useState<LabelData[]>([]);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  function handleChangeImage(image: string) {
    setCurrImage(image);
    const img = new Image();
    img.src = image;
  }

  function handleZoom100() {
    const layer = layerRef.current;
    console.log(polygonLabels);
    if (layer) {
      setCurrZoom(1);
      layer.to({
        scaleX: 1,
        scaleY: 1,
        duration: 0.4,
      });
    }
  }

  return (
    <div>
      <Link href="/">
        <h5>other frameworks</h5>
      </Link>
      <Link href="/D3Viewer">
        <h5>to D3 Demo</h5>
      </Link>
      <h3>Konva Demo</h3>
      <div className="headerRow">
        <button onClick={() => setIsDrawing(!isDrawing)}>
          {isDrawing ? "Stop drawing" : "Start drawing"}
        </button>
        <div>
          <button
            onClick={() => handleChangeImage("/images/maddoxdev.jpg")}
            className="reset"
          >
            idk what this is tbh (this one is normal)
          </button>
          <button
            onClick={() => handleChangeImage("/images/bigimage.jpg")}
            className="reset"
          >
            tractor go brrrr (this img is huge)
          </button>
          <button
            onClick={() => handleChangeImage("/images/paul.jpg")}
            className="reset"
          >
            paul (this one has lots of polygons)
          </button>
        </div>
      </div>
      <div id="container" className={styles.container}>
        <KonvaAnnotator
          currImage={currImage}
          currZoom={currZoom}
          setCurrZoom={setCurrZoom}
          stageRef={stageRef}
          layerRef={layerRef}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          setDialogueOpen={setDialogueOpen}
          polygonLabels={polygonLabels}
          setPolygonLabels={setPolygonLabels}
        />
        {polygonLabels.map((label, i) => {
          return (
            <Chip
              label={label.label}
              color="primary"
              size="small"
              key={i}
              sx={{
                position: "absolute",
                top: `${label.coords?.y}px`,
                left: `${label.coords?.x}px`,
                display: label.visible ? "flex" : "none",
              }}
            />
          );
        })}
      </div>
      <div className="footerRow">
        <div>Current Zoom: {Math.round(currZoom * 100)}%</div>
        <div>
          {/* <button className="reset">Fit to container</button> */}
          <button className="fullsize" onClick={handleZoom100}>
            Zoom to 100%
          </button>
        </div>
      </div>
      <FormDialog
        dialogueOpen={dialogueOpen}
        setDialogueOpen={setDialogueOpen}
        polygonLabels={polygonLabels}
        setPolygonLabels={setPolygonLabels}
      />
      <ul className={styles.li}>
        {polygonPoints.map((polygon, i) => (
          <li key={i}>
            <h3>polygon {i} </h3>
            {polygon.map((coords, j) => (
              <p key={j}>
                x: {coords.x} y: {coords.y}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
