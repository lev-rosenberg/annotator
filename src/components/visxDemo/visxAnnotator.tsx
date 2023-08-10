import React, { useRef, RefObject, useState, useEffect, Dispatch } from "react";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import {
  convertImgDimsToSvgCoordinates,
  convertSvgCoordinatesToImgDims,
} from "./utilities";
import { PolygonDrawer } from "./visxPolygon";
import { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";

import { PolylineDrawer } from "./visxPolyline";
import { Point, PolygonData, Dims } from "../../types/annotatorTypes";
import styles from "../../styles/svgAnnotator.module.css";
import { initialize } from "next/dist/server/lib/render-server";

interface annotatorProps {
  groupRef: RefObject<SVGSVGElement>;
  currImage: string;
  divDimensions: Dims | undefined;
  imgDimensions: Dims | undefined;
  currZoom: number;
  polygonsData: PolygonData[];
  isDrawing: boolean;
  polygonDragging: boolean;
  onPolygonDrag: (bool: boolean) => void;
  onZoomPan: (bool: boolean) => void;
  setCurrZoom: Dispatch<number>;
  onPolygonAdded: (points: Point[]) => void;
  onPolygonChanged: (index: number, points: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
  zoom: ProvidedZoom<SVGSVGElement> & any;
  fitOnLoad: (width: number, height: number) => void;
  polygonsEditable: boolean[];
  onPolygonClicked: (index: number) => void;
}

export default function VisxAnnotator(props: annotatorProps) {
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point>();

  const imgRef = useRef<SVGImageElement | null>(null);
  const groupRef = props.groupRef;

  const containerWidth = props.divDimensions?.width;
  const containerHeight = props.divDimensions?.height;
  const imgWidth = props.imgDimensions?.width;
  const imgHeight = props.imgDimensions?.height;

  const zoom = props.zoom;

  /* ********* POLYLINE DRAWING FUNCTIONS BELOW ********* */

  useEffect(() => {
    const onPageLoad = () => {
      props.fitOnLoad(imgWidth!, imgHeight!);
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  function handleDrawPolylineOnClick(
    e: React.MouseEvent<SVGElement, MouseEvent>
  ) {
    const mouse = localPoint(e);
    if (mouse) {
      const propPoint = convertSvgCoordinatesToImgDims(mouse, groupRef);

      if (!isClosingPolygon(mouse) && propPoint) {
        setPolylinePoints((prevPolylinePoints) => [
          ...prevPolylinePoints,
          propPoint,
        ]);
      } else {
        props.onPolygonAdded(polylinePoints);
        setPolylinePoints([]);
      }
    }
  }

  function isClosingPolygon(point: Point) {
    if (polylinePoints.length >= 3) {
      const propPoint = convertSvgCoordinatesToImgDims(point, groupRef);
      if (
        Math.abs(polylinePoints[0].x - propPoint.x) <=
          7 / parseFloat(groupRef.current?.getAttribute("scale")!) &&
        Math.abs(polylinePoints[0].y - propPoint.y) <=
          7 / parseFloat(groupRef.current?.getAttribute("scale")!)
      ) {
        return true;
      }
    }
    return false;
  }

  function handleMouseMove(e: React.MouseEvent<SVGElement, MouseEvent>) {
    const pointer = localPoint(e);
    if (pointer && !isClosingPolygon(pointer)) {
      setMousePos(pointer);
    } else {
      const snap = convertImgDimsToSvgCoordinates(polylinePoints[0], groupRef);
      setMousePos(snap);
    }
  }

  /* ********* POLYLINE DRAWING FUNCTIONS ABOVE ********* */

  return (
    <>
      <svg
        className={styles.svg}
        width={containerWidth}
        height={containerHeight}
        ref={!props.polygonDragging ? zoom.containerRef : null}
        style={{
          cursor: zoom.isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onMouseMove={(e) => {
          handleMouseMove(e);
          if (zoom.isDragging) {
            props.onZoomPan(true);
          }
        }}
      >
        <Group
          transform={zoom.toString()}
          innerRef={groupRef}
          x={zoom.transformMatrix.translateX}
          y={zoom.transformMatrix.translateY}
          scale={zoom.transformMatrix.scaleX}
          style={{
            cursor: props.isDrawing
              ? "crosshair"
              : zoom.isDragging
              ? "grabbing"
              : "grab",
          }}
          onClick={(e) => {
            e.stopPropagation();

            if (!zoom.isDragging && props.isDrawing) {
              handleDrawPolylineOnClick(e);
            }
          }}
        >
          <>
            <image className={styles.img} href={props.currImage} ref={imgRef} />
            {polylinePoints.length && (
              <PolylineDrawer
                groupRef={groupRef}
                polylinePoints={polylinePoints}
                mousePos={mousePos}
                zoom={zoom}
              />
            )}
            {props.polygonsData.map((polygon, i) => (
              <PolygonDrawer
                i={i}
                key={i}
                width={containerWidth ? containerWidth : 100}
                height={containerHeight ? containerHeight : 100}
                zoom={zoom}
                imgOriginalDims={props.imgDimensions}
                polygon={polygon}
                onPolygonChanged={props.onPolygonChanged}
                onPolygonDeleted={props.onPolygonDeleted}
                groupRef={groupRef}
                polygonDragging={props.polygonDragging}
                onPolygonDrag={props.onPolygonDrag}
                onPolygonClicked={props.onPolygonClicked}
                polygonsEditable={props.polygonsEditable}
              />
            ))}
          </>
        </Group>
      </svg>
    </>
  );
}
