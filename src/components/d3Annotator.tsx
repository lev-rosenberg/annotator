import React, { useState, useEffect, RefObject } from 'react';
import * as d3 from 'd3'
import { Bool } from 'reselect/es/types';
import styles from '../styles/svgAnnotator.module.css';

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
}

export default function D3Annotator(props: annotatorProps) {
    
    const [points, setPoints] = useState<Vertex[]>([]);
    const [isDrawing, setDrawing] = useState<Boolean>(props.isDrawing)
    const [indexDragging, setIndexDragging] = useState<number[] | null>(null)

    
    const svg = d3.select(props.svgElement.current);
    
    useEffect(() => {
        if (props.svgElement) {
            const past_polygons:any = [];
            // svg.select('#drawing_polygon').remove()
            // past_polygons.forEach((past_polygon:any) => past_polygon.remove());
            const current_polyline = svg.append('g').attr('id', 'drawing_polygon');;
            
            
            const polyline = current_polyline
                .selectAll('polyline')
                .data([points])
                .join('polyline')
                .attr('stroke', 'black')
                .attr('fill', 'none')
                
                .attr('stroke-width', '1')
                .attr('points', convertPoints(points))
                

            const currCircles = current_polyline
                .selectAll('.curr_circle')
                .data(points)
                .join('circle')
                .attr('class', 'curr_circle')
                .attr('cx', (pt) => pt.x)
                .attr('cy', (pt) => pt.y)
                .attr('r', 2)
                .attr('fill', 'black');
            
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
            svg.on('mousemove', handleVertexDrag);
            svg.on('mouseup', handleVertexMouseUp);

            return () => {
                svg.on('click', null);
                current_polyline.remove()
                past_polygons.forEach((past_polygon:any) => past_polygon.remove());
            };
        }
    }), [];

    function handleVertexMouseDown(event: MouseEvent) {  
        /* Check if you are clicking on a circle and that you aren't actively drawing polygons. 
        Then, get the id's of the circle you clicked and its parent group. These will be how 
        you index into the polygonPoints array. For instance, if you clicked on circle 4 in 
        polygon 11, then you can index into polygonPoints[11][4].   */  
        // Get the clicked circle
        if (!props.isDrawing && (event.target as SVGElement).tagName === "circle") {
            const clicked = d3.select(event.target as Element);
            const group = d3.select((event.target as Element).parentNode as Element);
            const circle_id = clicked.attr("id")
            const group_id = group.attr("id")
            setIndexDragging([parseInt(group_id), parseInt(circle_id)])
        }
    }

    function handleVertexDrag(event: MouseEvent) {

        /* If there is a vertex to drag (ie. indexDragging holds the index of a vertex),
        then track the mouse coordinates and update the pastPolygons array at the given index. 
        Because of d3 data-binding, any polygons bound to that array will */

        if (indexDragging) {
            const { offsetX, offsetY } = event;
            const newVertex: Vertex = { x: offsetX, y: offsetY};

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

    function handleDrawMouseClick(event: MouseEvent) {

        /* Adds new point to polyline if newVertex is not closing the polygon. 
        Otherwise sets the polygonPoints array to hold the points of the polyline.
        And then rests the points array to empty in order to begin a new polyline. */

        if (props.isDrawing) {
            const { offsetX, offsetY } = event;
            const newVertex: Vertex = { x: offsetX, y: offsetY};
            if (closingPoly(newVertex)) {
                props.setPolygonPoints((prevPolygonPoints:Vertex[][]) => [...prevPolygonPoints, points]);
                setPoints([]);
            }
            else {
                setPoints(prevPoints => [...prevPoints, newVertex]);
            }
        }
    };

    function closingPoly(v: Vertex) {
        
        /* Checks to see if new vertex is attempting to close the polygon. 
        There needs to be at least 2 existing points for a new vertex to make a polygon.
        And the new vertex must also be sufficiently close to the initial point in the polyline. */

        if (points.length >= 2) {
            if (Math.abs(points[0].x - v.x) <= 7 && 
                Math.abs(points[0].y - v.y) <= 7) {
                props.setOpen(true)
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
