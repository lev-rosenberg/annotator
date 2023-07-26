import React, { RefObject } from "react";
import { Point } from "../../types/annotatorTypes";
import * as d3 from 'd3'


export function convertPoints(points: Point[]) {
  /* converts the points stored as [{x1, y1}, {x2, y2}] --> x1,y1 x2,y2 for input into polyline
       and polygon SVG elements*/

  const converted = points.map((pt) => `${pt.x},${pt.y}`).join(" ");
  return converted;
}

export function isWithinImage(x: number, y: number, scale: number, svg: RefObject<SVGSVGElement>) {
  if (svg.current) {
    if (
      x / scale < svg.current.clientWidth &&
      x / scale > 0 &&
      y / scale < svg.current.clientHeight &&
      y / scale > 0
    ) {
      return true;
    }
  } else {
    return false;
  }
}

export function getProportionalCoordsToSvg(x: number, y: number, svg: RefObject<SVGSVGElement>) {
  /* given coordinates of the element (or pointer) in the container, return the proportional 
  coordinates depending on the zoom and pan. */

  const t = d3.zoomTransform(svg.current as Element);
  return t.invert([x, y]);
}