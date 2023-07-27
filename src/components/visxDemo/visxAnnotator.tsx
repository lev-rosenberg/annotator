import React, { useRef, RefObject, useEffect, useState, Dispatch } from "react";
import { LinePath, Line, Circle } from "@visx/shape";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import { Point, PolygonData, Dims } from "../../types/annotatorTypes";
import { VisxPolyline } from "./visxPolyline";
import styles from "../../styles/svgAnnotator.module.css";
import { PolygonsDrawer } from "../d3demo/d3Polygons";

interface annotatorProps {
  currImage: string;
  divDimensions: Dims | undefined;
  imgOriginalDims: Dims | undefined;
  currZoom: number;
  polygonsData: PolygonData[];
  setCurrZoom: Dispatch<number>;
  onPolygonAdded: (points: Point[]) => void;
  onPolygonChanged: (index: number, points: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
}
interface PolygonProps {
  points: Point[] | null;
  key: number;
  scale: number;
}
export function VisxAnnotator(props: annotatorProps) {
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);
  const [fauxPolylinePoints, setFauxPolylinePoints] = useState<Point[]>([]);
  const imgRef = useRef<SVGImageElement | null>(null);
  const groupRef = useRef<SVGSVGElement | null>(null);

  /* ********* COORDINATE SYSTEM CONVERSION BELOW ********* */

  function getProportionalCoordsToImgOriginal(mouseCoords: Point) {
    if (groupRef.current && props.imgOriginalDims) {
      const zoom = parseFloat(groupRef.current?.getAttribute("scale")!);
      const x = parseFloat(groupRef.current?.getAttribute("x")!);
      const y = parseFloat(groupRef.current?.getAttribute("y")!);
      const { width } = groupRef.current?.getBBox();
      const windowScale = width / props.imgOriginalDims.width!;
      const proportional = {
        x: (mouseCoords.x - x) / (windowScale * zoom),
        y: (mouseCoords.y - y) / (windowScale * zoom),
      };
      return proportional;
    } else {
      return null;
    }
  }

  function getProportionalCoordsToImgRelative(mouseCoords: Point) {
    const zoom = parseFloat(groupRef.current?.getAttribute("scale")!);
    const x = parseFloat(groupRef.current?.getAttribute("x")!);
    const y = parseFloat(groupRef.current?.getAttribute("y")!);
    const proportional = {
      x: (mouseCoords.x - x) / zoom,
      y: (mouseCoords.y - y) / zoom,
    };
    return proportional;
  }

  /* ********* COORDINATE SYSTEM CONVERSION ABOVE ********* */

  /* ********* POLYLINE DRAWING BELOW ********* */

  function handleDrawPolylineOnClick(e: MouseEvent) {
    const mouse = localPoint(e);
    if (mouse) {
      const faux = getProportionalCoordsToImgRelative(mouse);
      const original = getProportionalCoordsToImgOriginal(mouse)!;
      if (!isClosingPolygon(mouse)) {
        setPolylinePoints((prevPolylinePoints) => [
          ...prevPolylinePoints,
          original,
        ]);
        setFauxPolylinePoints((prevFauxPolylinePoints) => [
          ...prevFauxPolylinePoints,
          faux,
        ]);
      } else {
        // console.log(fauxPolylinePoints);
        props.onPolygonAdded(polylinePoints);
        setPolylinePoints([]);
        setFauxPolylinePoints([]);
      }
    }
  }

  function isClosingPolygon(point: Point) {
    if (fauxPolylinePoints.length >= 3) {
      const propPoint = getProportionalCoordsToImgRelative(point);
      if (
        Math.abs(fauxPolylinePoints[0].x - propPoint.x) <=
          7 / parseFloat(groupRef.current?.getAttribute("scale")!) &&
        Math.abs(fauxPolylinePoints[0].y - propPoint.y) <=
          7 / parseFloat(groupRef.current?.getAttribute("scale")!)
      ) {
        console.log(fauxPolylinePoints[0].x - propPoint.x);
        console.log(parseFloat(groupRef.current?.getAttribute("scale")!));
        return true;
      }
    }
    return false;
  }

  /* ********* POLYLINE DRAWING ABOVE ********* */

  function PolygonsDrawer({ points, key, scale }: PolygonProps) {
    return (
      <LinePath
        data={points ? [...points, points[0]] : []}
        // id={key.toString()}
        stroke="red"
        strokeWidth={3 / scale}
        x={(d) => d.x}
        y={(d) => d.y}
        onMouseEnter={() => console.log("ur inside me")}
      />
    );
  }

  return (
    <Zoom<SVGSVGElement>
      width={props.divDimensions ? props.divDimensions.width! : 100}
      height={props.divDimensions ? props.divDimensions.height! : 100}
      scaleXMin={1 / 20}
      scaleXMax={10}
      scaleYMin={1 / 20}
      scaleYMax={10}
    >
      {(zoom) => (
        <svg
          className={styles.svg}
          width="100%"
          height="100%"
          ref={zoom.containerRef}
          touch-action="none"
          onWheel={() => props.setCurrZoom(zoom.transformMatrix.scaleX)}
        >
          <Group
            width="100%"
            transform={zoom.toString()}
            innerRef={groupRef}
            x={zoom.transformMatrix.translateX}
            y={zoom.transformMatrix.translateY}
            scale={zoom.transformMatrix.scaleX}
            onClick={(e) => {
              handleDrawPolylineOnClick(e);
            }}
          >
            <>
              <image
                className={styles.img}
                href={props.currImage}
                ref={imgRef}
                onDragStart={zoom.dragStart}
                onDrag={zoom.dragMove}
                onDragEnd={zoom.dragEnd}
              />
              <LinePath
                data={fauxPolylinePoints}
                stroke="red"
                strokeWidth={3 / zoom.transformMatrix.scaleX}
                x={(d) => d.x}
                y={(d) => d.y}
              />
              {props.polygonsData.map((polygon, i) => (
                <PolygonsDrawer
                  points={polygon.coordinates}
                  key={i}
                  scale={zoom.transformMatrix.scaleX}
                />
              ))}
              {/* <VisxPolyline
                scale={zoom.transformMatrix.scaleX}
                getPropToOriginal={(pt: Point) =>
                  getProportionalCoordsToImgOriginal(pt, props.imgOriginalDims)
                }
                getPropToRelative={(pt: Point) =>
                  getProportionalCoordsToImgRelative(pt)
                }
                onPolygonAdded={(points: Point[]) =>
                  props.onPolygonAdded(points)
                }
                groupRef={groupRef}
              /> */}
            </>
          </Group>
        </svg>
      )}
    </Zoom>
  );
}
