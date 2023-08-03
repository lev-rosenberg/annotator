import React, { useEffect, useState, useRef } from "react";
import { PaperScope, Path, Color, Segment, Point } from "paper";
import { Settings } from "http2";
import { PathSegment } from "konva/lib/types";

function PaperAnnotator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currSegments, setCurrSegments] = useState<paper.Segment[]>();
  const [paths, setPaths] = useState<any>([]);
  const paperScope = new PaperScope();

  useEffect(() => {
    // Create a Paper.js scope

    if (canvasRef.current) {
      // Set up the Paper.js canvas
      paperScope.setup(canvasRef.current);
    }

    // Draw a line on mouse down
    const path = new Path();
    path.strokeColor = new Color("black");

    function onMouseDown(event: any) {
      path.add(event.point);
      const segs = path.segments;
      setCurrSegments(segs);
    }

    function onDoubleClick(event: any) {
      path.closed = true;
    }
    paperScope.view.on("mousedown", onMouseDown);
    paperScope.view.on("doubleclick", onDoubleClick);

    // Clean up
    return () => {
      paperScope.view.off("mousedown", onMouseDown);
      paperScope.view.off("doubleclick", onDoubleClick);
      paperScope.project.clear();
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default PaperAnnotator;
