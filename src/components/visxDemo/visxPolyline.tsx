import React, { useRef, useEffect, useState, RefObject } from "react";
import { LinePath, Line } from "@visx/shape";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";

import { Point } from "../../types/annotatorTypes";

interface annotatorProps {
  scale: number;
  getPropToOriginal: (pt: Point) => Point;
  getPropToRelative: (pt: Point) => Point;
  onPolygonAdded: (pts: Point[]) => void;
  groupRef: RefObject<SVGSVGElement | null>;
}
type Line = { x: number; y: number }[];

export function VisxPolyline(props: annotatorProps) {
  const [polylinePoints, setPolylinePoints] = useState<Line>([]);
  const [fauxPolylinePoints, setFauxPolylinePoints] = useState<Line>([]);

  const imgRef = useRef<SVGImageElement | null>(null);

  function handleDrawPolylineOnClick(e: MouseEvent) {
    const mouse = localPoint(e);
    if (mouse) {
      if (!isClosingPolygon(mouse)) {
        setPolylinePoints((prevPolylinePoints) => [
          ...prevPolylinePoints,
          props.getPropToOriginal(mouse),
        ]);
        setFauxPolylinePoints((prevFauxPolylinePoints) => [
          ...prevFauxPolylinePoints,
          props.getPropToRelative(mouse),
        ]);
      } else {
        props.onPolygonAdded(polylinePoints);
        setPolylinePoints([]);
        setFauxPolylinePoints([]);
      }
    }
  }

  function isClosingPolygon(point: Point) {
    if (polylinePoints.length >= 3) {
      const propPoint = props.getPropToRelative(point);
      if (
        Math.abs(fauxPolylinePoints[0].x - propPoint!.x) <= 7 / props.scale &&
        Math.abs(fauxPolylinePoints[0].y - propPoint!.y) <= 7 / props.scale
      ) {
        return true;
      }
    }
    return false;
  }
  useEffect(() => {
    if (props.groupRef.current) {
      props.groupRef.current.addEventListener("click", (e) =>
        handleDrawPolylineOnClick(e)
      );
    }
  }, []);

  return (
    <LinePath
      data={fauxPolylinePoints}
      stroke="red"
      strokeWidth={3 / props.scale}
      x={(d) => d?.x}
      y={(d) => d?.y}
    />
  );
}
