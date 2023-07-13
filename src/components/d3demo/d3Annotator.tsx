import { useState, useEffect, useLayoutEffect, RefObject, Dispatch, SetStateAction } from 'react';
import * as d3 from 'd3'
import styles from '../../styles/svgAnnotator.module.css';
import * as controls from './d3polygonControls';
import { LabelData, Point } from '../../types/svgTypes';
import { FastLayer } from 'react-konva';


interface annotatorProps {
    svgElement: RefObject<SVGSVGElement>
    isDrawing: Boolean
    setIsDrawing: Dispatch<SetStateAction<boolean>>
    setDialogueOpen: Dispatch<SetStateAction<boolean>>
    dialogueOpen: Boolean
    polygonLabels: LabelData[]
    setPolygonLabels: Dispatch<SetStateAction<LabelData[]>>
    polygonPoints: Point[][]
    setPolygonPoints: Dispatch<SetStateAction<Point[][]>>
    setCurrentZoom: Dispatch<number>
    scaleFactor: number
}

export function D3Annotator(props: annotatorProps) {
    
    // the coordinates of vertices in the currently drawn polyline
    const [points, setPoints] = useState<Point[]>([]); 

    // the number of vertices in the currently drawn polyline 
    // (this doesn't always correspond with points. something i should rewrite cause it's unnesesarily complicated)
    const [polylineLen, setPolylineLen] = useState(0) 

    const [dragging, setDragging] = useState(false)
    const [zooming, setZooming] = useState(false)
    const [isSelected, setIsSelected] = useState(null)

    //the SVG overall layer
    const svg = d3.select(props.svgElement.current)
    //the state of the zoom and pan of the svg
    let t: d3.ZoomTransform
    props.svgElement.current ? (t = d3.zoomTransform(props.svgElement.current)) : (t = d3.zoomIdentity)
    
    const scale = props.scaleFactor

    useLayoutEffect(() => {

        //this is the polygon being drawn onClick
        const current_polyline = svg.selectAll('.drawing-polyline')
            .data([points])
            .join(
                enter => 
                    enter.append('polyline').attr('class', 'drawing-polygon')
                    .attr('id', 'drawing-polygon')
                    .attr('stroke', 'red')
                    .attr('fill', 'none')
                    .attr('stroke-width', (2*scale) / t.k)
                    .attr('points', d => convertPoints(d)) 
                ,
                update => 
                    update
                        .attr('points', (d => convertPoints(d))) // Update the points attribute of the polygon
                        .attr('stroke', 'blakc')
                
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
                        .attr('id', (d, i, j) => j.length)
                        .attr('r', (7*scale)/t.k)
                        .attr('fill', (props.isDrawing ? 'none' : 'red'))
                        .attr('fill-opacity', '0.5')
                        .attr('class', styles.draggable)
                        
                    polygon.append('polygon')
                        .attr('class', styles.polygon)
                        .attr('stroke', 'red')
                        .attr('stroke-width', (2*scale) / t.k)
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
                      .attr('fill', (props.isDrawing ? 'none' : 'red')) // props.isDrawing may have updated as well
                      .attr('r', (7*scale) / t.k) 
                
                    update
                      .select('polygon')
                      .attr('stroke-width', (2*scale) / t.k)
                      .attr('points', (d => convertPoints(d))) // Update the points attribute of the polygon
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
            

        if (props.isDrawing) {
            svg.on('mousedown', function(e) {
                if (isWithinImage(e.x, e.y, scale)) {
                    console.log(isWithinImage(e.x, e.y, scale))
                    controls.handleDrawPolylineOnClick(e, props.svgElement, points, setPoints, props.polygonPoints, props.setPolygonPoints, setPolylineLen, 
                        props.setDialogueOpen,
                        props.setIsDrawing, t, scale)
                }
                
            });
        }
        svg.on('mousemove', function(e) {
            handlePolylineMouseMove(e, );
            });        
        svg.selectAll('circle').call(circleDrag as any)
        svg.selectAll('.polygon-group').call(polyDrag as any)
        svg.call(zoom as any, d3.zoomTransform)

        svg.selectAll('.polygon-group').on("contextmenu", function (e) {
            e.preventDefault();
            handlePolygonDelete(this)
        });

        // reset button
        d3.select("#reset").on("click", () => {
            svg.transition()
            .duration(250)
            .call(zoom.transform as any, d3.zoomIdentity)
        })

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
        const labels: LabelData[] = []
        svg.selectAll('.polygon-group').each(function() {

            const bbox = (this as SVGSVGElement).getBBox()
            const bottomRight: Point = {x: bbox.x + bbox.width, y: bbox.y + bbox.height}
            
            const i = parseInt(d3.select(this).attr('id'))
            const polyPoints = d3.select(this).data()
            const closest = findClosestPoint(polyPoints[0] as Point[], bottomRight)
            const proportionalCoords = t.apply([closest.x, closest.y])

            if (props.polygonLabels[i]) {
                const label = props.polygonLabels[i]
                label.coords = {x: proportionalCoords[0] + 10, y: proportionalCoords[1] + 10}
                label.visible = (zooming) ? false : true
                labels.push(label)
            }
        })
        props.setPolygonLabels(labels)
        

    }, [t, dragging, zooming, props.dialogueOpen])

/* ********** ZOOM AND PAN HANDLERS ********** */

    const zoom = d3.zoom().scaleExtent([0.5, 10])
    //.translateExtent([[0,0],[1500, 600]])
        .on("start", function(e) {
            t = e.transform;
            setZooming(true)
        })
        .on("zoom", function(e) {
            controls.handleSvgZoom(e, scale);
            props.setCurrentZoom(e.transform.k)
            t = e.transform;
        })
        .on("end", function(e) {
            t = e.transform;
            setZooming(false)
        })
    
        

    

/* ********** DRAGGING HANDLERS ********** */

    const circleDrag = d3.drag()
        .on('start', () => setDragging(true))
        .on('drag', function(e) {
            if (!props.isDrawing && isWithinImage(e.x + e.dx, e.y + e.dy, scale)) {
                controls.handleVertexDrag(this, e, props.polygonPoints, props.setPolygonPoints)
            }
            
        })
        .on('end', () => setDragging(false))
    const polyDrag = d3.drag()
        .on('start', () => setDragging(true))
        .on('drag', function(e) {
            if (props.isDrawing) return;
  
            
            if (isWithinImage(e.x, e.y, scale)) {
                controls.handlePolygonDrag(this, e, t, props.polygonPoints, props.setPolygonPoints);
            }
        })
        .on('end', () => setDragging(false))

    /* ********** POLYLINE DRAWING HANDLERS ********** */


    function handlePolylineMouseMove(e: MouseEvent) {

        /* this is acting sorta buggy */
        
        if (props.isDrawing && points.length >= 1 && isWithinImage(e.x, e.y, scale)) {
            const [offsetX, offsetY] = d3.pointer(e, props.svgElement.current);
            const [x,y] = controls.getProportionalCoords(offsetX, offsetY, props.svgElement.current);
            const newVertex: Point = { x: x, y: y };
            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                if (controls.closingPoly(newVertex, points, t, props.scaleFactor)) {
                  updatedPoints[polylineLen] = prevPoints[0];
                } else {
                  updatedPoints[polylineLen] = newVertex;
                }
                return updatedPoints;
            });
        }
    }


    /* ********** POLYGON DELETION ********** */
    
    function handlePolygonDelete(polygon: d3.BaseType) {
        if (d3.select(polygon).attr('class') == 'polygon-group') {
            const p = d3.select(polygon)
            const index = parseInt(p.attr('id'))

            
            let updatedPoints = [...props.polygonPoints]
            // updatedPoints.splice(index, 1)
            // props.setPolygonPoints(updatedPoints);
            props.setPolygonPoints(prevPolygonPoints => (
                
                [...prevPolygonPoints].splice(index+1, 1)
                ));

            // let updatedLabels = [...props.polygonLabels]
            // updatedLabels.splice(index, 1)
            // props.setPolygonLabels(updatedLabels);

            props.setPolygonLabels(prevPolygonLabels => [...prevPolygonLabels].splice(index+1, 1));
        }
    }


    /* ********** UTILITY FUNCTIONS ********** */


    function convertPoints(points: Point[]) {

        /* converts the points stored as [{x1, y1}, {x2, y2}] --> x1,y1 x2,y2 for input into polyline
         and polygon SVG elements*/

        const converted = points.map((pt) => `${pt.x},${pt.y}`).join(' ')
        return converted
    }

    function findClosestPoint(points: Point[], point: Point) {
        function distance(p1: Point, p2: Point) {
            return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
        }
        let closest = [0, Infinity]
        points.forEach((pt, i) => {
            if (distance(pt, point) < closest[1]) {
                closest = [i, distance(pt, point)]
            }
        })
        return points[closest[0]]
    }

    function isWithinImage(x: number, y: number, scale: number) {
        if ((x/scale < props.svgElement.current?.clientWidth)
            && (x/scale > 0)
            && (y/scale < (props.svgElement.current?.clientHeight))
            && (y/scale > 0)) {
                return true
            } 
        else {
            return false
        }
    }


    return null; // D3Annotator doesn't render additional content, it just adds to the existing svg
}
