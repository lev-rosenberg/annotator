import {
  useState,
  useEffect,
  useLayoutEffect,
  RefObject,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
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
  onPolygonAdded: (polygon: Point[]) => void;
  onPolygonChanged: (index: number, points: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
}

export function D3Annotator(props: annotatorProps) {
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);
  const [polylineLen, setPolylineLen] = useState(0); // true number of vertices in the currently drawn polyline (when drawing, there will be an extra point where the pointer is)
  const svg = d3.select(props.svgElement.current); //the SVG overall layer
  let t: d3.ZoomTransform; //the state of the zoom and pan of the svg
  props.svgElement.current
    ? (t = d3.zoomTransform(props.svgElement.current))
    : (t = d3.zoomIdentity);
  const scale = props.scaleFactor;

  /* POLYLINE CODE BELOW */

  useEffect(() => {
    svg
      .selectAll(".drawing-polyline")
      .data([polylinePoints])
      .join(
        (enter) =>
          enter
            .append("polyline")
            .attr("class", "drawing-polygon")
            .attr("id", "drawing-polygon")
            .attr("stroke", "red")
            .attr("fill", "none")
            .attr("stroke-width", (2 * scale) / t.k)
            .attr("points", (d) => convertPoints(d)),
        (update) => update.attr("points", (d) => convertPoints(d)) // Update the points attribute of the polygon
      )
      .attr("transform", t.toString());

    svg.on("mousedown", function (e) {
      if (props.isDrawing && isWithinImage(e.x, e.y, scale)) {
        handleDrawPolylineOnClick(e);
      }
    });

    svg.selectAll("image").on("mousemove", function (e) {
      handlePolylineFollowMouseMove(e);
    });
    return () => {
      svg.select("#drawing-polygon").remove();
    };
  }, [polylinePoints, scale, svg, t]);

  /* ********** POLYLINE DRAWING HANDLERS ********** */

  function handleDrawPolylineOnClick(event: MouseEvent) {
    /* Adds new point to polyline if newVertex is not closing the polygon. 
    Otherwise sets the polygonsData array to hold the points of the polyline.
    And then rests the polylinePoints array to empty in order to begin a new polyline. */

    const [offsetX, offsetY] = d3.pointer(event, props.svgElement.current);
    const [x, y] = getProportionalCoords(offsetX, offsetY);
    const newVertex: Point = { x: x, y: y };
    if (closingPoly(newVertex, scale)) {
      setPolylinePoints((prevPoints) => prevPoints.splice(-1));
      setPolylinePoints([]);
      setPolylineLen(0);
      props.onPolygonAdded(polylinePoints);
    } else {
      setPolylinePoints((prevPoints) => [...prevPoints, newVertex]);
      setPolylineLen((prevPolylineLen) => prevPolylineLen + 1);
    }
  }

  const handlePolylineFollowMouseMove = (e: MouseEvent) => {
    /* Makes polyline ending segment follow the mouse, unless 
    it is close to the starting vertex, then it snaps into place  */

    if (props.isDrawing && polylinePoints.length >= 1) {
      const [offsetX, offsetY] = d3.pointer(e, props.svgElement.current);
      const [x, y] = getProportionalCoords(offsetX, offsetY);
      const newVertex: Point = { x: x, y: y };
      setPolylinePoints((prevPoints) => {
        const updatedPoints = [...prevPoints];
        if (closingPoly(newVertex, scale)) {
          updatedPoints[polylineLen] = prevPoints[0];
        } else {
          updatedPoints[polylineLen] = newVertex;
        }
        return updatedPoints;
      });
    }
  };

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

  /* ********** DRAGGING HANDLERS ********** */

  const polyDrag = d3.drag().on("drag", function (e: DragEvent) {
    if (!props.isDrawing && isWithinImage(e.x, e.y, scale)) {
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
    if (!props.isDrawing && isWithinImage(e.x, e.y, scale)) {
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

  /* ********** UTILITY FUNCTIONS ********** */

  function convertPoints(points: Point[]) {
    /* converts the points stored as [{x1, y1}, {x2, y2}] --> x1,y1 x2,y2 for input into polyline
         and polygon SVG elements*/

    const converted = points.map((pt) => `${pt.x},${pt.y}`).join(" ");
    return converted;
  }

  function getProportionalCoords(x: number, y: number) {
    /* given coordinates of the element (or pointer) in the container, return the proportional 
    coordinates depending on the zoom and pan. */

    const t = d3.zoomTransform(props.svgElement.current as Element);
    return t.invert([x, y]);
  }

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

  function closingPoly(v: Point, scale: number) {
    /* Checks to see if new vertex is attempting to close the polygon. 
    There needs to be at least 4 existing points for a new vertex to make a polygon. 
    And the new vertex must also be sufficiently close to the initial point in the polyline.
  
    (4 because the smallest shape a triangle has 3 points, plus another point tracked by the
        pointer that popped when the polygon is closed.) */

    if (polylinePoints.length >= 4) {
      if (
        Math.abs(polylinePoints[0].x - v.x) <= (7 * scale) / t.k &&
        Math.abs(polylinePoints[0].y - v.y) <= (7 * scale) / t.k
      ) {
        return true;
      }
    }
    return false;
  }

  const isWithinImage = useCallback(
    (x: number, y: number, scale: number) => {
      if (props.svgElement.current) {
        if (
          x / scale < props.svgElement.current?.clientWidth &&
          x / scale > 0 &&
          y / scale < props.svgElement.current?.clientHeight &&
          y / scale > 0
        ) {
          return true;
        }
      } else {
        return false;
      }
    },
    [props.svgElement]
  );

  /* ********** POLYGON DELETION ********** */
  const handlePolygonDelete = useCallback(
    (polygon: d3.BaseType) => {
      if (d3.select(polygon).attr("class") == "polygon-group") {
        const p = d3.select(polygon);
        const index = parseInt(p.attr("id"));
        props.onPolygonDeleted(index);
      }
    },
    [props]
  );

  useEffect(() => {
    return () => {};
  }, [
    t,
    polylinePoints,
    props.polygonsData,
    props.isDrawing,
    props.scaleFactor,
    svg,
    props,
    scale,
    isWithinImage,
    handlePolygonDelete,
  ]);

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

    props.setCurrentZoom(t.k / scale);
    //these are the funcs

    svg.selectAll("circle").call(circleDrag as any);
    svg.selectAll("polygon").call(polyDrag as any);
    svg.call(zoom as any, d3.zoomTransform);

    //deletion
    svg.selectAll(".polygon-group").on("contextmenu", function (e) {
      e.preventDefault();
      handlePolygonDelete(this);
    });

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

    props.setCurrentZoom(t.k / scale);

    return () => {
      svg.on("mousedown", null);
      svg.on("click", null);
      svg.on("mousemove", null);
      svg.on("mouseup", null);
      svg.on("zoom", null);
    };
  }, [
    t,
    polylinePoints,
    props.polygonsData,
    props.isDrawing,
    props.scaleFactor,
    svg,
    props,
    scale,
    isWithinImage,
    handlePolygonDelete,
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
