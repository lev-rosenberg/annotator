import React, { useEffect, useState, useMemo, useRef } from 'react';
import { SVG } from '@svgdotjs/svg.js';

export default function SVGJSAnnotator() {

  useEffect(() => {
    var draw = SVG().addTo('#drawing')
    const arr = Array().fill([])
    const p = draw.polyline(arr)
      .fill('none')
      .stroke({ color: '#f06', width: 5 })
    draw.click(function(e:MouseEvent) {
      // console.log(e)
      const { x, y } = draw.point(e.pageX, e.pageY)
      arr.push([x, y])
      if (arr.length > 40) arr.shift()
      p.plot(arr)
    })
  }), [];
  

  return (
    <div id='drawing'>
      hiii
    </div>
  );
}
