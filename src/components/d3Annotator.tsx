import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3'

export default function D3Annotator() {
    const [points, setPoints] = useState<number[]>([1,2,3]);
    const [polygons, setPolygons] = useState<SVGPolylineElement[]>([])
    const [width, setWidth] = useState(1)
    const [height, setHeight] = useState(1);


    useEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight / 2);
        drawPolygon();
    }), [];
    const chartRef = useRef(null);

 

    function handleMouseClick (event: React.MouseEvent<HTMLDivElement>) {
      console.log(event)
      return (null)
    };

    function drawPolygon() {
        return("TO DO: IMPLEMENT POLYGON IN D3")
    }
    return (
        <div onClick={handleMouseClick}>
            {drawPolygon()}
        </div>
    );
}
