import React, { useState, useLayoutEffect, useEffect, RefObject } from 'react';
import * as d3 from 'd3'
import styles from '../styles/svgAnnotator.module.css';
import { AnySet } from 'immer/dist/internal';
import { maxWidth } from '@mui/system';

interface Vertex {
    x: number;
    y: number;
}
interface annotatorProps {
    svgElement: RefObject<SVGSVGElement>
    isDrawing: Boolean
    setOpen: any
    polygonLabels: string[]
    polygonPoints: Vertex[][]
    setPolygonPoints: any
    canvasRef: RefObject<HTMLCanvasElement>
}

export default function D3Annotator(props: annotatorProps) {
    
    const [points, setPoints] = useState<Vertex[]>([]);
    const [polylineLen, setPolylineLen] = useState(0)
    const [indexDragging, setIndexDragging] = useState<number[] | null>(null) // the index of the vertex being dragged
    const svg = d3.select(props.svgElement.current);
    const canvas = d3.select(props.canvasRef.current)
    const context = canvas.node()?.getContext("2d");
    const width: number | undefined = canvas.node()?.width
    const height: number | undefined = canvas.node()?.height


    useEffect(() => {

        //this is the polygon being drawn onClick
        const current_polyline = svg.append('polyline')
            .attr('id', 'drawing_polygon')
            .attr('stroke', 'red')
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('points', convertPoints(points));

        // this is the previously drawn polygons, with circles at each vertex.
        const past_polygons = svg.selectAll('.polygon-group')
            .data(props.polygonPoints as Vertex[][]) // associate each polygon with an element of polygonPoints[][]
            .join(
                enter => {
                    const polygon = enter.append('g').attr('class', 'polygon-group').attr('id', (d, i) => i)
                    polygon.selectAll('circle') // 
                        .data(d => d) // Associate each circle with the vertices of the polygon (subelements of polygonPoints)
                        .join('circle') // Append a circle for each vertex
                        .attr('cx', (pt) => pt.x) // Use the current vertex's x-coordinate
                        .attr('cy', (pt) => pt.y) // Use the current vertex's y-coordinate
                        .attr('r', 8)
                        .attr('fill', (props.isDrawing ? 'none' : 'red'))
                        .attr('fill-opacity', '0.5')
                        .attr('id', (pt, i) => i)
                        .attr('class', styles.draggable);
                    polygon.append('polygon')
                        .attr('stroke', 'red')
                        .attr('fill', 'none')
                        .attr('stroke-width', '4')
                        .attr('points', (d => convertPoints(d)));
                    return polygon;
                },
                //this is pointless with the useEffect because of the useEffect
                update => {
                    // Update existing polygons and circles
                    update
                      .selectAll('circle')
                      .data(d => d)
                      .attr('cx', (pt) => pt.x) // Use the updated vertex's x-coordinate
                      .attr('cy', (pt) => pt.y); // Use the updated vertex's y-coordinate
                
                    update
                      .select('polygon')
                      .attr('points', (d => convertPoints(d))); // Update the points attribute of the polygon
                
                    return update;
                  },
                //   exit => {
                //     // Handle removal of elements
                //     exit.remove();
                //   }
            )

        svg.on('mousedown', handleVertexMouseDown);
        svg.on('click', handleDrawMouseClick);
        svg.on('mousemove', function(e) {
            handleDrawMouseDrag(e);
            handleVertexDrag(e);
            });
        svg.on('mouseup', handleVertexMouseUp);
        svg.call(zoom as any, d3.zoomTransform)

        return () => {
            svg.on('mousedown', null);
            svg.on('click', null);
            svg.on('mousemove', null);
            svg.on('mouseup', null);
            svg.on('zoom', null)
            svg.selectAll("*").remove().exit();
        };
    }, [points, indexDragging, props.polygonPoints, props.isDrawing]);
    
    useEffect(() => {
        if (canvas.node() != null) {
            
            const context = canvas.node()?.getContext("2d");
            const image = new Image();
            image.src = "images/bubbles.jpeg";
            context?.drawImage(image, 0, 0, width!, height!);
             handleCanvasZoom(d3.zoomIdentity)
            
        };
        
    }, [props.canvasRef]);    
    

/* ********** ZOOM AND PAN HANDLERS ********** */

    const zoom = d3.zoom().scaleExtent([1, 8])
        .on("zoom.canvas", handleCanvasZoom)
        .on("zoom.svg", handleSvgZoom);

    function handleCanvasZoom(e) {
        // make all canvas groups transform proportionate to the currcent zoom and pan

        if (!indexDragging) {

            context?.save()
            context?.clearRect(0, 0, width!, height!)
            let t
            if (e==d3.zoomIdentity) {
                t = e
            }
            else {
                t = e.transform
            }
            context?.translate(t.x, t.y);
            context?.scale(t.k, t.k);

            const image = new Image();
            image.src = "images/bubbles.jpeg";
            context?.drawImage(image, 0, 0, width, height)
            // context?.drawImage(image, e.transform.x, e.transform.y, width! * e.transform.k, height! * e.transform.k);

            
            context?.restore();
        }
    }

    function handleSvgZoom(e:any) {
        // make all svg groups transform proportionate to the currcent zoom and pan

        const svgRect = props.svgElement.current?.getBoundingClientRect();
        const canvasRect = props.canvasRef.current?.getBoundingClientRect();
        if (!indexDragging) {
            const t = e.transform
            
            d3.selectAll('g').attr('transform', t)
            // keep all the circle radii and line widths proportionate to the zooming scale (e.transform.k)
            d3.selectAll('circle').attr('r', 5 / e.transform.k)
            d3.selectAll('polygon').attr('stroke-width', 1 / e.transform.k)
            d3.selectAll('polyline').attr('stroke-width', 1 / e.transform.k)
        }
    }

    function getProportionalPointerCoords(x: number, y: number) {
        
        /* given coordinates of the pointer in the container, return the proportional 
        coordinates depending on the zoom and pan. */

        const transform = d3.zoomTransform(svg.node() as Element);
        return transform.invert([x,y])
    }


/* ********** VERTEX DRAGGING HANDLERS ********** */
    

    function handleVertexMouseDown(event: MouseEvent) { 

        /* Check if you are clicking on a circle and that you aren't actively drawing polygons. 
        Then, get the id's of the vertex you clicked and its parent group. These will be how 
        you index into the polygonPoints array. For instance, if you clicked on vertex 4 in 
        polygon 11, then you can index into polygonPoints[11][4]  */  

        if (!props.isDrawing && (event.target as SVGElement).tagName === "circle") {
            const clicked = d3.select(event.target as Element);
            const group = d3.select((event.target as Element).parentNode as Element);
            setIndexDragging([parseInt(group.attr("id")), parseInt(clicked.attr("id"))])
        }
    }

    function handleVertexDrag(event: MouseEvent) {

        /* If there is a vertex to drag (ie. indexDragging holds the index of a vertex),
        then track the mouse coordinates and update the pastPolygons array at the given index. 
        Because of d3 data-binding, any polygons bound to that array will */

        if (indexDragging) {
            const [offsetX, offsetY ] = d3.pointer(event, props.svgElement.current);
            const [x,y] = getProportionalPointerCoords(offsetX, offsetY)
            const newVertex: Vertex = { x: x, y: y};

            const updatedPoints = [...props.polygonPoints]
            updatedPoints[indexDragging[0]][indexDragging[1]] = newVertex
            props.setPolygonPoints(updatedPoints)
        }
    }

    function handleVertexMouseUp(event: MouseEvent) {

        /* Resets the indexDragging state to null (from the index of the dragged point) t
        to end dragging on mouseup. */

        setIndexDragging(null)
    }


    /* ********** POLYLINE DRAWING HANDLERS ********** */


    function handleDrawMouseClick(event: MouseEvent) {

        /* Adds new point to polyline if newVertex is not closing the polygon. 
        Otherwise sets the polygonPoints array to hold the points of the polyline.
        And then rests the points array to empty in order to begin a new polyline. */

        if (props.isDrawing) {
            const [offsetX, offsetY ] = d3.pointer(event, props.svgElement.current);
            const [x,y] = getProportionalPointerCoords(offsetX, offsetY)
            const newVertex: Vertex = { x: x, y: y};
            if (closingPoly(newVertex)) {
                setPoints(prevPoints => prevPoints.splice(-1));
                props.setPolygonPoints((prevPolygonPoints:Vertex[][]) => [...prevPolygonPoints, points]);
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

    function handleDrawMouseDrag(event: MouseEvent) {

        /* this is acting sorta buggy */
        
        if (props.isDrawing && points.length >= 1) {
            const [offsetX, offsetY ] = d3.pointer(event, props.svgElement.current);
            const [x,y] = getProportionalPointerCoords(offsetX, offsetY)
            const newVertex: Vertex = { x: x, y: y};
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

    function closingPoly(v: Vertex) {
        
        /* Checks to see if new vertex is attempting to close the polygon. 
        There needs to be at least 2 existing points for a new vertex to make a polygon.
        And the new vertex must also be sufficiently close to the initial point in the polyline. */

        if (points.length >= 2) {
            if (Math.abs(points[0].x - v.x) <= 7 && 
                Math.abs(points[0].y - v.y) <= 7) {
                return true
            }
        }
        return false
    }

    function convertPoints(points: Vertex[]) {
        /* converts the points stored as [{x1, y1}, {x2, y2}] --> x1,y1 x2,y2 */
        const converted = points.map((pt) => `${pt.x},${pt.y}`).join(' ')
        return converted
    }


    return null; // D3Annotator doesn't render any additional content, it just adds to the existing svg
}
