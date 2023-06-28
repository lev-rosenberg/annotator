import { svg } from 'd3-fetch';
import React, { useEffect, useState, useRef } from 'react';
import Two from "two.js";


function TwoAnnotator() {

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1)
    const [height, setHeight] = useState(1);

    useEffect(() => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight / 2);

        if (!containerRef.current) return;
        const two = new Two({
            type: Two.Types.svg,
            width: 400,
            height: 400,
            autostart: true,
        }).appendTo(containerRef.current);
      
        const line = two.makePath();
            line.noFill();
            line.stroke = 'black';
            line.linewidth = 2;
            line.closed = false

    const onMouseDown = (event: MouseEvent) => {
        const { clientX, clientY } = event;
        if (containerRef.current) {
            const { left, top } = containerRef.current.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;
            line.vertices.push(new Two.Anchor(x, y));
            console.log(line)
        }
     };
     
    if (containerRef.current) {
        containerRef.current.addEventListener('mousedown', onMouseDown);
    }
    return () => {
        if (containerRef.current) {
            containerRef.current.removeEventListener('mousedown', onMouseDown);
        }
        two.clear();
        two.renderer.domElement.remove();
      };
    }), [];
    

    return (
        <div ref={containerRef}>
           hiiii
        </div>
    )
};

export default TwoAnnotator;
