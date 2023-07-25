import React, { RefObject, useEffect, useState, Dispatch} from 'react'
import * as d3 from 'd3'
import { Point, PolygonData } from "../../types/annotatorTypes";
import {
  convertPoints,
  isWithinImage,
  getProportionalCoords,
} from "./utilities";
import styles from "../../styles/svgAnnotator.module.css";



interface polygonsProps {
  svgElement: RefObject<SVGSVGElement>
  scaleFactor: number
  isDrawing: boolean
  onPolygonChanged: (index: number, polygon: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
  polygonsData: PolygonData[]
}

export function PolygonsDrawer (props: polygonsProps) {
  const svg = d3.select(props.svgElement.current); //the SVG overall layer
  let t: d3.ZoomTransform; //the state of the zoom and pan of the svg
  props.svgElement.current
    ? (t = d3.zoomTransform(props.svgElement.current))
    : (t = d3.zoomIdentity);
  const scale = props.scaleFactor;

  /* ********** DRAGGING HANDLERS ********** */

  const polyDrag = d3.drag().on("drag", function (e: DragEvent) {
    if (!props.isDrawing && isWithinImage(e.x, e.y, scale, props.svgElement)) {
      handlePolygonDrag(this, e);
    }
  });

  function handlePolygonDrag(polygon: Element, e: any) {
    const polygonGroup = d3.select(polygon.parentElement);
    const circles = polygonGroup.selectAll("circle");
    const polygonSvg = polygonGroup.selectAll("polygon");
    const index = parseInt(polygonGroup.attr("id"));
    const newPoints: Point[] = [];
    circles.nodes().forEach((circle) => {
      d3.select(circle)
        .attr("cx", (d: any) => d.x + e.dx)
        .attr("cy", (d: any) => d.y + e.dy);
      const newPoint = {
        x: parseFloat(d3.select(circle).attr("cx")),
        y: parseFloat(d3.select(circle).attr("cy")),
      };
      newPoints.push(newPoint);
    });
    polygonSvg.attr("points", convertPoints(newPoints));

    props.onPolygonChanged(index, newPoints);
  }

  const circleDrag = d3.drag().on("drag", function (e: DragEvent) {
    if (!props.isDrawing && isWithinImage(e.x, e.y, scale, props.svgElement)) {
      handleVertexDrag(this, e);
    }
  });

  function handleVertexDrag(vertex: Element, e: MouseEvent) {
    const dragCircle = d3.select(vertex);
    const polygonGroup = d3.select(vertex.parentElement);
    const circles = polygonGroup.selectAll("circle");
    const index = parseInt(polygonGroup.attr("id"));
    const newPoints: Point[] = [];
    dragCircle.attr("cx", e.x).attr("cy", e.y);
    circles.nodes().forEach((circle) => {
      const newPoint = {
        x: parseFloat(d3.select(circle).attr("cx")),
        y: parseFloat(d3.select(circle).attr("cy")),
      };
      newPoints.push(newPoint);
    });
    props.onPolygonChanged(index, newPoints);
  }


  /* ********** POLYGON DELETION ********** */
  const handlePolygonDelete = 
    (polygon: d3.BaseType) => {
      if (d3.select(polygon).attr("class") == "polygon-group") {
        const p = d3.select(polygon);
        const index = parseInt(p.attr("id"));
        props.onPolygonDeleted(index);
      }
    };
  useEffect(() => {
    // this is the previously drawn polygons, with circles at each vertex.
    svg
      .selectAll(".polygon-group")
      .data(props.polygonsData as PolygonData[]) // associate each polygon with an element of polygonsData[]
      .join(
        (enter) => {
          const polygon = enter
            .append("g")
            .attr("class", "polygon-group")
            .attr("id", (d, i) => i);
          polygon
            .selectAll("circle") //
            .data((d) => d.coordinates as Point[]) // Associate each circle with the vertices of the polygon (subelements of polygonsData)
            .join("circle") // Append a circle for each vertex
            .attr("cx", (pt) => pt.x) // Use the initial vertex's x-coordinate
            .attr("cy", (pt) => pt.y) // Use the initial vertex's y-coordinate
            .attr("id", (d, i, j) => j.length)
            .attr("r", (7 * scale) / t.k)
            .attr("fill", props.isDrawing ? "none" : "red")
            .attr("fill-opacity", "0.5")
            .attr("class", styles.draggable);
          polygon
            .append("polygon")
            .attr("class", styles.polygon)
            .attr("stroke", "red")
            .attr("stroke-width", (2 * scale) / t.k)
            .attr("fill", "none")
            .attr("points", (d) => convertPoints(d.coordinates as Point[]));
          return polygon;
        },
        (update) => {
          /* Update existing polygons and circles with any data that might have changed */
          update
            .selectAll("circle")
            .data((d) => d.coordinates as Point[])
            .attr("cx", (pt) => pt.x) // update the vertex's x-coordinate
            .attr("cy", (pt) => pt.y) // update the vertex's y-coordinate
            .attr("fill", props.isDrawing ? "none" : "red") // props.isDrawing may have updated as well
            .attr("r", (7 * scale) / t.k);

          update
            .select("polygon")
            .attr("stroke-width", (2 * scale) / t.k)
            .attr("points", (d) => convertPoints(d.coordinates as Point[])); // Update the points attribute of the polygon
          return update;
        },
        (exit) => {
          exit
            // .transition()
            // .duration(500)
            // .style('opacity', 0)
            .remove();
        }
      )
      .attr("transform", t.toString());

    svg.selectAll("circle").call(circleDrag as any);
    svg.selectAll("polygon").call(polyDrag as any);

    //deletion
    svg.selectAll(".polygon-group").on("contextmenu", function (e) {
      e.preventDefault();
      handlePolygonDelete(this);
    });

    return () => {
      svg.on("mousedown", null);
      svg.on("click", null);
      svg.on("mousemove", null);
      svg.on("mouseup", null);
      svg.on("zoom", null);
    };
  }, [
    t,
    props.polygonsData,
    props.isDrawing,
    props.scaleFactor,
    svg,
    props,
    scale,
    handlePolygonDelete,
  ]);


  return null
}