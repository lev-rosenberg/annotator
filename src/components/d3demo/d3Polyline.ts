import {
  useState,
  useEffect,
  RefObject,
  useCallback,
} from "react";
import * as d3 from "d3";
import { convertPoints, isWithinImage, getProportionalCoordsToSvg} from "./utilities";
import { Point } from "../../types/annotatorTypes";

interface polylineProps {
  svgElement: RefObject<SVGSVGElement>
  scaleFactor: number
  isDrawing: boolean
  onPolygonAdded: (polygon: Point[]) => void;
}

export function PolylineDrawer (props: polylineProps) {
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);
  const [polylineLen, setPolylineLen] = useState(0); // true number of vertices in the currently drawn polyline (when drawing, there will be an extra point where the pointer is)
  const svg = d3.select(props.svgElement.current); //the SVG overall layer

  let t: d3.ZoomTransform; //the state of the zoom and pan of the svg
  props.svgElement.current
    ? (t = d3.zoomTransform(props.svgElement.current))
    : (t = d3.zoomIdentity);
  const scale = props.scaleFactor;

  const closingPoly = useCallback((v: Point, scale: number) => {
    /* Checks to see if new vertex is attempting to close the polygon. 
    There needs to be at least 4 existing points for a new vertex to make a polygon. 
    And the new vertex must also be sufficiently close to the initial point in the polyline.
  
    (4 because the smallest shape a triangle has 3 points, plus another point tracked by the
        pointer that popped when the polygon is closed.) */

    if (polylinePoints.length >= 4) {
      if (
        Math.abs(polylinePoints[0].x - v.x) <= (7 * scale) / t.k &&
        Math.abs(polylinePoints[0].y - v.y) <= (7 * scale) / t.k
      ) {
        return true;
      }
    }
    return false;
  },[polylinePoints, t.k]);


  const handleDrawPolylineOnClick = useCallback((event: MouseEvent) => {
    /* Adds new point to polyline if newVertex is not closing the polygon. 
    Otherwise sets the polygonsData array to hold the points of the polyline.
    And then rests the polylinePoints array to empty in order to begin a new polyline. */
    const [offsetX, offsetY] = d3.pointer(event, props.svgElement.current);
    const [x, y] = getProportionalCoordsToSvg(offsetX, offsetY, props.svgElement);
    const newVertex: Point = { x: x, y: y };
    if (closingPoly(newVertex, scale)) {
      setPolylinePoints((prevPoints) => prevPoints.splice(-1));
      setPolylinePoints([]);
      setPolylineLen(0);
      props.onPolygonAdded(polylinePoints);
    } else {
      setPolylinePoints((prevPoints) => [...prevPoints, newVertex]);
      setPolylineLen((prevPolylineLen) => prevPolylineLen + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[closingPoly, props, scale])

  const handlePolylineFollowMouseMove = useCallback((e: MouseEvent) => {
    /* Makes polyline ending segment follow the mouse, unless 
    it is close to the starting vertex, then it snaps into place  */
    if (props.isDrawing && polylinePoints.length >= 1) {
      const [offsetX, offsetY] = d3.pointer(e, props.svgElement.current);
      const [x, y] = getProportionalCoordsToSvg(offsetX, offsetY, props.svgElement);
      const newVertex: Point = { x: x, y: y };
      setPolylinePoints((prevPoints) => {
        const updatedPoints = [...prevPoints];
        if (closingPoly(newVertex, scale)) {
          updatedPoints[polylineLen] = prevPoints[0];
        } else {
          updatedPoints[polylineLen] = newVertex;
        }
        return updatedPoints;
      });
    }
  },[closingPoly, polylineLen, polylinePoints.length, props.isDrawing, props.svgElement, scale]
  );

  useEffect(() => {

    polylinePoints.length && 
      svg
      .selectAll(".drawing-polyline")
      .data([polylinePoints])
      .join(
        (enter) =>
          enter
            .append("polyline")
            .attr("class", "drawing-polyline")
            .attr("id", "drawing-polyline")
            .attr("stroke", "red")
            .attr("fill", "none")
            
            .attr("points", (d) => convertPoints(d)),
        (update) => 
          update
          .attr("points", (d) => convertPoints(d))
          .attr("stroke-width", (1 * scale) / t.k),
        (exit) => exit.remove(),
      )
      .attr("transform", t.toString());
    
    
    
    svg.select("image").on("mousemove", function (e) {
      handlePolylineFollowMouseMove(e);
    });
    svg.on("click", function (e) {
      e.preventDefault()
      e.stopPropagation()
      if (props.isDrawing && isWithinImage(e.x, e.y, scale, props.svgElement)) {
        handleDrawPolylineOnClick(e);
      }
    });
    return () => {
      svg.on("mousedown", null);
      svg.on("click", null);
      svg.on("mousemove", null);
      svg.on("mouseup", null);
      !polylinePoints.length ? svg.select('.drawing-polyline').remove() : null
    };
   
  }, [handleDrawPolylineOnClick, handlePolylineFollowMouseMove, polylinePoints, props.isDrawing, props.svgElement, scale, svg, t])

  return null
}