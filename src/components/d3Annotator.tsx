import React, { useState, useLayoutEffect, useEffect, RefObject, DragEvent } from 'react';
import * as d3 from 'd3'
import styles from '../styles/svgAnnotator.module.css';



interface Point {
    x: number;
    y: number;
}
interface annotatorProps {
    svgElement: RefObject<SVGSVGElement>
    isDrawing: Boolean
    setOpen: any
    polygonLabels: string[]
    polygonPoints: Point[][]
    setPolygonPoints: any
    width: number | undefined
    height: number | undefined
    setCurrentZoom: any
    setLabelsfr: any
}

interface labelData {
    label: string
    coords: Point
}

export default function D3Annotator(props: annotatorProps) {
    
    const [points, setPoints] = useState<Point[]>([]);
    const [polylineLen, setPolylineLen] = useState(0)
    const [vertexDragging, setVertexDragging] = useState<number[] | null>(null) // the index of the vertex being dragged
    const svg = d3.select(props.svgElement.current)
    let t: d3.ZoomTransform
    if (props.svgElement.current) {
        t = d3.zoomTransform(props.svgElement.current as Element);
    }
    else {
        t = d3.zoomIdentity
    }

    const width = props.width 
    const height = props.height
    useEffect(() => {
        
        //this is the polygon being drawn onClick
        const current_polyline = svg.selectAll('.drawing-polyline')
            .data([points])
            .join(
                enter => {
                    const polyline = enter.append('polyline').attr('class', 'drawing-polygon')
                    .attr('id', 'drawing_polygon')
                    .attr('stroke', 'white')
                    .attr('fill', 'none')
                    .attr('stroke-width', 2 / t.k)
                    .attr('points', d => convertPoints(d)) 
                    
                    return polyline
                },
                update => {
                    update
                        .select('polyline')
                        .attr('class', 'drawing-polygon')
                        .attr('points', (d => convertPoints(d))) // Update the points attribute of the polygon
                        .attr('stroke', 'white')
                    return update
                },
            )
            .attr('transform', t.toString())



        // this is the previously drawn polygons, with circles at each vertex.
        const past_polygons = svg.selectAll('.polygon-group')
            .data(props.polygonPoints as Point[][]) // associate each polygon with an element of polygonPoints[][]

            .join(
                enter => {
                    const polygon = enter.append('g').attr('class', 'polygon-group').attr('id', (d, i) => i)
                    polygon.selectAll('circle') // 
                        .data(d => d) // Associate each circle with the vertices of the polygon (subelements of polygonPoints)
                        .join('circle') // Append a circle for each vertex
                        .attr('cx', (pt) => pt.x) // Use the initial vertex's x-coordinate
                        .attr('cy', (pt) => pt.y) // Use the initial vertex's y-coordinate
                        .attr('r', 5)
                        .attr('fill', (props.isDrawing ? 'none' : 'white'))
                        .attr('fill-opacity', '0.5')
                        .attr('id', (pt, i) => i)
                        .attr('class', styles.draggable)

                        
                        
                    polygon.append('polygon')
                        .attr('class', styles.polygon)
                        .attr('stroke', 'white')
                        .attr('stroke-width', 2 / t.k)
                        .attr('fill', 'none')
                        .attr('points', (d => convertPoints(d)));
                    return polygon;
                },
                update => {
                    /* Update existing polygons and circles with any data that might have changed */
                    update
                      .selectAll('circle')
                      .data(d => d)
                      .attr('cx', (pt) => pt.x) // update the vertex's x-coordinate
                      .attr('cy', (pt) => pt.y) // update the vertex's y-coordinate
                      .attr('fill', (props.isDrawing ? 'none' : 'white')) // props.isDrawing may have updated as well
                      .attr('r', 5 / t.k) 
                
                    update
                      .select('polygon')
                      .attr('points', (d => convertPoints(d))) // Update the points attribute of the polygon

                    return update;
                  }
                
            )
            .attr('transform', t.toString())

        svg.on('mousedown', handleDrawPolylineClick) 
        svg.on('mousemove', function(e) {
            handleDrawPolylineDrag(e);
            });        
        svg.selectAll('circle').call(circleDrag as any)
        svg.selectAll('.polygon-group').call(polyDrag as any)
       

        svg.call(zoom as any, d3.zoomTransform)


        return () => {
            svg.on('mousedown', null);
            svg.on('click', null);
            svg.on('mousemove', null);
            svg.on('mouseup', null);
            svg.on('zoom', null)
            svg.select("#drawing_polygon").remove()
        };
    }, [points, props.polygonPoints, props.isDrawing, t]);
   


    useEffect(() => {
        const labels: labelData[] = []
        svg.selectAll('.polygon-group').each(function() {
            const bbox = (this as SVGSVGElement).getBBox()
            const right = bbox.x + bbox.width
            const bottom = bbox.y + bbox.height
            const proportionalCoords = getProportionalCoords(right,bottom)
            const i = parseInt(d3.select(this).attr('id'))
            const label: labelData = {
                label: props.polygonLabels[i],
                coords: {x: proportionalCoords[0], y: proportionalCoords[1]}
            }
            labels.push(label)
        })
        props.setLabelsfr(labels)
    }, [props.polygonPoints, t, props.polygonLabels])

/* ********** ZOOM AND PAN HANDLERS ********** */

    const zoom = d3.zoom().scaleExtent([1, 10]).translateExtent([[0,0],[width!, height!]])
        .on("zoom", handleSvgZoom)
    

    function handleSvgZoom(e:any) {
        // make all svg groups transform proportionate to the currcent zoom and pan

        if (!vertexDragging) {
            const t = e.transform
            props.setCurrentZoom(t.k)
            d3.selectAll('g').attr('transform', t)
            d3.selectAll('polyline').attr('transform', t)
            d3.selectAll('image').attr('transform', t)

            // keep all the circle radii and line widths proportionate to the zooming scale (e.transform.k)
            //d3.selectAll('circle').attr('r', 5 / e.transform.k)
            d3.selectAll('polygon').attr('stroke-width', 2 / e.transform.k)
            d3.selectAll('polyline').attr('stroke-width', 2 / e.transform.k)
        }
    }
   
    function getProportionalCoords(x: number, y: number) {
        
        /* given coordinates of the element (or pointer) in the container, return the proportional 
        coordinates depending on the zoom and pan. */

        t = d3.zoomTransform(props.svgElement.current as Element);
        return t.invert([x,y])
    }


/* ********** DRAGGING HANDLERS ********** */

    const circleDrag = d3.drag()
        .on('drag', function(e) {
            handleVertexDrag(this, e)
        })
    const polyDrag = d3.drag()
        .on('drag', function(e) {
            handlePolygonDrag(this, e)
        })
    
    
    function handleVertexDrag(element: Element, e: MouseEvent) {
            
        if (!props.isDrawing) {
            const dragCircle = d3.select(element)
            const polygonGroup = d3.select(element.parentElement)
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
            var updatedPoints = [...props.polygonPoints]
            updatedPoints[index] = newPoints
            props.setPolygonPoints(updatedPoints)
        };
    }
    function handlePolygonDrag(element: Element, e: any) {
        if (!props.isDrawing) {
            const polygonGroup = d3.select(element)
            const circles = polygonGroup.selectAll('circle');
            const index = parseInt(polygonGroup.attr('id'));
            const newPoints: Point[] = []   
            circles.nodes().forEach((circle) => {
                d3.select(circle)
                    .attr('cx', (d => d.x + e.dx))
                    .attr('cy', (d => d.y + e.dy))
                const newPoint = {x: parseFloat(d3.select(circle).attr('cx')), y: parseFloat(d3.select(circle).attr('cy'))}
                newPoints.push(newPoint);
            })
            var updatedPoints = [...props.polygonPoints]
            updatedPoints[index] = newPoints
            props.setPolygonPoints(updatedPoints)
        };
    }

    /* ********** POLYLINE DRAWING HANDLERS ********** */


    function handleDrawPolylineClick(event: MouseEvent) {

        /* Adds new point to polyline if newVertex is not closing the polygon. 
        Otherwise sets the polygonPoints array to hold the points of the polyline.
        And then rests the points array to empty in order to begin a new polyline. */
        

        if (props.isDrawing) {
            const [offsetX, offsetY ] = d3.pointer(event, props.svgElement.current);
            const [x,y] = getProportionalCoords(offsetX, offsetY)
             //after panning, click twice and you will notice that this is x,y 2 dif pts. but offsetXY is not! this means smth is wrong wityh getpropcoords
            const newVertex: Point = { x: x, y: y};
            if (closingPoly(newVertex)) {
                setPoints(prevPoints => prevPoints.splice(-1));
                props.setPolygonPoints((prevPolygonPoints:Point[][]) => [...prevPolygonPoints, points]);
                setPoints([]);
                setPolylineLen(0)
                props.setOpen(true)
            }
            else {
                setPoints(prevPoints => [...prevPoints, newVertex]);
                setPolylineLen(polylineLen+1)
            }
        }
    };

    function handleDrawPolylineDrag(event: MouseEvent) {

        /* this is acting sorta buggy */
        
        if (props.isDrawing && points.length >= 1) {
            const [offsetX, offsetY] = d3.pointer(event, props.svgElement.current);
            const [x,y] = getProportionalCoords(offsetX, offsetY)
            const newVertex: Point = { x: x, y: y };
            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                if (closingPoly(newVertex)) {
                  updatedPoints[polylineLen] = prevPoints[0];
                } else {
                  updatedPoints[polylineLen] = newVertex;
                }
                return updatedPoints;
            });
        }
    }

    /* ********** UTILITY FUNCTIONS ********** */

    function closingPoly(v: Point) {
        
        /* Checks to see if new vertex is attempting to close the polygon. 
        There needs to be at least 4 existing points for a new vertex to make a polygon. 
        And the new vertex must also be sufficiently close to the initial point in the polyline.

        (4 because the smallest shape a triangle has 3 points, plus another point tracked by the
            pointer that popped when the polygon is closed.) */

        if (points.length >= 4) {
            if (Math.abs(points[0].x - v.x) <= 7/t.k && 
                Math.abs(points[0].y - v.y) <= 7/t.k) {
                return true
            }
        }
        return false
    }

    function convertPoints(points: Point[]) {

        /* converts the points stored as [{x1, y1}, {x2, y2}] --> x1,y1 x2,y2 for input into polyline
         and polygon SVG elements*/

        const converted = points.map((pt) => `${pt.x},${pt.y}`).join(' ')
        return converted
    }


    return null; // D3Annotator doesn't render additional content, it just adds to the existing svg
}
