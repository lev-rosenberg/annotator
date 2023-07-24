import {
  useState,
  useEffect,
  useLayoutEffect,
  RefObject,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import {
  convertPoints,
  isWithinImage,
  getProportionalCoords,
} from "./utilities";
import * as d3 from "d3";
import styles from "../../styles/svgAnnotator.module.css";
import { LabelData, Point, PolygonData } from "../../types/annotatorTypes";

interface annotatorProps {
  svgElement: RefObject<SVGSVGElement>;
  isDrawing: Boolean;
  draftPolygon: Point[] | null;
  polygonsData: PolygonData[];
  setCurrentZoom: Dispatch<number>;
  scaleFactor: number;
}

export function D3Annotator(props: annotatorProps) {
  const svg = d3.select(props.svgElement.current); //the SVG overall layer
  let t: d3.ZoomTransform; //the state of the zoom and pan of the svg
  props.svgElement.current
    ? (t = d3.zoomTransform(props.svgElement.current))
    : (t = d3.zoomIdentity);
  const scale = props.scaleFactor;

  /* ********** ZOOM AND PAN HANDLERS ********** */

  const zoom = d3
    .zoom()
    .scaleExtent([0.05 * scale, 10 * scale])
    //.translateExtent([[0,0],[1500, 600]])
    .on("start", function (e) {
      t = e.transform;
    })
    .on("zoom", function (e) {
      handleSvgZoom(e, scale);
      t = e.transform;
      props.setCurrentZoom(e.transform.k / scale);
    })
    .on("end", function (e) {
      t = e.transform;
    });

  function handleSvgZoom(e: any, scale: number) {
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

  function findClosestPoint(points: Point[], point: Point) {
    function distance(p1: Point, p2: Point) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    let closest = [0, Infinity];
    points.forEach((pt, i) => {
      if (distance(pt, point) < closest[1]) {
        closest = [i, distance(pt, point)];
      }
    });
    return points[closest[0]];
  }

  useEffect(() => {
    props.setCurrentZoom(t.k / scale);
    //these are the funcs

    svg.call(zoom as any, d3.zoomTransform);

    //fit to container & image selectino buttons
    d3.selectAll(".reset").on("click", () => {
      svg
        .transition()
        .duration(250)
        .call(zoom.transform as any, d3.zoomIdentity);
    });

    //Zoom to 100% button
    d3.select(".fullsize").on("click", (e) => {
      svg
        .transition()
        .duration(250)
        .call(zoom.scaleTo as any, scale);
    });
  }, [
    t,
    props.polygonsData,
    props.isDrawing,
    props.scaleFactor,
    svg,
    props,
    scale,
  ]);

  // useEffect(() => {
  //   const labels: LabelData[] = [];
  //   svg.selectAll(".polygon-group").each(function () {
  //     const bbox = (this as SVGSVGElement).getBBox();
  //     const bottomRight: Point = {
  //       x: bbox.x + bbox.width,
  //       y: bbox.y + bbox.height,
  //     };

  //     const i = parseInt(d3.select(this).attr("id"));
  //     const polyPoints = d3.select(this).data();
  //     const closest = findClosestPoint(polyPoints[0] as Point[], bottomRight);
  //     const proportionalCoords = t.apply([closest.x, closest.y]);

  //     if (props.polygonLabels[i]) {
  //       const label = props.polygonLabels[i];
  //       label.coords = {
  //         x: proportionalCoords[0] + 10,
  //         y: proportionalCoords[1] + 10,
  //       };
  //       label.visible = zooming ? false : true;
  //       labels.push(label);
  //     }
  //   });
  //   props.setPolygonLabels(labels);
  // }, [dragging, zooming, props.draftPolygon]);

  return null; // D3Annotator doesn't render additional content, it just adds to the existing svg
}
