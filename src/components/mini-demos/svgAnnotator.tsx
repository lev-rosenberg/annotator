import React, { useState, useEffect, useRef } from 'react';

interface Vertex {
  x: number;
  y: number;
}

const Circle: React.FC<Vertex> = ({ x, y }) => (
  <circle cx={x} cy={y} r="3" fill="black" />
);

export default function SvgAnnotator() {
    const [points, setPoints] = useState<Vertex[]>([]);
    const [polygons, setPolygons] = useState<Vertex[][]>([])
    const [width, setWidth] = useState(1)
    const [height, setHeight] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight / 2);
    }), [];

    function handleMouseClick (event: React.MouseEvent<HTMLDivElement>) {
        const container = containerRef.current?.getBoundingClientRect();
        if (container) {
            const { left, top } = container;
            const { pageX, pageY } = event;
            console.log(scrollX,scrollY)
            const newPoint = {x: pageX - left + scrollX, y: pageY - top - scrollY}
            // TO DO: IMPLEMENT POLYGON ENDING (IE. CLOSE POLYGONS AND START A NEW ONE)
            if (points.length > 0 &&
                Math.abs(points[0].x - newPoint.x) <= 10 && 
                Math.abs(points[0].y - newPoint.y) <= 10) {
                console.log(points)
            }
            else {
                setPoints([...points, newPoint]);
                const svg = document.getElementById('svg');
                if (svg instanceof SVGSVGElement) {
                    const svgPoint = svg.createSVGPoint();
                    svgPoint.x = newPoint.x
                    svgPoint.y = newPoint.y
                    const polyline = document.getElementById('curr_polyline');
                    if (polyline instanceof SVGPolylineElement) {
                        // console.log(polyline)
                        polyline.points.appendItem(svgPoint);
                    }
                }
            }
            
        }
    };

    function newPolygon() {
        //USE THE POLYGON ELEMENT NOT POLYLINE!!
    }

    return (
        <div ref = {containerRef} onClick={handleMouseClick}>
            <svg id = "svg" width={width} height={height}>

                {points.map((pt, index) => (
                    <Circle key={index} x={pt.x} y={pt.y} />
                ))}
                <polyline id = "curr_polyline" points={""} fill="none" stroke="black" strokeWidth="2" />
            </svg>
        </div>
    );
}
