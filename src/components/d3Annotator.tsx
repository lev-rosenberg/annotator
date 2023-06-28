import React, { useState, useEffect, RefObject } from 'react';
import * as d3 from 'd3'

interface Vertex {
    x: number;
    y: number;
}
interface annotatorProps {
    svgElement: RefObject<SVGSVGElement>
}

export default function D3Annotator(props: annotatorProps) {
    
    const [points, setPoints] = useState<Vertex[]>([]);
    const [polygonPoints, setPolygonPoints] = useState<Vertex[][]>([]);

    const svg = d3.select(props.svgElement.current);
    
    console.log("d3annotator being called")
    console.log(props.svgElement)

    useEffect(() => {
        if (props.svgElement) {
            
            const current_polyline = svg.append('g');
            const past_polygons:any = [];
            
            const polyline = current_polyline
                .selectAll('polyline')
                .data([points])
                .join('polyline')
                .attr('stroke', 'black')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('points', convertPoints(points))

            const currCircles = current_polyline
                .selectAll('.curr_circle')
                .data(points)
                .join('circle')
                .attr('class', 'curr_circle')
                .attr('cx', (pt) => pt.x)
                .attr('cy', (pt) => pt.y)
                .attr('r', 3)
                .attr('fill', 'black');
            
            polygonPoints.forEach((pts, i) => {
                const past_polygon = svg.append('g').attr('id', 'polygon' + (i));
                past_polygons.push(past_polygon);

                const pastCircles  = past_polygon
                    .selectAll('.past_circle')
                    .data(pts)
                    .join( 'circle')
                    .attr('class', 'past_circle')
                    .attr('cx', (pt) => pt.x)
                    .attr('cy', (pt) => pt.y)
                    .attr('r', 3)
                    .attr('fill', 'black');
                
                const polygons = past_polygon
                .selectAll('polygon')
                    .data(pts)
                    .join('polygon')
                    .attr('stroke', 'black')
                    .attr('fill', 'none')
                    .attr('stroke-width', '2')
                    .attr('points', convertPoints(pts))
            })    
            
            svg.on('click', handleMouseClick);
          
            return () => {
                svg.on('click', null);
                current_polyline.remove()
                past_polygons.forEach((past_polygon:any) => past_polygon.remove());
            };
        }
    }), [props.svgElement];

    function handleMouseClick(event: MouseEvent) {

        /* Adds new point to polyline if newVertex is not closing the polygon. 
        Otherwise sets the polygonPoints array to hold the points of the polyline.
        And then rests the points array to empty in order to begin a new polyline. */

        const { offsetX, offsetY } = event;
        const newVertex: Vertex = { x: offsetX, y: offsetY};
        if (closingPoly(newVertex)) {
            setPolygonPoints((prevPolygonPoints) => [...prevPolygonPoints, points]);
            setPoints([]);
        }
        else {
            setPoints(prevPoints => [...prevPoints, newVertex]);
        }
    };

    function closingPoly(v: Vertex) {
        /* Checks to see if new vertex is attempting to close the polygon. 
        There needs to be at least 2 existing points for a new vertex to make a polygon.
        And the new vertex must also be sufficiently close to the initial point in the polyline.*/
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
