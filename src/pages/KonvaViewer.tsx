import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import useImage from "use-image";

import Link from "next/link";
import KonvaAnnotator from "../components/konvaDemo/konvaAnnotator";
import Konva from "konva";
import { Point, LabelData, Dims } from "../types/annotatorTypes";
import styles from "../styles/konvaAnnotator.module.css";
import FormDialog from "../components/labelPopup";
import Chip from "@mui/material/Chip";
import { NodeConfig, Node } from "konva/lib/Node";

export default function KonvaViewer(): JSX.Element {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");
  const [currZoom, setCurrZoom] = useState(0.2);
  const [polygonPoints, setPolygonPoints] = useState<Point[][]>([]);
  const [polygonLabels, setPolygonLabels] = useState<LabelData[]>([]);
  const [draftPolygon, setDraftPolygon] = useState<Point[] | null>(null);
  // with draft polygon idea: add new combined label-polygon ds
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isDraggingLayer, setIsDraggingLayer] = useState<boolean>(false);

  const layer = layerRef.current;
  const stage = stageRef.current;

  function handleChangeImage(image: string) {
    setCurrImage(image);
    const img = new Image();
    img.src = image;
  }

  function handleZoom100() {
    const layer = layerRef.current;
    if (layer) {
      setCurrZoom(1);
      layer.to({
        scaleX: 1,
        scaleY: 1,
        duration: 0.4,
      });
    }
  }

  const mapLabels = useCallback(() => {
    if (layer && stage) {
      setPolygonLabels((prevPolygonLabels) => {
        const labels: LabelData[] = [];
        layer.find("Group").forEach((polygon, i) => {
          const bottomRightPoint: Point | null = findBottomRightCoordinate(
            polygon.attrs.points
          );
          if (prevPolygonLabels[i]) {
            const label = prevPolygonLabels[i];
            label.coords = {
              x:
                bottomRightPoint.x * currZoom +
                stage?.attrs.container.offsetLeft +
                layer.attrs.x +
                10 * currZoom,
              y:
                bottomRightPoint.y * currZoom +
                stage?.attrs.container.offsetTop +
                layer.attrs.y +
                10 * currZoom,
            };
            //label.visible = isDraggingLayer ? false : true;
            labels.push(label);
          }
        });
        return labels;
      });
    }
  }, [currZoom, isDraggingLayer]);

  useEffect(() => {
    mapLabels();
  }, [mapLabels]);

  function getLabelCoords(polygon: Point[]) {
    if (layer && stage) {
      const bottomRightPoint: Point | null = findBottomRightCoordinate(polygon);
      return {
        x:
          bottomRightPoint.x * currZoom +
          stage.attrs.container.offsetLeft +
          layer.attrs.x +
          10 * currZoom,
        y:
          bottomRightPoint.y * currZoom +
          stage.attrs.container.offsetTop +
          layer.attrs.y +
          10 * currZoom,
      };
    } else {
      return null;
    }
  }

  function handleLabelSelect(option: string) {
    setPolygonLabels((prevPolygonLabels) => {
      return [
        ...prevPolygonLabels,
        {
          label: option,
          coords: getLabelCoords(draftPolygon as Point[]),
          visible: null,
        },
      ];
    });
    setDraftPolygon(null);
  }

  function handleLabelMove(index: number, points: Point[]) {
    setPolygonLabels((prevPolygonLabels) => {
      const newLabels = [...prevPolygonLabels];
      newLabels[index].coords = getLabelCoords(points);
      return newLabels;
    });
  }

  function findBottomRightCoordinate(coordinates: Point[]): Point {
    let currCoord: Point = coordinates[0];

    for (const coord of coordinates) {
      if (coord.y > currCoord.y) {
        currCoord = coord;
      }
    }
    return currCoord;
  }

  function isLabelChipVisible(x: number, y: number) {
    if (
      x < stage?.attrs.container.offsetLeft + stage?.attrs.width &&
      x > stage?.attrs.container.offsetLeft &&
      y < stage?.attrs.container.offsetTop + stage?.attrs.height &&
      y > stage?.attrs.container.offsetTop
    ) {
      if (!isDraggingLayer) {
        return true;
      }
    } else {
      return false;
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
          polygonLabels={polygonLabels}
          setPolygonLabels={setPolygonLabels}
          setIsDraggingLayer={setIsDraggingLayer}
          onPolygonAdded={(p: Point[]) => {
            setDraftPolygon(p);
          }}
          onPolygonChanged={handleLabelMove}
          // onPolygonDeleted={() => {}}
        />
        {polygonLabels.map((label, i) => {
          if (label.coords) {
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
                  display: isLabelChipVisible(label.coords.x, label.coords.y)
                    ? "flex"
                    : "none",
                }}
              />
            );
          }
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
        dialogueOpen={draftPolygon != null}
        onLabelSelect={handleLabelSelect}
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
