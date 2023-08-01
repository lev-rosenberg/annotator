import React, { RefObject } from "react";
import { Point } from "../../types/annotatorTypes";


export function convertPoints(points: Point[] | null) {
  if (points) {
    const converted: [number,number][] = []
    points.map(pt => {converted.push([pt.x, pt.y])});
    return converted
  }
  else {
    return []
  }
} 