import React, { useRef, RefObject, useEffect, useState, Dispatch } from "react";
import { LinePath, Line, Circle, Polygon } from "@visx/shape";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import { Drag } from "@visx/drag";
import {
  convertPolygonPoints,
  convertImgDimsToSvgCoordinates,
  convertSvgCoordinatesToImgDims,
} from "./utilities";
import { Point, PolygonData, Dims } from "../../types/annotatorTypes";
import styles from "../../styles/svgAnnotator.module.css";

interface annotatorProps {
  currImage: string;
  divDimensions: Dims | undefined;
  imgOriginalDims: Dims | undefined;
  currZoom: number;
  polygonsData: PolygonData[];
  isDrawing: boolean;
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

  const [polygonDragging, setPolygonDragging] = useState<boolean>(false);

  const width = props.divDimensions ? props.divDimensions.width! : 100;
  const height = props.divDimensions ? props.divDimensions.height! : 100;

  const initialTransform = {
    scaleX: 0.15,
    scaleY: 0.15,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  };
  /* ********* POLYLINE DRAWING BELOW ********* */

  function handleDrawPolylineOnClick(
    e: React.MouseEvent<SVGElement, MouseEvent>
  ) {
    const mouse = localPoint(e);
    if (mouse) {
      const prop = convertSvgCoordinatesToImgDims(mouse, groupRef);

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
    // if (polylinePoints.length > 0) {
    const pointer = localPoint(e);
    if (pointer && !isClosingPolygon(pointer)) {
      setMousePos(pointer);
    } else {
      const snap = convertImgDimsToSvgCoordinates(polylinePoints[0], groupRef);
      setMousePos(snap);
    }
    // }
  }

  function polylineToMouse() {
    const start: Point | undefined = polylinePoints.at(-1);
    if (polylinePoints.length > 0 && mousePos && start) {
      const end: Point = convertSvgCoordinatesToImgDims(mousePos, groupRef);
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
    zoom: number,
    polygonCoords: Point[] | null
  ) {
    const vertices = Array.from(e.currentTarget.children).slice(1);
    const polygon = e.currentTarget.firstElementChild;
    dx /= zoom;
    dy /= zoom;
    if (vertices && polygon && polygonCoords) {
      const newPoints = polygonCoords.map((pt, i) => {
        vertices[i].setAttribute("cx", (pt.x + dx).toString());
        vertices[i].setAttribute("cy", (pt.y + dy).toString());
        return { x: pt.x + dx, y: pt.y + dy };
      });
      polygon.setAttribute(
        "points",
        convertPolygonPoints(newPoints).toString()
      );
    }
  }

  function handlePolygonDragEnd(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    zoom: number,
    polygonCoords: Point[] | null
  ) {
    const index = parseInt(e.currentTarget.id);
    dx /= zoom;
    dy /= zoom;
    if (polygonCoords) {
      const newPoints = polygonCoords.map((pt) => {
        return { x: pt.x + dx, y: pt.y + dy };
      });
      props.onPolygonChanged(index, newPoints);
    }
  }

  function handleVertexDragMove(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    zoom: number,
    polygonCoords: Point[] | null
  ) {
    const polygon = e.currentTarget.parentNode?.firstElementChild;
    if (polygonCoords && polygon) {
      dx /= zoom;
      dy /= zoom;
      const c_index = parseInt(e.currentTarget.id);
      const { x, y } = polygonCoords[c_index];
      e.currentTarget.setAttribute("cx", (x + dx).toString());
      e.currentTarget.setAttribute("cy", (y + dy).toString());

      const newPoints = [...polygonCoords];
      newPoints[c_index] = { x: x + dx, y: y + dy };
      polygon.setAttribute(
        "points",
        convertPolygonPoints(newPoints).toString()
      );
    }
  }

  function handleVertexDragEnd(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    zoom: number,
    polygonCoords: Point[] | null
  ) {
    const polygon = e.currentTarget.parentElement;
    if (polygon) {
      const p_index = parseInt(polygon.id);
      const c_index = parseInt(e.currentTarget.id);

      dx /= zoom;
      dy /= zoom;
      if (polygonCoords) {
        const newPoints = [...polygonCoords];
        const { x, y } = polygonCoords[c_index];

        newPoints[c_index] = { x: x + dx, y: y + dy };
        console.log(newPoints);
        props.onPolygonChanged(p_index, newPoints);
      }
    }
  }

  function handlePolygonDelete(e: React.MouseEvent<SVGElement, MouseEvent>) {
    e.preventDefault();
    const p_index = parseInt(e.currentTarget.id);
    props.onPolygonDeleted(p_index);
  }
  return (
    <Zoom<SVGSVGElement>
      width={width}
      height={height}
      initialTransformMatrix={initialTransform}
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
          ref={!polygonDragging ? zoom.containerRef : null}
          style={{
            cursor: zoom.isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onWheel={() => {
            props.setCurrZoom(zoom.transformMatrix.scaleX);
          }}
        >
          <Group
            width={props.imgOriginalDims?.width! * zoom.transformMatrix.scaleX}
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
              !zoom.isDragging && props.isDrawing
                ? handleDrawPolylineOnClick(e)
                : null;
            }}
            onMouseMove={handleMouseMove}
          >
            <>
              <image
                className={styles.img}
                href={props.currImage}
                ref={imgRef}
              />
              {polylinePoints.length && (
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
              )}

              {props.polygonsData.map((polygon, i) => (
                <Drag
                  key={i}
                  width={width}
                  height={height}
                  resetOnStart
                  restrict={{
                    xMin: zoom.transformMatrix.translateX,
                    xMax:
                      zoom.transformMatrix.translateX +
                      props.imgOriginalDims?.width! *
                        zoom.transformMatrix.scaleX,
                    yMin: zoom.transformMatrix.translateY,
                    yMax:
                      zoom.transformMatrix.translateY +
                      props.imgOriginalDims?.height! *
                        zoom.transformMatrix.scaleX,
                  }}
                >
                  {({ dragStart, dragEnd, dragMove, dx, dy }) => (
                    <Group
                      key={i}
                      id={i.toString()}
                      onMouseDown={(e) => {
                        if (e.button == 0) {
                          e.stopPropagation();
                          dragStart(e);

                          setPolygonDragging(true);
                        }
                      }}
                      onMouseMove={(e) => {
                        e.stopPropagation();

                        if (polygonDragging) {
                          dragMove(e);
                          handlePolygonDragMove(
                            e,
                            dx,
                            dy,
                            zoom.transformMatrix.scaleX,
                            polygon.coordinates
                          );
                        }
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        dragEnd(e);
                        handlePolygonDragEnd(
                          e,
                          dx,
                          dy,
                          zoom.transformMatrix.scaleX,
                          polygon.coordinates
                        );
                        setPolygonDragging(false);
                      }}
                      onContextMenuCapture={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePolygonDelete(e);
                      }}
                    >
                      <Polygon
                        points={convertPolygonPoints(polygon.coordinates)}
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
                          id={i.toString()}
                          cx={pt.x}
                          cy={pt.y}
                          r={7 / zoom.transformMatrix.scaleX}
                          fill="red"
                          opacity={0.5}
                          style={{
                            cursor: "crosshair",
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            dragStart(e);
                            console.log(e.currentTarget);
                            setPolygonDragging(true);
                          }}
                          onMouseMove={(e) => {
                            e.stopPropagation();

                            if (polygonDragging) {
                              dragMove(e);
                              handleVertexDragMove(
                                e,
                                dx,
                                dy,
                                zoom.transformMatrix.scaleX,
                                polygon.coordinates
                              );
                            }
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation();
                            dragEnd(e);
                            handleVertexDragEnd(
                              e,
                              dx,
                              dy,
                              zoom.transformMatrix.scaleX,
                              polygon.coordinates
                            );
                            setPolygonDragging(false);
                          }}
                        />
                      ))}
                    </Group>
                  )}
                </Drag>
              ))}
            </>
          </Group>
        </svg>
      )}
    </Zoom>
  );
}
