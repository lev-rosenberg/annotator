import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { Dims } from '../../types/annotatorTypes';
import useImage from 'use-image';

import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { Stage, Layer, Circle, Line, Image } from "react-konva";


export default function KonvaAnnotator(): JSX.Element {

  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const scaleBy = 1.05;

  const [divDimensions, setDivDimensions] = useState<Dims>()
  const [image] = useImage('/images/maddoxdev.jpg');

  useEffect(() => {
    const dims = document.querySelector('#container')?.getBoundingClientRect();
    setDivDimensions({width: dims?.width, height: dims?.height})
  }, [])


  function DemoImage() {
    return (
      <Image 
        image={image}
        
      />
    )
  };

  function zoomLayer(e: KonvaEventObject<WheelEvent>) {   
    e.evt.preventDefault(); // stop default scrolling 
    const layer = layerRef.current
    const stage = stageRef.current

    if (layer && stage) {
      const oldScale = layer.scaleX();
      console.log(oldScale)
      const pointer = stage.getRelativePointerPosition();
      const mousePointTo = {
        x: (pointer.x - layer.x()) / oldScale,
        y: (pointer.y - layer.y()) / oldScale,
      };
      // how to scale? Zoom in? Or zoom out?
      let direction = e.evt.deltaY > 0 ? 1 : -1;
      var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      layer.scale({ x: newScale, y: newScale });
        var newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        layer.position(newPos);
    }
  }
  
  return (
    <Stage
      ref={stageRef}
      width={divDimensions?.width} height={divDimensions?.height}
      draggable
      onWheel = {zoomLayer}
    >
      <Layer
        ref={layerRef}
        scaleX={0.2} scaleY={0.2}>
        <DemoImage/>
      </Layer>
    </Stage>
  );
}
