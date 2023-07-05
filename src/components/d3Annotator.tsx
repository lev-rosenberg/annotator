import React, { useState, useLayoutEffect, useEffect, RefObject } from 'react';
import * as d3 from 'd3'
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
    width: number | undefined
    height: number | undefined
    setCurrentZoom: any
}

export default function D3Annotator(props: annotatorProps) {
    
    const [points, setPoints] = useState<Vertex[]>([]);
    const [polylineLen, setPolylineLen] = useState(0)
    const [indexDragging, setIndexDragging] = useState<number[] | null>(null) // the index of the vertex being dragged
    const svg = d3.select(props.svgElement.current);
    let t: any
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
        const current_polyline = svg.append('polyline')
            .attr('id', 'drawing_polygon')
            .attr('stroke', 'white')
            .attr('fill', 'none')
            .attr('stroke-width', 2 / t.k)
            .attr('points', convertPoints(points))
            .attr('transform', t.toString())

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
                        .attr('r', 5 / t.k)
                        .attr('fill', (props.isDrawing ? 'none' : 'white'))
                        .attr('fill-opacity', '0.5')
                        .attr('id', (pt, i) => i)
                        .attr('class', styles.draggable);
                    polygon.append('polygon')
                        .attr('stroke', 'white')
                        .attr('fill', 'none')
                        .attr('stroke-width', 2 / t.k)
                        .attr('points', (d => convertPoints(d)));
                    return polygon;
                },
                //this is pointless with the useEffect but im keeping it here for the logic
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
                  }
            )
            .attr('transform', t.toString())


        
        svg.on('mousedown', handleVertexMouseDown)
        svg.on('click', handleDrawPolylineClick) 
        svg.on('mousemove', function(e) {
            handleDrawPolylineDrag(e);
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
            svg.selectAll("polyline").remove().exit();
            svg.selectAll(".polygon-group").remove().exit();

        };
    }, [points, indexDragging, props.polygonPoints, props.isDrawing, t.x, t.y]);
   
    

/* ********** ZOOM AND PAN HANDLERS ********** */

    const zoom = d3.zoom().scaleExtent([1, 10]).translateExtent([[0,0],[width!, height!]])
        .on("zoom", handleSvgZoom)
    

    function handleSvgZoom(e:any) {
        // make all svg groups transform proportionate to the currcent zoom and pan

        if (!indexDragging) {
            const t = e.transform
            props.setCurrentZoom(t.k)
            d3.selectAll('g').attr('transform', t)
            d3.selectAll('polyline').attr('transform', t)
            d3.selectAll('image').attr('transform', t)

            // keep all the circle radii and line widths proportionate to the zooming scale (e.transform.k)
            d3.selectAll('circle').attr('r', 5 / e.transform.k)
            d3.selectAll('polygon').attr('stroke-width', 2 / e.transform.k)
            d3.selectAll('polyline').attr('stroke-width', 2 / e.transform.k)
        }
    }
   
// TRY SEEING IF ADAPTING THIS TO THE POINTS WORKS

    function getProportionalCoords(x: number, y: number) {
        
        /* given coordinates of the element (or pointer) in the container, return the proportional 
        coordinates depending on the zoom and pan. */

        t = d3.zoomTransform(props.svgElement.current as Element);
        return t.invert([x,y])
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
            const [x,y] = getProportionalCoords(offsetX, offsetY)
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


    function handleDrawPolylineClick(event: MouseEvent) {

        /* Adds new point to polyline if newVertex is not closing the polygon. 
        Otherwise sets the polygonPoints array to hold the points of the polyline.
        And then rests the points array to empty in order to begin a new polyline. */
        

        if (props.isDrawing) {
            const [offsetX, offsetY ] = d3.pointer(event, props.svgElement.current);
            console.log(offsetX,offsetY)
            const [x,y] = getProportionalCoords(offsetX, offsetY)
             //after panning, click twice and you will notice that this is x,y 2 dif pts. but offsetXY is not! this means smth is wrong wityh getpropcoords
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

    function handleDrawPolylineDrag(event: MouseEvent) {

        /* this is acting sorta buggy */
        
        if (props.isDrawing && points.length >= 1) {
            const [offsetX, offsetY] = d3.pointer(event, props.svgElement.current);
            const [x,y] = getProportionalCoords(offsetX, offsetY)
            const newVertex: Vertex = { x: x, y: y };
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

        /* converts the points stored as [{x1, y1}, {x2, y2}] --> x1,y1 x2,y2 for input into polyline
         and polygon SVG elements*/

        const converted = points.map((pt) => `${pt.x},${pt.y}`).join(' ')
        return converted
    }


    return null; // D3Annotator doesn't render any additional content, it just adds to the existing svg
}
