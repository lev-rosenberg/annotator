import { KonvaEventObject } from "konva/lib/Node";
import { Stage, Layer, Circle, Line, Image, Group } from "react-konva";
import Konva from "konva";

import { RefObject } from "react";

import { isPointWithinImage, convertPoints } from "./utilities";
import { Dims, Point, PolygonData } from "../../types/annotatorTypes";

interface PolygonDrawerProps {
  points: Point[];
  i: number;
  polygonsData: PolygonData[];
  stageRef: RefObject<Konva.Stage>;
  isDrawing: boolean;
  circlesVisible: boolean[];
  currZoom: number;
  image: HTMLImageElement | undefined;
  onPolygonChanged: (index: number, points: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
  onPolygonClicked: (index: number) => void;
}

export function PolygonDrawer(props: PolygonDrawerProps) {
  let polygonsData = props.polygonsData;
  const stage = props.stageRef.current;
  const points = props.points;
  const i = props.i;
  /* ********* DRAGGING HANDLERS BELOW ********* */

  function handleVertexDragMove(e: KonvaEventObject<DragEvent>) {
    const c_index: number = e.target.attrs.id;
    const new_x = e.target.attrs.x;
    const new_y = e.target.attrs.y;
    let linePoints: Point[] = e.target.parent?.children![0].getAttr("points");
    if (isPointWithinImage(new_x, new_y, props.image)) {
      linePoints[c_index * 2] = new_x;
      linePoints[c_index * 2 + 1] = new_y;
    } else {
      e.target.attrs.x = linePoints[c_index * 2];
      e.target.attrs.y = linePoints[c_index * 2 + 1];
    }
  }

  function handleVertexDragEnd(e: KonvaEventObject<DragEvent>) {
    const c_index: number = e.target.attrs.id;
    const p_index: number = e.target.parent?.attrs.id;
    const new_x = e.target.attrs.x;
    const new_y = e.target.attrs.y;
    const polygon = polygonsData[p_index].coordinates;
    polygon![c_index] = { x: new_x, y: new_y };
    props.onPolygonChanged(p_index, polygon ?? []);
  }

  function handlePolygonDragMove(e: KonvaEventObject<DragEvent>) {
    if (e.target.getClassName() == "Group") {
      const dx = e.currentTarget.attrs.x;
      const dy = e.currentTarget.attrs.y;
      const target = e.currentTarget as unknown as Konva.Group;
      const circles = target.getChildren(function (node: Konva.Node) {
        return node.getClassName() === "Circle";
      });

      const circlesInImage = circles.every((circle) =>
        isPointWithinImage(
          circle.attrs.x + dx,
          circle.attrs.y + dy,
          props.image
        )
      );
      if (circlesInImage) {
        let newPoints: Point[] = [];
        circles.forEach((circle) => {
          newPoints.push({ x: circle.attrs.x + dx, y: circle.attrs.y + dy });
        });
        e.currentTarget.attrs.points = newPoints;
      }
    }
  }

  function handlePolygonDragEnd(e: KonvaEventObject<DragEvent>) {
    if (e.target.getClassName() == "Group") {
      const p_index = e.currentTarget.attrs.id;
      const newPoints = e.currentTarget.attrs.points;
      props.onPolygonChanged(p_index, newPoints);
    }
  }

  /* ********* DRAGGING HANDLERS ABOVE ********* */

  /* ********* POLYGON RIGHT CLICK ABOVE  ********* */

  function handlePolygonDelete(e: KonvaEventObject<PointerEvent>) {
    e.evt.preventDefault();
    const p_index = e.target.attrs.id;
    props.onPolygonDeleted(p_index);
  }
  /* ********* POLYGON RIGHT CLICK ABOVE ********* */

  return (
    <>
      <Group
        id={i.toString()}
        draggable={props.circlesVisible[i] ? true : false}
        onClick={(e) => {
          props.onPolygonClicked(i);
        }}
        onDragEnd={(e) => {
          // e.evt.stopImmediatePropagation();

          handlePolygonDragEnd(e);
        }}
        onDragMove={(e) => {
          // e.evt.stopImmediatePropagation();

          handlePolygonDragMove(e);
        }}
        // onDragStart={(e) => e.evt.stopImmediatePropagation()}
        onContextMenu={handlePolygonDelete}
        points={points}
      >
        <Line
          key={i}
          id={i.toString()}
          points={convertPoints(points)}
          closed={true}
          strokeWidth={2 / props.currZoom}
          stroke="red"
          onMouseEnter={() => {
            stage!.container().style.cursor = "move";
          }}
          onMouseLeave={() => {
            stage!.container().style.cursor = props.isDrawing
              ? "crosshair"
              : "grab";
          }}
        />
        {points.map((pt, index) => (
          <Circle
            key={index}
            id={index.toString()}
            x={pt.x}
            y={pt.y}
            radius={props.circlesVisible[i] ? 7 / props.currZoom : 0}
            fill="red"
            opacity={0.3}
            draggable
            onDragMove={handleVertexDragMove}
            onDragEnd={handleVertexDragEnd}
            onMouseEnter={() => {
              stage!.container().style.cursor = "crosshair";
            }}
            onMouseLeave={() => {
              stage!.container().style.cursor = "grab";
            }}
          />
        ))}
      </Group>
    </>
  );
}
