import React, { Ref, RefObject } from "react";
import {Group} from "@visx/group"
import { Point } from "../../types/annotatorTypes";


export function convertPolygonPoints(points: Point[] | null) {
  if (points) {
    const converted: [number,number][] = []
    points.map(pt => {converted.push([pt.x, pt.y])});
    return converted
  }
  else {
    return []
  }
} 

export function convertImgDimsToSvgCoordinates(imgCoords: Point, groupRef: RefObject<SVGSVGElement | null>) {
  const zoom = parseFloat(groupRef.current?.getAttribute("scale")!);
  const x = parseFloat(groupRef.current?.getAttribute("x")!);
  const y = parseFloat(groupRef.current?.getAttribute("y")!);
  const svgCoords = {
    x: imgCoords.x * zoom + x,
    y: imgCoords.y * zoom + y,
  };
  return svgCoords;
}

export function convertSvgCoordinatesToImgDims(svgCoords: Point, groupRef: RefObject<SVGSVGElement | null>) {
  /* 
    Converts the absolute coordinates of the mouse cursor (mouseCoords) to proportional coordinates
    relative to the original dimenseions of image displayed––not the dimsensions of the SVG coordinate system.
    
    ex. if the original image has a width of 1000, but within the SVG system it had a width of 752
    and you click on the far right of the image, this function will return a point with an x value near 1000.
  */

  const zoom = parseFloat(groupRef.current?.getAttribute("scale")!);
  console.log(zoom)
  const x = parseFloat(groupRef.current?.getAttribute("x")!);
  const y = parseFloat(groupRef.current?.getAttribute("y")!);
  const imgDims = {
    x: (svgCoords.x - x) / zoom,
    y: (svgCoords.y - y) / zoom,
  };
  return imgDims;
}