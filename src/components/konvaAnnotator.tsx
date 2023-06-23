import { KonvaEventObject } from 'konva/lib/Node';
import { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Vector2d } from 'konva/lib/types';
import React from 'react';
import { useState, useEffect } from 'react';
import { Stage, Layer, Circle, Rect, Line, Text } from 'react-konva';


export default function KonvaAnnotator(): JSX.Element {
    const [points, setPoints] = useState<number[]>([]);
    const [polygons, setPolygons] = useState<number[][]>([])
    const [width, setWidth] = useState(1)
    const [height, setHeight] = useState(1);

    useEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight/2);
      }), [];
    
    // IF I WANT TO KEEP TRACK OF AND EDIT THE VERTICES, I COULD KEEP TRACK OF THE CIRCLES AND HAVE THE POINTS ARRAY ADJUST EACH TIME A CIRCLE MOVES? 
    
    const handleStageClick = (coords:Vector2d|null) => {
        const newPointX = coords?.x
        const newPointY = coords?.y
        if (newPointX && newPointY ) {
            // Are we starting a new polygon? ie. no points added yet. 
            // If not, check to see if we ae closing the polygon
            // If so, add the starting point
            if (points.length > 0) { 
                const updatedPoints = [...points, newPointX, newPointY];
                // Is the new added point very close to the first point? ie. trying to close the polygon? 
                // If so, append the points list to the list of polygon
                // Otherwise, just add a new point to the current polygon
                if (Math.abs(points[0] - newPointX) <= 10 && 
                    Math.abs(points[1] - newPointY) <= 10) {
                    const polyPoints = [...points, points[0], points[1]]
                    setPolygons((prevPolygons) => [...prevPolygons, polyPoints]);
                    setPoints([])
                }
                else {
                    setPoints(updatedPoints);
                }
            } 
            else {
                setPoints([newPointX, newPointY]);
            }
        }
    }
    function Polygon(props: {pts: number[]}) {
        const pts = props.pts
        return (
            <>
                <Line
                    x={0}
                    y={0}
                    points={pts}
                    stroke="black"
                    draggable
                />
                {pts.map((pt, i) => {
                    if (i % 2 == 0) {
                        return (
                            <Circle
                                key = {i}
                                x = {pts[i]}
                                y = {pts[i+1]}
                                radius = {3}
                                fill="black"
                                draggable
                            />
                        )
                    }
                })}
            </>
        );
    };
    return (
        <Stage width={width} height={height} 
        onClick={(e) => {
            const stage = e.target.getStage();
            if (stage) {
                const mousepos = stage.getPointerPosition()
                console.log(mousepos)
                handleStageClick(mousepos)
            }
            console.log(polygons)
        }}
        >
            <Layer>
                <Text text="This test is the only one which can end finish polygons––the others are just polylines with no end (i realized there was no need to build it out that much to get a feel of the framework)" />
                <Polygon pts = {points}/>
                {polygons.map((poly_pts, i) => {
                    return (<Polygon 
                                pts = {poly_pts}
                                key = {i}/>)
                })}
            </Layer>
        </Stage>
    )
}