import { useEffect, RefObject, Dispatch } from "react";

import * as d3 from "d3";
import { Point, PolygonData } from "../../types/annotatorTypes";

interface annotatorProps {
  svgElement: RefObject<SVGSVGElement>;
  isDrawing: Boolean;
  draftPolygon: Point[] | null;
  polygonsData: PolygonData[];
  setIsDraggingLayer: (bool: boolean) => void;
  setCurrentZoom: Dispatch<number>;
  scaleFactor: number;
}

export function D3ZoomPan(props: annotatorProps) {
  const svg = d3.select<SVGSVGElement, unknown>(props.svgElement.current!); //the SVG overall layer
  let t: d3.ZoomTransform; //the state of the zoom and pan of the svg
  props.svgElement.current
    ? (t = d3.zoomTransform(props.svgElement.current))
    : (t = d3.zoomIdentity);
  const scale = props.scaleFactor;

  /* ********** ZOOM AND PAN HANDLERS ********** */

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.05 * scale, 10 * scale])
    .on("start", function (e) {
      t = e.transform;
      props.setIsDraggingLayer(true);
    })
    .on("zoom", function (e) {
      handleSvgZoom(e, scale);

      t = e.transform;
      props.setCurrentZoom(e.transform.k / scale);
    })
    .on("end", function (e) {
      t = e.transform;
      props.setIsDraggingLayer(false);
    });

  function handleSvgZoom(
    e: d3.D3ZoomEvent<SVGElement, SVGElement>,
    scale: number
  ) {
    /* make all svg groups transform proportionate to the current zoom and pan */
    const t = e.transform;
    d3.selectAll(".polygon-group").attr("transform", t.toString());
    d3.selectAll("polyline").attr("transform", t.toString());
    d3.selectAll("image").attr("transform", t.toString());

    // keep all the circle radii and line widths proportionate to the zooming scale (e.transform.k)
    d3.selectAll("circle").attr("r", (7 * scale) / t.k);
    d3.selectAll("polygon").attr("stroke-width", (2 * scale) / t.k);
    d3.selectAll("polyline").attr("stroke-width", (2 * scale) / t.k);
  }

  /* ********** UTILITY FUNCTIONS ********** */

  useEffect(() => {
    svg.call(zoom, d3.zoomTransform);

    d3.selectAll(".reset").on("click", () => {
      svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity);
    });
    d3.select(".fullsize").on("click", (e) => {
      svg.transition().duration(250).call(zoom.scaleTo, scale);
    });
    props.setCurrentZoom(t.k / scale);
  }, [
    t,
    props.polygonsData,
    props.isDrawing,
    props.scaleFactor,
    svg,
    props,
    scale,
    zoom,
  ]);

  return null; // D3Annotator doesn't render additional content, it just adds to the existing svg
}
