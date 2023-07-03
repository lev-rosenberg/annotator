import React, { useState, useLayoutEffect, useEffect, RefObject } from 'react';
import * as d3 from 'd3'
import styles from '../styles/svgAnnotator.module.css';
import { AnySet } from 'immer/dist/internal';

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
    const [indexDragging, setIndexDragging] = useState<number[] | null>(null) 
    const svg = d3.select(props.svgElement.current);
    const canvas = d3.select(props.canvasRef.current)


   

    useEffect(() => {
        if (props.svgElement) {
            const past_polygons = [];
            const current_polyline = svg.append('g').attr('id', 'drawing_polygon');;
            
            //this is the polyline in process of being drawn
            const polyline = current_polyline
                .selectAll('polyline')
                .data([points])
                .join('polyline')
                .attr('stroke', 'black')
                .attr('fill', 'none')
                .attr('stroke-width', '1')
                .attr('points', convertPoints(points))
                
            
            //this loops through the list of points that past polygons held and constucts a new one. 
            props.polygonPoints.forEach((pts, i) => {
                const past_polygon = svg.append('g').attr('id', (i));
                past_polygons.push(past_polygon);

                const pastCircles  = past_polygon
                    .selectAll('.past_circle')
                    .data(pts)
                    .join( 'circle')
                    .attr('class', 'past_circle')
                    .attr('cx', (pt) => pt.x)
                    .attr('cy', (pt) => pt.y)
                    .attr('r', 5)
                    .attr('fill', (props.isDrawing ? 'none' : 'black'))
                    .attr('fill-opacity', '0.5')
                    .attr('id', (pt, i) => (i))
                    .attr("class", (styles.draggable));
                
                const polygons = past_polygon
                .selectAll('polygon')
                    .data([pts])
                    .join('polygon')
                    .attr('stroke', 'black')
                    .attr('fill', 'none')
                    .attr('stroke-width', '1')
                    .attr('points', convertPoints(pts))
            })

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
                svg.selectAll("*").remove();

            };
        }
    }, [points, indexDragging, props.polygonPoints, props.isDrawing]);

    useEffect(() => {

        if (canvas.node() != null) {
            const context = canvas.node().getContext("2d");
            const image = new Image();
             image.src = "images/dots.jpeg";
            image.onload = function() {
                context.drawImage(image, 0, 0, 900, 600);
        }
    };
        canvas.call(canvasZoom as any, d3.zoomTransform)
        
    }, [props.canvasRef]);    
    

/* ********** ZOOM AND PAN HANDLERS ********** */

    const canvasZoom = d3.zoom().on("zoom", ({transform}) => handleCanvasZoom(transform));
    const zoom = d3.zoom().on('zoom', handleZoom)

    function handleCanvasZoom(transform) {
        console.log(transform)
        // make all canvas groups transform proportionate to the currcent zoom and pan
        
}
    function handleZoom(e:any) {
    
        // make all svg groups transform proportionate to the currcent zoom and pan
        
        d3.selectAll('g').attr('transform', e.transform)

        // keep all the circle radii and line widths proportionate to the zooming scale (e.transform.k)
        d3.selectAll('circle').attr('r', 5 / e.transform.k)
        d3.selectAll('polygon').attr('stroke-width', 1 / e.transform.k)
        d3.selectAll('polyline').attr('stroke-width', 1 / e.transform.k)

        handleCanvasZoom(e)
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
