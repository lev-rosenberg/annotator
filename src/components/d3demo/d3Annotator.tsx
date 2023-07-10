import { useState, useEffect, RefObject } from 'react';
import * as d3 from 'd3'
import styles from '../../styles/svgAnnotator.module.css';
import * as controls from './d3polygonControls'


export interface Point {
    x: number;
    y: number;
}

interface annotatorProps {
    svgElement: RefObject<SVGSVGElement>
    isDrawing: Boolean
    setOpen: any
    open: Boolean
    polygonLabels: string[]
    polygonPoints: Point[][]
    setPolygonPoints: any
    width: number | undefined
    height: number | undefined
    setCurrentZoom: any
    setLab: any
}

interface labelData {
    label: string
    coords: Point
}

export function D3Annotator(props: annotatorProps) {
    
    // the coordinates of vertices in the currently drawn polyline
    const [points, setPoints] = useState<Point[]>([]); 

    // the number of vertices in the currently drawn polyline 
    // (this doesn't always correspond with points. something i should rewrite cause it's unnesesarily complicated)
    const [polylineLen, setPolylineLen] = useState(0) 

    const [dragging, setDragging] = useState(false)
    //the SVG overall layer
    const svg = d3.select(props.svgElement.current)

    //the state of the zoom and pan of the svg
    let t: d3.ZoomTransform
    props.svgElement.current ? (t = d3.zoomTransform(props.svgElement.current as Element)) : (t = d3.zoomIdentity)
    

    const width = props.width 
    const height = props.height
    useEffect(() => {
 
        //this is the polygon being drawn onClick
        const current_polyline = svg.selectAll('.drawing-polyline')
            .data([points])
            .join(
                enter => {
                    const polyline = enter.append('polyline').attr('class', 'drawing-polygon')
                    .attr('id', 'drawing-polygon')
                    .attr('stroke', 'white')
                    .attr('fill', 'none')
                    .attr('stroke-width', 2 / t.k)
                    .attr('points', d => convertPoints(d)) 
                    
                    return polyline
                },
                update => {
                    update
                        .select('.drawing-polygon')
                        .attr('points', (d => convertPoints(d))) // Update the points attribute of the polygon
                        .attr('stroke', 'white')
                    return update
                }
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
                        .attr('class', styles.draggable)
                    polygon.append('polygon')
                        .attr('class', styles.polygon)
                        .attr('stroke', 'white')
                        .attr('stroke-width', 2 / t.k)
                        .attr('fill', 'none')
                        .attr('points', (d => convertPoints(d)));
                    polygon.append('text')
                        .text((d, i) => props.polygonLabels[i])
                        .attr('fill', 'white')
                        .attr('x', d => d[0].x + 12/t.k)
                        .attr('y', d => d[0].y + 12/t.k)
                        .attr('font-size', 15 / t.k) 
                        .attr('class', styles.labelchip)
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
                    update
                        .select('text')
                        .text((d, i) => props.polygonLabels[i])
                        .attr('x', d => d[0].x + 12/t.k)
                        .attr('y', d => d[0].y + 12/t.k)
                    return update;
                  },
                exit => {
                    exit
                        .transition()
                        .duration(500)
                        .style('opacity', 0)
                        .remove()
                }
            )
            .attr('transform', t.toString())
            console.log(props.polygonLabels)
        svg.on('mousedown', handleDrawPolylineClick) 
        svg.on('mousemove', function(e) {
            handleDrawPolylineMove(e);
            });        
        svg.selectAll('circle').call(circleDrag as any)
        svg.selectAll('.polygon-group').call(polyDrag as any)
        svg.call(zoom as any, d3.zoomTransform)

        svg.selectAll('.polygon-group').on("contextmenu", function (e) {
            e.preventDefault();
            handlePolygonDelete(this as Element)
        });

        return () => {
            svg.on('mousedown', null);
            svg.on('click', null);
            svg.on('mousemove', null);
            svg.on('mouseup', null);
            svg.on('zoom', null);
            svg.select("#drawing-polygon").remove();
        };
    }, [points, props.polygonPoints, props.isDrawing, t, props.polygonLabels]);
   
    useEffect(() => {
        const labels: labelData[] = []
        svg.selectAll('.polygon-group').each(function() {
            const bbox = (this as SVGSVGElement).getBBox()
            const right = bbox.x + bbox.width
            const bottom = bbox.y + bbox.height
            const proportionalCoords = t.apply([right, bottom]);
            const i = parseInt(d3.select(this).attr('id'))
            const label: labelData = {
                label: props.polygonLabels[i],
                coords: {x: proportionalCoords[0], y: proportionalCoords[1]}
            }
            labels.push(label)
        })
        props.setLab(labels)
        

    }, [t, dragging, props.open, t])
/* ********** ZOOM AND PAN HANDLERS ********** */

    const zoom = d3.zoom().scaleExtent([1, 10]).translateExtent([[0,0],[width!, height!]])
        .on("start", function(e) {
            t = e.transform;
        })
        .on("zoom", function(e) {
            controls.handleSvgZoom(e);
            t = e.transform;
        })
        .on("end", function(e) {
            t = e.transform;
        })


/* ********** DRAGGING HANDLERS ********** */

    const circleDrag = d3.drag()
        .on('start', () => setDragging(true))
        .on('drag', function(e) {
            if (!props.isDrawing) {
                controls.handleVertexDrag(this, e, props.polygonPoints, props.setPolygonPoints)
            }
            
        })
        .on('end', () => setDragging(false))
    const polyDrag = d3.drag()
        .on('start', () => setDragging(true))
        .on('drag', function(e) {
            if (!props.isDrawing) {
                controls.handlePolygonDrag(this, e, t, props.polygonPoints, props.setPolygonPoints)
            }
        })
        .on('end', () => setDragging(false))

    /* ********** POLYLINE DRAWING HANDLERS ********** */

    function handleDrawPolylineClick(event: MouseEvent) {

        /* Adds new point to polyline if newVertex is not closing the polygon. 
        Otherwise sets the polygonPoints array to hold the points of the polyline.
        And then rests the points array to empty in order to begin a new polyline. */
        

        if (props.isDrawing) {
            const [offsetX, offsetY ] = d3.pointer(event, props.svgElement.current);
            const [x,y] = controls.getProportionalCoords(offsetX, offsetY, props.svgElement.current);
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

    function handleDrawPolylineMove(event: MouseEvent) {

        /* this is acting sorta buggy */
        
        if (props.isDrawing && points.length >= 1) {
            const [offsetX, offsetY] = d3.pointer(event, props.svgElement.current);
            const [x,y] = controls.getProportionalCoords(offsetX, offsetY, props.svgElement.current);
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


    /* ********** POLYGON DELETION ********** */
    
    function handlePolygonDelete(polygon: Element) {
        console.log(polygon)
        if (d3.select(polygon).attr('class') == 'polygon-group') {
            const p = d3.select(polygon)
            const index = parseInt(p.attr('id'))
            
            var updatedPoints = [...props.polygonPoints];
            updatedPoints.splice(index, 1);
            props.setPolygonPoints(updatedPoints);

           
           
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
