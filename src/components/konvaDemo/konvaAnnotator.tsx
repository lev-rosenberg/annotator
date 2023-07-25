import React, { RefObject, useState, useEffect } from "react";
import { Dims, Point, PolygonData } from "../../types/annotatorTypes";
import useImage from "use-image";

import { KonvaEventObject } from "konva/lib/Node";
import { Stage, Layer, Circle, Line, Image, Group } from "react-konva";
import Konva from "konva";
import { ImageOptimizerCache } from "next/dist/server/image-optimizer";

interface annotatorProps {
  currImage: string;
  currZoom: number;
  changeZoom: (zoom: number) => void;
  stageRef: RefObject<Konva.Stage>;
  layerRef: RefObject<Konva.Layer>;
  isDrawing: boolean;
  stopDrawing: () => void;
  draggingImage: (bool: boolean) => void;
  polygonsData: PolygonData[];
  onPolygonAdded: (polygon: Point[]) => void;
  onPolygonChanged: (index: number, points: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
  divDimensions: Dims | undefined;
}

interface PolygonProps {
  points: Point[];
  i: number;
}

export default function KonvaAnnotator(props: annotatorProps): JSX.Element {
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);

  const [mousePos, setMousePos] = useState<Point>();
  const zoomBy = 1.05;
  const [image] = useImage(props.currImage);

  const layer = props.layerRef.current;
  const stage = props.stageRef.current;
  const polygonsData = props.polygonsData;

  // useEffect(() => {
  //   const dims = document.querySelector("#container")?.getBoundingClientRect();
  //   if (image && dims) {
  //     setInitialScale(dims?.width / image.width);
  //     layer?.scaleX(dims?.width / image.width);
  //     layer?.scaleY(dims?.width / image.width);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [image, props.currImage]);
  /* ********* POLYLINE DRAWING HANDLERS ********* */
  function handleDrawPolylineClick() {
    if (layer && props.isDrawing) {
      const newPoint: Point = layer.getRelativePointerPosition();
      if (!isClosingPolygon(newPoint)) {
        setPolylinePoints((prevPoints) => [...prevPoints, newPoint]);
      } else {
        props.stopDrawing();
        props.onPolygonAdded(polylinePoints);
        setPolylinePoints([]);
        setMousePos(undefined);
      }
    }
  }

  function handleMouseMove() {
    if (polylinePoints.length > 0 && layer) {
      const pointer = layer.getRelativePointerPosition();
      if (!isClosingPolygon(pointer)) {
        setMousePos(pointer);
      } else {
        const snap = polylinePoints[0];
        setMousePos(snap);
      }
    }
  }
  function polylineToMouse() {
    const start: Point | undefined = polylinePoints.at(-1);
    if (polylinePoints.length >= 1 && mousePos && start) {
      const end: Point = mousePos;
      return convertPoints([start, end]);
    } else {
      return [];
    }
  }

  /* ********* DRAGGING HANDLERS ********* */

  function handleVertexDragMove(e: KonvaEventObject<DragEvent>) {
    const c_index: number = e.target.attrs.id;
    const new_x = e.target.attrs.x;
    const new_y = e.target.attrs.y;
    let linePoints: Point[] = e.target.parent?.children![0].getAttr("points");
    if (isPointWithinImage(new_x, new_y)) {
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
      const index: number = e.target.attrs.id;
      const dx = e.target.attrs.x;
      const dy = e.target.attrs.y;
      // const target = e.target as unknown as Konva.Group;
      const circles: Konva.Circle[] = e.target.getChildren(function (
        node: Konva.Node
      ) {
        return node.getClassName() === "Circle";
      });
      const circlesInImage = circles.every((circle) =>
        isPointWithinImage(circle.attrs.x + dx, circle.attrs.y + dy)
      );
      if (circlesInImage) {
        let newPoints: Point[] = [];
        circles.forEach((circle) =>
          newPoints.push({ x: circle.attrs.x + dx, y: circle.attrs.y + dy })
        );
        e.target.attrs.points = newPoints;
      }
    }
  }

