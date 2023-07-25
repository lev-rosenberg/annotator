import React, { useRef, useEffect, useCallback, useState } from "react";
import { fromJson, customJson } from "../components/toFromJson";
import Link from "next/link";
import { D3ZoomPan } from "../components/d3demo/d3ZoomPan";
import { PolylineDrawer } from "../components/d3demo/d3Polyline";
import { PolygonsDrawer } from "../components/d3demo/d3Polygons";
import { D3Labels } from "../components/d3demo/d3Labels";
import { getProportionalCoords } from "../components/d3demo/utilities";

import FormDialog from "../components/labelPopup";
import styles from "../styles/svgAnnotator.module.css";
import Chip from "@mui/material/Chip";
import * as d3 from "d3";
import { Dims, LabelData, Point, PolygonData } from "../types/annotatorTypes";

export default function D3Viewer(): JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const imgRef = useRef<SVGImageElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isZoomingOrPanning, setIsDraggingLayer] = useState<boolean>(false);
  const [draftPolygon, setDraftPolygon] = useState<Point[] | null>(null);

  const [polygonsData, setPolygonsData] = useState<PolygonData[]>([]);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [imgDimensions, setImgDimensions] = useState<Dims | undefined>();
  const [divDimensions, setDivDimensions] = useState<Dims | undefined>();
  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");

  let t: d3.ZoomTransform; //the state of the zoom and pan of the svg
  svgRef.current
    ? (t = d3.zoomTransform(svgRef.current))
    : (t = d3.zoomIdentity);

  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = "/images/maddoxdev.jpg";
    handleResize();

    if ((img.naturalWidth, img.naturalHeight)) {
      const jsonData = customJson(0, img.naturalWidth, img.naturalHeight);
      setPolygonsData(jsonData);
    }
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let scaleFactor = 1;
  if (divDimensions && imgDimensions) {
    scaleFactor = 1 / (divDimensions?.width / imgDimensions?.width);
  }

  function handleResize() {
    setDivDimensions({
      width: divRef.current?.clientWidth,
      height: divRef.current?.clientHeight,
    });
  }

  function handleChangeImage(image: string, num: number) {
    setCurrImage(image);
    setIsDrawing(false);
    const img = new Image();
    img.onload = function () {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      const jsonData = customJson(num, img.naturalWidth, img.naturalHeight);
      setPolygonsData(jsonData);
      scaleFactor = 1 / (divDimensions?.width / imgDimensions?.width);
    };
    img.src = image;
  }

  function handleLabelSelect(option: string) {
    const newLabel = {
      name: option,
      coords: getLabelCoords(draftPolygon as Point[]),
      visible: !isZoomingOrPanning ? true : false,
    };
    setPolygonsData((prevData) => [
      ...prevData,
      { coordinates: draftPolygon, label: newLabel },
    ]);
    setIsDrawing(false);
    setDraftPolygon(null);
  }

  function handlePolygonChanged(index: number, points: Point[]) {
    setPolygonsData((prevPolygonsData) => {
      const newData = [...prevPolygonsData];
      newData[index].coordinates = points;
      newData[index].label.coords = getLabelCoords(points);
      return newData;
    });
  }

  function handlePolygonDeleted(index: number) {
    setPolygonsData((prevPolygonsData) => {
      const newData = [...prevPolygonsData];
      newData.splice(index, 1);
      return newData;
    });
  }

  /* LABELS */

  function findBottomRightCoordinate(coordinates: Point[]): Point {
    let currCoord: Point = coordinates[0];

    for (const coord of coordinates) {
      if (coord.y > currCoord.y) {
        currCoord = coord;
      }
    }
    return currCoord;
  }

  const getLabelCoords = useCallback(
    (polygon: Point[]) => {
      console.log("hi");

      if (svgRef.current) {
        const bottomRightPoint: Point | null =
          findBottomRightCoordinate(polygon);
        const proportional = t.apply([bottomRightPoint.x, bottomRightPoint.y]);
        return {
          x: proportional[0] + 25,
          y: proportional[1] + 25,
        };
      } else {
        return null;
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentZoom, t, isZoomingOrPanning, currImage]
  );

  useEffect(() => {
    setPolygonsData((prevPolygonsData) => {
      const polygons: PolygonData[] = [];
      prevPolygonsData.forEach((polygon, i) => {
        if (polygon.coordinates) {
          polygon.label.coords = getLabelCoords(polygon.coordinates);
          polygons.push(polygon);
        }
      });
      return polygons;
    });
  }, [getLabelCoords]);

  return (
    <div>
      <Link href="/">
        <h5>other frameworks</h5>
      </Link>
      <Link href="/KonvaViewer">
        <h5>to Konva Demo</h5>
      </Link>
      <h3>D3 Annotator demo</h3>
      <div>
        <div className="headerRow">
          <button onClick={() => setIsDrawing(!isDrawing)}>
            {isDrawing ? "Stop drawing" : "Start drawing"}
          </button>
          <div>
            <button
              onClick={() => handleChangeImage("/images/maddoxdev.jpg", 0)}
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
              onClick={() => handleChangeImage("/images/bottles.jpg", 50)}
              className="reset"
            >
              shampoo (this one has lots o' polygons)
            </button>
          </div>
        </div>
        <div
          ref={divRef}
          style={{
            position: "relative",
            maxWidth: "85vw",
            margin: "auto",
            overflowY: "clip",
          }}
        >
          <svg
            ref={svgRef}
            className={styles.svg}
            id="parent"
            width="100%"
            viewBox={
              "0 0 " + `${imgDimensions?.width} ${imgDimensions?.height}`
            } // s
          >
            <image
              href={currImage}
              ref={imgRef}
              width="100%"
              className={styles.img}
            />
          </svg>

          {polygonsData.map((polygon, i) => {
            return (
              <Chip
                label={polygon.label.name}
                color="primary"
                size="small"
                key={i}
                sx={{
                  position: "absolute",
                  top: `${polygon.label.coords?.y / scaleFactor}px`,
                  left: `${polygon.label.coords?.x / scaleFactor}px`,
                  display: polygon.label.visible ? "flex" : "none",
                }}
              />
            );
          })}
          <PolylineDrawer
            svgElement={svgRef}
            scaleFactor={scaleFactor}
            isDrawing={isDrawing}
            onPolygonAdded={(points) => setDraftPolygon(points)}
          />
          <PolygonsDrawer
            svgElement={svgRef}
            scaleFactor={scaleFactor}
            isDrawing={isDrawing}
            onPolygonChanged={handlePolygonChanged}
            onPolygonDeleted={handlePolygonDeleted}
            polygonsData={polygonsData}
          />
          <D3ZoomPan
            svgElement={svgRef}
            isDrawing={isDrawing}
            draftPolygon={draftPolygon}
            polygonsData={polygonsData}
            setCurrentZoom={setCurrentZoom}
            setIsDraggingLayer={(bool) => setIsDraggingLayer(bool)}
            scaleFactor={scaleFactor}
          />
          <D3Labels
            svgElement={svgRef}
            polygonsData={polygonsData}
            currentZoom={currentZoom}
          />
          <FormDialog
            dialogueOpen={draftPolygon != null}
            onLabelSelect={(option) => handleLabelSelect(option)}
          />
        </div>
        <div className="footerRow">
          <div>Current Zoom: {Math.round(currentZoom * 100)}%</div>
          <div>
            <button className="reset">Fit to container</button>
            <button className="fullsize">Zoom to 100%</button>
          </div>
        </div>
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
    </div>
  );
}