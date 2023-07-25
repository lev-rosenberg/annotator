import React, { useEffect, useCallback, RefObject } from 'react'
import { LabelData, Point, PolygonData } from "../../types/annotatorTypes";
import { getProportionalCoords } from "./utilities"
interface labelProps {
  svgElement: RefObject<SVGSVGElement>
  currentZoom: number
  polygonsData: PolygonData[]
}

export function D3Labels(props: labelProps) {

  
  return null
}