  function handlePolygonDragEnd(e: KonvaEventObject<DragEvent>) {
    if (e.target.getClassName() == "Group") {
      const index = e.target.attrs.id;
      const newPoints = e.target.attrs.points;
      props.onPolygonChanged(index, newPoints);
    }
  }

  /* ********* POLYGON RIGHT CLICK HANDLER  ********* */

  function handlePolygonDelete(e: KonvaEventObject<PointerEvent>) {
    e.evt.preventDefault();
    const p_index = e.target.attrs.id;
    props.onPolygonDeleted(p_index);
  }

  /* ********* ZOOM AND PAN ********* */

  function zoomLayer(e: KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    if (layer && stage) {
      const oldScale = layer.scaleX();
      const pointer = stage.getRelativePointerPosition();
      const mousePointTo = {
        x: (pointer.x - layer.x()) / oldScale,
        y: (pointer.y - layer.y()) / oldScale,
      };
      const direction = e.evt.deltaY > 0 ? 1 : -1; // how to scale? Zoom in? Or zoom out?
      const newScale = direction > 0 ? oldScale * zoomBy : oldScale / zoomBy;
      if (newScale <= 10.2 && newScale >= 0.01) {
        props.changeZoom(newScale);
        layer.scale({ x: newScale, y: newScale });
        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        layer.position(newPos);
      }
    }
  }

  /* ********* UTILITY FUNCTIONS ********* */

  function convertPoints(points: Point[]) {
    const converted: number[] = [];
    points.map((obj) => converted.push(obj.x, obj.y));
    return converted;
  }

  function isClosingPolygon(point: Point) {
    if (polylinePoints.length >= 3) {
      if (
        Math.abs(polylinePoints[0].x - point.x) <= 7 / props.currZoom &&
        Math.abs(polylinePoints[0].y - point.y) <= 7 / props.currZoom
      ) {
        return true;
      }
    }
    return false;
  }

  function isPointWithinImage(x: number, y: number) {
    if (layer && image) {
      if (x < image.width && x > 0 && y < image.height && y > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /* ********* CUSTOM SHAPE COMPONENTS ********* */

  function Polyline() {
    return (
      <Line
        points={convertPoints(polylinePoints)}
        strokeWidth={2 / props.currZoom}
        stroke="red"
      />
    );
  }

  function Polygon({ points, i }: PolygonProps) {
    return (
      <>
        <Group
          id={i.toString()}
          draggable
          onDragEnd={handlePolygonDragEnd}
          onDragMove={handlePolygonDragMove}
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
              radius={7 / props.currZoom}
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

  return (
    <Stage
      ref={props.stageRef}
      style={{ borderRadius: "5px", overflow: "hidden" }}
      width={props.divDimensions?.width}
      height={props.divDimensions?.height}
      onWheel={zoomLayer}
    >
      <Layer
        ref={props.layerRef}
        onClick={() => {
          handleDrawPolylineClick();
        }}
        onMouseMove={handleMouseMove}
        draggable={true}
        x={0}
        y={0}
        scaleX={0.2}
        scaleY={0.2}
        onDragStart={(e) => {
          if (e.target.getClassName() == "Layer") {
            props.draggingImage(true);
          }
        }}
        onDragEnd={(e) => props.draggingImage(false)}
        onMouseEnter={() => {
          stage!.container().style.cursor = props.isDrawing
            ? "crosshair"
            : "grab";
        }}
        onMouseDown={(e) => {
          stage!.container().style.cursor = props.isDrawing
            ? "crosshair"
            : "grabbing";
        }}
        onMouseUp={(e: KonvaEventObject<MouseEvent>) => {
          stage!.container().style.cursor = props.isDrawing
            ? "crosshair"
            : "grab";
        }}
        onMouseLeave={() => {
          stage!.container().style.cursor = "default";
        }}
      >
        <Image image={image} alt="" />
        <Polyline />
        <Line // this is the line from the end of the polyline to my mouse as you draw
          points={polylineToMouse()}
          strokeWidth={2 / props.currZoom}
          stroke="red"
        />
        {props.polygonsData?.map((polygon, i) => (
          <Polygon key={i} points={polygon.coordinates as Point[]} i={i} />
        ))}
      </Layer>
    </Stage>
  );
}
