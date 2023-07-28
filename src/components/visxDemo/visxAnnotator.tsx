import React, { useRef, RefObject, useEffect, useState, Dispatch } from "react";
import { LinePath, Line, Circle } from "@visx/shape";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import { Point, PolygonData, Dims } from "../../types/annotatorTypes";
import * as d3Zoom from "d3-zoom";
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
  const [mousePos, setMousePos] = useState<Point>();
  const imgRef = useRef<SVGImageElement | null>(null);
  const groupRef = useRef<SVGSVGElement | null>(null);

  /* ********* COORDINATE SYSTEM CONVERSION BELOW ********* */

  function convertImgDimsToSvgCoordinates(imgCoords: Point) {
    const zoom = parseFloat(groupRef.current?.getAttribute("scale")!);
    const x = parseFloat(groupRef.current?.getAttribute("x")!);
    const y = parseFloat(groupRef.current?.getAttribute("y")!);
    const svgCoords = {
      x: imgCoords.x * zoom + x,
      y: imgCoords.y * zoom + y,
    };
    return svgCoords;
  }

  function convertSvgCoordinatesToImgDims(svgCoords: Point) {
    /* 
      Converts the absolute coordinates of the mouse cursor (mouseCoords) to proportional coordinates
      relative to the original dimenseions of image displayed––not the dimsensions of the SVG coordinate system.
      
      ex. if the original image has a width of 1000, but within the SVG system it had a width of 752
      and you click on the far right of the image, this function will return a point with an x value near 1000.
    */

    const zoom = parseFloat(groupRef.current?.getAttribute("scale")!);
    const x = parseFloat(groupRef.current?.getAttribute("x")!);
    const y = parseFloat(groupRef.current?.getAttribute("y")!);
    const imgDims = {
      x: (svgCoords.x - x) / zoom,
      y: (svgCoords.y - y) / zoom,
    };
    return imgDims;
  }

  /* ********* COORDINATE SYSTEM CONVERSION ABOVE ********* */

  /* ********* POLYLINE DRAWING BELOW ********* */

  function handleDrawPolylineOnClick(e) {
    const mouse = localPoint(e);
    if (mouse) {
      const prop = convertSvgCoordinatesToImgDims(mouse);

      if (!isClosingPolygon(mouse) && prop) {
        setPolylinePoints((prevPolylinePoints) => [
          ...prevPolylinePoints,
          prop,
        ]);
      } else {
        props.onPolygonAdded(polylinePoints);
        setPolylinePoints([]);
      }
    }
  }

  function isClosingPolygon(point: Point) {
    if (polylinePoints.length >= 3) {
      const propPoint = convertSvgCoordinatesToImgDims(point);
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

  function handleMouseMove(e) {
    // if (polylinePoints.length > 0) {
    const pointer = localPoint(e);
    if (pointer && !isClosingPolygon(pointer)) {
      setMousePos(pointer);
    } else {
      const snap = convertImgDimsToSvgCoordinates(polylinePoints[0]);
      setMousePos(snap);
    }
    // }
  }

  function polylineToMouse() {
    const start: Point | undefined = polylinePoints.at(-1);
    if (polylinePoints.length > 0 && mousePos && start) {
      const end: Point = convertSvgCoordinatesToImgDims(mousePos);
      return [start, end];
    } else {
      return [];
    }
  }

  /* ********* POLYLINE DRAWING ABOVE ********* */

  function PolygonsDrawer({ points, key, scale }: PolygonProps) {
    return (
      <Group>
        <LinePath
          data={points ? [...points, points[0]] : []}
          // id={key.toString()}
          stroke="red"
          strokeWidth={3 / scale}
          x={(d) => d.x}
          y={(d) => d.y}
        />
        {points?.map((pt) => (
          <Circle
            key={key}
            cx={pt.x}
            cy={pt.y}
            r={7 / scale}
            fill="red"
            opacity={0.5}
          />
        ))}
      </Group>
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
          onWheel={() => {
            props.setCurrZoom(zoom.transformMatrix.scaleX);
          }}
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
            onMouseMove={handleMouseMove}
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
              <Line // this is the line from the end of the polyline to my mouse as you draw
                from={polylinePoints.at(-1)}
                to={polylineToMouse()[1]}
                strokeWidth={3 / zoom.transformMatrix.scaleX}
                stroke="red"
              />
              <LinePath
                data={polylinePoints}
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
