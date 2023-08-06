import React, { useRef, useEffect, useState, useCallback } from "react";

import { customJson } from "../components/toFromJson";
import Link from "next/link";
import KonvaAnnotator from "../components/konvaDemo/konvaAnnotator";
import Konva from "konva";
import { Point, PolygonData, Dims } from "../types/annotatorTypes";
import styles from "../styles/konvaAnnotator.module.css";
import FormDialog from "../components/labelPopup";
import Chip from "@mui/material/Chip";

export default function KonvaViewer(): JSX.Element {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const [divDimensions, setDivDimensions] = useState<Dims>();
  const [imgDimensions, setImgDimensions] = useState<Dims>();

  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");
  const [currZoom, setCurrZoom] = useState(0.2);
  const [draftPolygon, setDraftPolygon] = useState<Point[] | null>(null);
  const [polygonsData, setPolygonsData] = useState<PolygonData[]>([]);
  const [circlesVisible, setCirclesVisible] = useState<boolean[]>([]);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isDraggingLayer, setIsDraggingLayer] = useState<boolean>(false);
  const [viewLabels, setViewLabels] = useState<boolean>(true);

  const layer = layerRef.current;
  const stage = stageRef.current;

  /* ****** IMAGE LOADING BELOW ****** */

  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      const jsonData = customJson(0, img.naturalWidth, img.naturalHeight);
      //const jsonData = fromJson('data.json');
      handleZoomFitContainer(img.width, img.height);
      setImgDimensions({ width: img.width, height: img.height });
      setPolygonsData(jsonData);
      handleCirclesNotVisible();
    };
    img.src = currImage;

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleResize() {
    const dims = document.querySelector("#container")?.getBoundingClientRect();
    setDivDimensions({ width: dims?.width, height: dims?.height });
  }

  const handleChangeImage = useCallback((image: string, num: number) => {
    const img = new Image();
    img.onload = function () {
      const jsonData = customJson(num, img.naturalWidth, img.naturalHeight);
      //const jsonData = fromJson('data.json');
      handleZoomFitContainer(img.width, img.height);
      labelsToCoords();
      setImgDimensions({ width: img.width, height: img.height });
      setPolygonsData(jsonData);
      handleCirclesNotVisible();
      setCurrImage(image);
    };
    img.src = image;
    setIsDrawing(false);
    //
  }, []);

  /* ****** IMAGE LOADING ABOVE ****** */

  /* ****** ZOOM BUTTONS BELOW ****** */

  function handleZoomFitContainer(imgWidth: number, imgHeight: number) {
    const layer = layerRef.current;
    const dims = document.querySelector("#container")?.getBoundingClientRect();
    if (layer && dims) {
      const scale =
        dims.width < imgWidth ? dims.width / imgWidth : dims.height / imgHeight;
      setCurrZoom(scale);
      const offsetX =
        dims.height < imgHeight ? (dims.width - imgWidth * scale) / 2 : 0;
      const offsetY =
        dims.width < imgWidth ? (dims.height - imgHeight * scale) / 2 : 0;
      layer.to({
        x: offsetX,
        y: offsetY,
        scaleX: scale,
        scaleY: scale,
        duration: 0.1,
      });
    }
    labelsToCoords();
  }

  function handleZoom100() {
    const layer = layerRef.current;
    const stage = stageRef.current;
    const dims = document.querySelector("#container")?.getBoundingClientRect();
    if (layer && stage && dims) {
      setCurrZoom(1);
      const center = {
        x: stage.width() / 2,
        y: stage.height() / 2,
      };
      const relatedTo = {
        x: (center.x - layer.x()) / layer.scaleX(),
        y: (center.y - layer.y()) / layer.scaleX(),
      };
      layer.to({
        x: center.x - relatedTo.x,
        y: center.y - relatedTo.y,
        scaleX: 1,
        scaleY: 1,
        duration: 0.1,
      });
    }
    labelsToCoords();
  }

  /* ****** ZOOM BUTTONS ABOVE ****** */

  /* ****** LABEL SELECTION AND UPDATING BELOW ****** */

  const getLabelCoords = useCallback(
    (polygon: Point[]) => {
      if (layer && stage) {
        const bottomRightPoint: Point | null =
          findBottomRightCoordinate(polygon);
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
    },
    [currZoom, layer, stage]
  );

  const labelsToCoords = useCallback(() => {
    if (layer && stage) {
      setPolygonsData((prevPolygonsData) => {
        const polygons: PolygonData[] = [];
        layer.find("Group").forEach((polygon, i) => {
          if (prevPolygonsData[i].label) {
            const polygonChanged = prevPolygonsData[i];
            polygonChanged.label.coords = getLabelCoords(polygon.attrs.points);
            polygons.push(polygonChanged);
          }
        });
        return polygons;
      });
    }
  }, [getLabelCoords, layer, stage]);

  useEffect(() => {
    labelsToCoords();
  }, [labelsToCoords, isDraggingLayer, handleChangeImage]);

  function handleLabelSelect(option: string) {
    const newLabel = {
      name: option,
      coords: getLabelCoords(draftPolygon as Point[]),
      visible: null,
    };
    setPolygonsData((prevData) => [
      ...prevData,
      { coordinates: draftPolygon, label: newLabel },
    ]);
    setDraftPolygon(null);
    setCirclesVisible((prevPolygonsVisible) => {
      return [...prevPolygonsVisible, false];
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

  /* ****** LABEL SELECTION AND UPDATING ABOVE ****** */

  /* ****** POLYGON DATA UPDATING BELOW ****** */

  function handleCirclesNotVisible() {
    setCirclesVisible((prevCirclesVisible) => {
      const newData = Array(prevCirclesVisible.length).fill(false);
      return newData;
    });
  }

  function handlePolygonClicked(index: number) {
    setCirclesVisible((prevCirclesVisible) => {
      const newData = Array(prevCirclesVisible.length).fill(false);
      newData[index] = true;
      return newData;
    });
  }

  function handlePolygonChanged(index: number, points: Point[]) {
    setPolygonsData((prevPolygonsData) => {
      const newData = [...prevPolygonsData];
      newData[index].label.coords = getLabelCoords(points);
      newData[index].coordinates = points;
      return newData;
    });
  }

  function handlePolygonDelete(index: number) {
    setPolygonsData((prevPolygonsData) => {
      const newData = [...prevPolygonsData];
      newData.splice(index, 1);
      return newData;
    });
    setCirclesVisible((prevCirclesVisible) => {
      const newData = [...prevCirclesVisible];
      newData.splice(index, 1);
      return newData;
    });
  }
  /* ****** POLYGON DATA UPDATING ABOVE ****** */

  return (
    <div>
      <Link href="/">
        <h5>other frameworks</h5>
      </Link>
      <Link href="/D3Viewer">
        <h5>to D3 Demo</h5>
      </Link>
      <Link href="./VisxViewer">
        <h5>to Visx demo</h5>
      </Link>
      <h3>Konva Demo</h3>
      <div className="headerRow">
        <button
          onClick={() => {
            setIsDrawing(!isDrawing);
            handleCirclesNotVisible();
          }}
        >
          {isDrawing ? "Stop drawing" : "Start drawing"}
        </button>
        <div>
          <button
            onClick={() => handleChangeImage("/images/maddoxdev.jpg", 10)}
            className="reset"
          >
            idk what this is tbh (this one is normal)
          </button>
          <button
            onClick={() => handleChangeImage("/images/bigimage.jpg", 0)}
            className="reset"
          >
            tractor go brrrr (this img is huge)
          </button>
          <button
            onClick={() => handleChangeImage("/images/paul.jpg", 0)}
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
          changeZoom={(zoom) => setCurrZoom(zoom)}
          stageRef={stageRef}
          layerRef={layerRef}
          isDrawing={isDrawing}
          stopDrawing={() => setIsDrawing(false)}
          draggingImage={(bool) => setIsDraggingLayer(bool)}
          polygonsData={polygonsData}
          onPolygonClicked={(index) => handlePolygonClicked(index)}
          onPolygonAdded={(points) => setDraftPolygon(points)}
          onPolygonChanged={handlePolygonChanged}
          onPolygonDeleted={handlePolygonDelete}
          divDimensions={divDimensions}
          circlesVisible={circlesVisible}
        />
        {viewLabels && (
          <div className="chips">
            {polygonsData.map((polygon, i) => {
              if (polygon.label.coords) {
                return (
                  <Chip
                    label={polygon.label.name}
                    color="primary"
                    size="small"
                    key={i}
                    sx={{
                      position: "absolute",
                      top: `${polygon.label.coords?.y}px`,
                      left: `${polygon.label.coords?.x}px`,
                      display: isLabelChipVisible(
                        polygon.label.coords.x,
                        polygon.label.coords.y
                      )
                        ? "flex"
                        : "none",
                    }}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
      <div className="footerRow">
        <div>
          <div>Current Zoom: {Math.round(currZoom * 100)}%</div>
          <div>
            <button className="fullsize" onClick={handleZoom100}>
              Zoom to 100%
            </button>
            <button
              className="fit-container"
              onClick={() =>
                imgDimensions
                  ? handleZoomFitContainer(
                      imgDimensions?.width!,
                      imgDimensions?.height!
                    )
                  : null
              }
            >
              Fit to container
            </button>
          </div>
        </div>
        <button onClick={() => setViewLabels(!viewLabels)}>
          {viewLabels ? "Hide Labels" : "View Labels"}
        </button>
      </div>
      <FormDialog
        dialogueOpen={draftPolygon != null}
        onLabelSelect={handleLabelSelect}
      />
      <ul className={styles.li}>
        {polygonsData.map((polygon, i) => (
          <li key={i}>
            <h3>
              polygon {i}: {polygon.label.name}{" "}
            </h3>
            {polygon.coordinates?.map((coords, j) => (
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
