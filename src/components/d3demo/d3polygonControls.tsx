import { RefObject, Dispatch, SetStateAction } from 'react';
import * as d3 from 'd3'
import { Point } from '../../types/svgTypes'


/* ********** ZOOM AND PAN FUNCTIONS ********** */

export function handleSvgZoom(e:any, scale: number) {

  /* make all svg groups transform proportionate to the current zoom and pan */
  const t = e.transform
  d3.selectAll('.polygon-group').attr('transform', t.toString())
  d3.selectAll('polyline').attr('transform', t.toString())
  d3.selectAll('image').attr('transform', t.toString())


  // keep all the circle radii and line widths proportionate to the zooming scale (e.transform.k)
  d3.selectAll('circle').attr('r', (7*scale) / t.k)
  d3.selectAll('polygon').attr('stroke-width', (2*scale) / t.k)
  d3.selectAll('polyline').attr('stroke-width', (2*scale) / t.k)
  }


export function getProportionalCoords(x: number, y: number, svg: SVGSVGElement | null) {
  
  /* given coordinates of the element (or pointer) in the container, return the proportional 
  coordinates depending on the zoom and pan. */

  const t = d3.zoomTransform(svg as Element);
  return t.invert([x,y])
}

/* ********** DRAGING FUNCTIONS ********** */

export function handleVertexDrag(
  vertex: Element, 
  e: MouseEvent, 
  polygonPoints: Point[][], 
  setPolygonPoints: Function) {

  const dragCircle = d3.select(vertex)
  const polygonGroup = d3.select(vertex.parentElement)
  const circles = polygonGroup.selectAll('circle');
  const index = parseInt(polygonGroup.attr('id'));
  const newPoints: Point[] = []
  dragCircle
    .attr('cx', e.x)
    .attr('cy', e.y);
  circles.nodes().forEach((circle) => {
      const newPoint = {x: parseFloat(d3.select(circle).attr('cx')), y: parseFloat(d3.select(circle).attr('cy'))}
      newPoints.push(newPoint);
  })
  let updatedPoints = [...polygonPoints]
  updatedPoints[index] = newPoints
  setPolygonPoints(updatedPoints)
}

export function handlePolygonDrag(
  polygon: Element, 
  e: any, 
  t: d3.ZoomTransform, 
  polygonPoints: Point[][], 
  setPolygonPoints: Function) {

    const polygonGroup = d3.select(polygon)
    const circles = polygonGroup.selectAll('circle');
    const index = parseInt(polygonGroup.attr('id'));
    const newPoints: Point[] = []
    circles.nodes().forEach((circle) => {
        d3.select(circle)
            .attr('cx', ((d: any) => d.x + e.dx/t.k))
            .attr('cy', ((d: any) => d.y + e.dy/t.k))
        const newPoint = {x: parseFloat(d3.select(circle).attr('cx')), y: parseFloat(d3.select(circle).attr('cy'))}
        newPoints.push(newPoint);
    })
    let updatedPoints = [...polygonPoints]
    updatedPoints[index] = newPoints
    setPolygonPoints(updatedPoints)
  }


export function handleDrawPolylineOnClick(
  event: MouseEvent, 
  svgElement: RefObject<SVGSVGElement>,
  points: Point[], 
  setPoints: Dispatch<SetStateAction<Point[]>>, 
  polygonPoints: Point[][], 
  setPolygonPoints: Dispatch<SetStateAction<Point[][]>>,
  setPolylineLen: Dispatch<SetStateAction<number>>, 
  setDialogueOpen: Dispatch<SetStateAction<boolean>>,
  setIsDrawing: Dispatch<SetStateAction<boolean>>,
  t: d3.ZoomTransform, 
  scale: number) {

  /* Adds new point to polyline if newVertex is not closing the polygon. 
  Otherwise sets the polygonPoints array to hold the points of the polyline.
  And then rests the points array to empty in order to begin a new polyline. */
 
      const [offsetX, offsetY ] = d3.pointer(event, svgElement.current);
      const [x,y] = getProportionalCoords(offsetX, offsetY, svgElement.current);

      const newVertex: Point = { x: x, y: y};
      if (closingPoly(newVertex, points, t, scale)) {
          setPoints(prevPoints => prevPoints.splice(-1))

          let updatedPoints = [...polygonPoints, points]
          setPolygonPoints(updatedPoints)
          //props.setPolygonPoints((prevPolygonPoints) => [...prevPolygonPoints, points]);
          setPoints([]);
          setPolylineLen(0)
          setDialogueOpen(true)
          setIsDrawing(false)
      }
      else {
          setPoints((prevPoints) => [...prevPoints, newVertex]);
          setPolylineLen(prevPolylineLen => prevPolylineLen+1)
      }
  
};


export function closingPoly(v: Point, points: Point[], t: d3.ZoomTransform, scale: number) {
        
  /* Checks to see if new vertex is attempting to close the polygon. 
  There needs to be at least 4 existing points for a new vertex to make a polygon. 
  And the new vertex must also be sufficiently close to the initial point in the polyline.

  (4 because the smallest shape a triangle has 3 points, plus another point tracked by the
      pointer that popped when the polygon is closed.) */

  if (points.length >= 4) {
      if (Math.abs(points[0].x - v.x) <= (7*scale)/t.k && 
          Math.abs(points[0].y - v.y) <= (7*scale)/t.k) {
          return true
      }
  }
  return false
}