import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3'
import { off } from 'process';

interface Vertex {
    x: number;
    y: number;
}

export default function D3Annotator() {
    const [points, setPoints] = useState<Vertex[]>([]);
    const [polygons, setPolygons] = useState<SVGPolylineElement[]>([])
    const [width, setWidth] = useState(1)
    const [height, setHeight] = useState(1);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight / 2);
        const svg = d3.select(svgRef.current);
        const polyline = svg
  .selectAll('polyline')
  .data([points])
  .join('polyline')
  .attr('stroke', 'black')
  .attr('fill', 'none')
  .attr('stroke-width', '2');
        svg.on('click', handleMouseClick);
        return () => {
            svg.on('click', null);
        };
    }), [];

    
    useEffect(() => {
        // this useeffect makes sure that the polyline is reloaded everytime i reset points 
        // without the useEffect wrapper, the polyline is one step behind
        const svg = d3.select(svgRef.current);
        const polyline = svg.selectAll('polyline');
        polyline.attr('points', convertPoints(points));
        polyline.exit().remove(); // d3 func that gets rid of any unnessesary polylines
      }, [points]);

    function handleMouseClick (event: MouseEvent) {
        const { offsetX, offsetY } = event;
        const newVertex: Vertex = { x: offsetX, y: offsetY };
        setPoints([...points, newVertex]);
    };


    function convertPoints(points: Vertex[]) {
        // convert the points stored as [{x1, y1}, {x2, y2}] --> x1,y1 x2,y2
        const converted = points.map((pt) => `${pt.x},${pt.y}`).join(' ')
        console.log(converted)
        return converted
    }
   
    return (
        <div>
            <svg ref={svgRef} width={width} height={height}>
                <polyline />
            </svg>
        </div>
    );
}
