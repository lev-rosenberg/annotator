import * as d3 from 'd3'
import { AnyArray } from 'immer/dist/internal'
import { Point } from './d3Annotator'


/* ********** ZOOM AND PAN FUNCTIONS ********** */

export function handleSvgZoom(e:any) {

  /* make all svg groups transform proportionate to the current zoom and pan */

  const t = e.transform
  // props.setCurrentZoom(t.k)
  d3.selectAll('.polygon-group').attr('transform', t.toString())
  d3.selectAll('polyline').attr('transform', t.toString())
  d3.selectAll('image').attr('transform', t.toString())

  // keep all the circle radii and line widths proportionate to the zooming scale (e.transform.k)
  d3.selectAll('circle').attr('r', 5 / t.k)
  d3.selectAll('polygon').attr('stroke-width', 2 / t.k)
  d3.selectAll('polyline').attr('stroke-width', 2 / t.k)
  }


export function getProportionalCoords(x: number, y: number, svg: SVGSVGElement | null) {
  
  /* given coordinates of the element (or pointer) in the container, return the proportional 
  coordinates depending on the zoom and pan. */

  const t = d3.zoomTransform(svg as Element);
  return t.invert([x,y])
}

/* ********** DRAGING FUNCTIONS ********** */

export function handleVertexDrag(vertex: Element, e: MouseEvent, polygonPoints: Point[][], setPolygonPoints: Function) {

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
  var updatedPoints = [...polygonPoints]
  updatedPoints[index] = newPoints
  setPolygonPoints(updatedPoints)
}

export function handlePolygonDrag(element: Element, e: any, t: d3.ZoomTransform, polygonPoints: Point[][], setPolygonPoints: Function) {
  const polygonGroup = d3.select(element)
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
  var updatedPoints = [...polygonPoints]
  updatedPoints[index] = newPoints
  setPolygonPoints(updatedPoints)
}