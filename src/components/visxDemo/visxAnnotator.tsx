import React, { useRef, RefObject, useEffect, useState, Dispatch } from "react";
import { LinePath, Line, Circle, Polygon } from "@visx/shape";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import { Drag } from "@visx/drag";
import { convertPoints } from "./utilities";

import { Point, PolygonData, Dims } from "../../types/annotatorTypes";

import styles from "../../styles/svgAnnotator.module.css";
import { drag } from "d3-drag";

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
  const dragRef = useRef();

  const width = props.divDimensions ? props.divDimensions.width! : 100;
  const height = props.divDimensions ? props.divDimensions.height! : 100;

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

  function handleDrawPolylineOnClick(
    e: React.MouseEvent<SVGElement, MouseEvent>
  ) {
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

  function handleMouseMove(e: React.MouseEvent<SVGElement, MouseEvent>) {
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

  /* ********* DRAGGING HANDLERS BELOW ********* */

  function handlePolygonDragMove(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    polygonCoords: Point[] | null
  ) {
    const index = parseInt(e.currentTarget.id);
    const vertices = Array.from(e.currentTarget.children).slice(1);
    const polyline = e.currentTarget.firstElementChild;
    let newPoints: Point[] = [];

    if (vertices && polyline && polygonCoords) {
      polygonCoords.map((pt, i) => {
        vertices[i].setAttribute("cx", (pt.x + dx).toString());
        vertices[i].setAttribute("cy", (pt.y + dy).toString());
        newPoints.push({ x: pt.x + dx, y: pt.y + dy });
      });
      polyline.setAttribute("points", convertPoints(newPoints).toString());
    }
  }

  function handlePolygonDragEnd(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    polygonCoords: Point[] | null
  ) {
    const index = parseInt(e.currentTarget.id);
    let newPoints: Point[] = [];
    if (polygonCoords) {
      polygonCoords.map((pt) => {
        newPoints.push({ x: pt.x + dx, y: pt.y + dy });
      });
      props.onPolygonChanged(index, newPoints);
    }
  }

  return (
    <Zoom<SVGSVGElement>
      width={width}
      height={height}
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
          // ref={zoom.containerRef}
          style={{
            cursor: zoom.isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
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
            onMouseDown={(e) => {
              e.stopPropagation();
              handleDrawPolylineOnClick(e);
            }}
            onMouseMove={handleMouseMove}
          >
            <>
              <image
                className={styles.img}
                href={props.currImage}
                ref={imgRef}
              />
              <Group>
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
              </Group>

              {props.polygonsData.map((polygon, i) => (
                <Drag key={i} width={width} height={height} resetOnStart>
                  {({ dragStart, dragEnd, dragMove, isDragging, dx, dy }) => (
                    <Group
                      key={i}
                      id={i.toString()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        dragStart(e);
                      }}
                      onMouseMove={(e) => {
                        if (isDragging) {
                          dragMove(e);
                          handlePolygonDragMove(e, dx, dy, polygon.coordinates);
                        }
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        dragEnd(e);
                        handlePolygonDragEnd(e, dx, dy, polygon.coordinates);
                      }}
                    >
                      <Polygon
                        points={convertPoints(polygon.coordinates)}
                        style={{
                          cursor: "move",
                        }}
                        fill="transparent"
                        stroke="red"
                        strokeWidth={3 / zoom.transformMatrix.scaleX}
                      />
                      {polygon.coordinates?.map((pt, i) => (
                        <Circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r={7 / zoom.transformMatrix.scaleX}
                          fill="red"
                          opacity={0.5}
                          style={{
                            cursor: "crosshair",
                          }}
                        />
                      ))}
                      <rect width={width} height={height} fill="transparent" />
                    </Group>
                  )}
                </Drag>
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
