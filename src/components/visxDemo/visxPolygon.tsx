import { Drag } from "@visx/drag";
import { Group } from "@visx/group";
import { Polygon, Circle } from "@visx/shape";
import { RefObject } from "react";
import { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";
import { Point, Dims, PolygonData } from "../../types/annotatorTypes";

import { convertPolygonPoints } from "./utilities";

interface polygonProps {
  i: number;
  width: number;
  height: number;
  zoom: ProvidedZoom<SVGSVGElement> & any;
  imgOriginalDims: Dims | undefined;
  polygon: PolygonData;
  onPolygonChanged: (index: number, points: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
  polygonDragging: boolean;
  onPolygonDrag: (bool: boolean) => void;
  groupRef: RefObject<SVGSVGElement>;
  onPolygonClicked: (index: number) => void;
  polygonsEditable: boolean[];
}

export function PolygonDrawer(props: polygonProps) {
  const zoom = props.zoom;
  const i = props.i;

  function handlePolygonDragMove(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    scale: number,
    polygonCoords: Point[] | null
  ) {
    const vertices = Array.from(e.currentTarget.children).slice(1);
    const polygon = e.currentTarget.firstElementChild;
    dx /= scale;
    dy /= scale;
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
    scale: number,
    polygonCoords: Point[] | null
  ) {
    const index = parseInt(e.currentTarget.id);
    dx /= scale;
    dy /= scale;
    if (polygonCoords) {
      const newPoints: Point[] = polygonCoords.map((pt) => {
        return { x: pt.x + dx, y: pt.y + dy };
      });
      props.onPolygonChanged(index, newPoints);
    }
  }

  function handleVertexDragMove(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    scale: number,
    polygonCoords: Point[] | null
  ) {
    const polygon = e.currentTarget.parentNode?.firstElementChild;
    if (polygonCoords && polygon) {
      dx /= scale;
      dy /= scale;
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
    scale: number,
    polygonCoords: Point[] | null
  ) {
    const polygon = e.currentTarget.parentElement;
    if (polygon) {
      const p_index = parseInt(polygon.id);
      const c_index = parseInt(e.currentTarget.id);
      dx /= scale;
      dy /= scale;
      if (polygonCoords) {
        const newPoints = [...polygonCoords];
        const { x, y } = polygonCoords[c_index];

        newPoints[c_index] = { x: x + dx, y: y + dy };
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
    <Drag
      key={i}
      width={props.width}
      height={props.height}
      resetOnStart
      restrict={{
        xMin: zoom.transformMatrix.translateX,
        xMax:
          zoom.transformMatrix.translateX +
          props.imgOriginalDims?.width! * zoom.transformMatrix.scaleX,
        yMin: zoom.transformMatrix.translateY,
        yMax:
          zoom.transformMatrix.translateY +
          props.imgOriginalDims?.height! * zoom.transformMatrix.scaleX,
      }}
    >
      {({ dragStart, dragEnd, dragMove, isDragging, dx, dy }) => (
        <Group
          key={i}
          id={i.toString()}
          onClick={() => props.onPolygonClicked(i)}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (e.button == 0 && props.polygonsEditable[i]) {
              dragStart(e);
            }
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            if (isDragging) {
              handlePolygonDragMove(
                e,
                dx,
                dy,
                zoom.transformMatrix.scaleX,
                props.polygon.coordinates
              );
              dragMove(e);
              props.onPolygonDrag(true);
            }
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (isDragging) {
              dragEnd(e);
              handlePolygonDragEnd(
                e,
                dx,
                dy,
                zoom.transformMatrix.scaleX,
                props.polygon.coordinates
              );
              props.onPolygonDrag(false);
            }
          }}
          onContextMenuCapture={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePolygonDelete(e);
          }}
        >
          <Polygon
            points={convertPolygonPoints(props.polygon.coordinates)}
            style={{
              cursor: "move",
            }}
            fill="transparent"
            stroke="red"
            strokeWidth={1 / zoom.transformMatrix.scaleX}
          />
          {props.polygon.coordinates?.map((pt, j) => (
            <Circle
              key={j}
              id={j.toString()}
              cx={pt.x}
              cy={pt.y}
              r={
                props.polygonsEditable[i] ? 6 / zoom.transformMatrix.scaleX : 0
              }
              fill="red"
              opacity={0.5}
              style={{
                cursor: "crosshair",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                dragStart(e);
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                if (isDragging) {
                  props.onPolygonDrag(true);
                  dragMove(e);
                  handleVertexDragMove(
                    e,
                    dx,
                    dy,
                    zoom.transformMatrix.scaleX,
                    props.polygon.coordinates
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
                  props.polygon.coordinates
                );
                props.onPolygonDrag(false);
              }}
            />
          ))}
        </Group>
      )}
    </Drag>
  );
}
