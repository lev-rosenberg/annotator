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
}

export function PolygonDrawer(props: polygonProps) {
  let zoom = props.zoom;

  function handlePolygonDragMove(
    e: React.MouseEvent<SVGElement, MouseEvent>,
    dx: number,
    dy: number,
    zoom: number,
    polygonCoords: Point[] | null
  ) {
    const vertices = Array.from(e.currentTarget.children).slice(1);
    const polygon = e.currentTarget.firstElementChild;
    const pdx = dx / zoom;
    const pdy = dy / zoom;
    if (vertices && polygon && polygonCoords) {
      const newPoints = polygonCoords.map((pt, i) => {
        vertices[i].setAttribute("cx", (pt.x + pdx).toString());
        vertices[i].setAttribute("cy", (pt.y + pdy).toString());
        return { x: pt.x + pdx, y: pt.y + pdy };
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
    const pdx = dx / zoom;
    const pdy = dy / zoom;
    if (polygonCoords) {
      const newPoints: Point[] = polygonCoords.map((pt) => {
        return { x: pt.x + pdx, y: pt.y + pdy };
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
        props.onPolygonChanged(p_index, newPoints);
      }
    }
  }

  function isPointWithinImage(pt: Point, dx: number = 0, dy: number = 0) {
    const image = props.imgOriginalDims;
    dx /= parseFloat(props.groupRef.current?.getAttribute("scale")!);
    dy /= parseFloat(props.groupRef.current?.getAttribute("scale")!);
    if (image?.width && image.height) {
      if (
        pt.x + dx < image.width &&
        pt.x + dx > 0 &&
        pt.y + dy < image.height &&
        pt.y + dy > 0
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function handlePolygonDelete(e: React.MouseEvent<SVGElement, MouseEvent>) {
    e.preventDefault();
    const p_index = parseInt(e.currentTarget.id);
    props.onPolygonDeleted(p_index);
  }
  return (
    <Drag
      key={props.i}
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
      {({ dragStart, dragEnd, dragMove, dx, dy }) => (
        <Group
          key={props.i}
          id={props.i.toString()}
          onMouseDown={(e) => {
            if (e.button == 0) {
              e.stopPropagation();
              e.preventDefault();

              dragStart(e);
              props.onPolygonDrag(true);
            }
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (props.polygonDragging) {
              handlePolygonDragMove(
                e,
                dx,
                dy,
                zoom.transformMatrix.scaleX,
                props.polygon.coordinates
              );
              dragMove(e);
            }
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            e.preventDefault();

            dragEnd(e);
            handlePolygonDragEnd(
              e,
              dx,
              dy,
              zoom.transformMatrix.scaleX,
              props.polygon.coordinates
            );
            props.onPolygonDrag(false);
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
            strokeWidth={2 / zoom.transformMatrix.scaleX}
          />
          {props.polygon.coordinates?.map((pt, i) => (
            <Circle
              key={i}
              id={i.toString()}
              cx={pt.x}
              cy={pt.y}
              r={6 / zoom.transformMatrix.scaleX}
              fill="red"
              opacity={0.5}
              style={{
                cursor: "crosshair",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                dragStart(e);
                props.onPolygonDrag(true);
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                if (props.polygonDragging) {
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
