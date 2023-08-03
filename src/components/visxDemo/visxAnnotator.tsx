import React, { useRef, RefObject, useState, Dispatch } from "react";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import {
  convertImgDimsToSvgCoordinates,
  convertSvgCoordinatesToImgDims,
} from "./utilities";
import { PolygonDrawer } from "./visxPolygon";
import { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";

import { PolylineDrawer } from "./visxPolyline";
import { Point, PolygonData, Dims } from "../../types/annotatorTypes";
import styles from "../../styles/svgAnnotator.module.css";

interface annotatorProps {
  groupRef: RefObject<SVGSVGElement>;
  currImage: string;
  divDimensions: Dims | undefined;
  imgOriginalDims: Dims | undefined;
  currZoom: number;
  polygonsData: PolygonData[];
  isDrawing: boolean;
  polygonDragging: boolean;
  onPolygonDrag: (bool: boolean) => void;
  initialTransform: TransformMatrix;
  onZoomPan: (bool: boolean) => void;
  setCurrZoom: Dispatch<number>;
  onPolygonAdded: (points: Point[]) => void;
  onPolygonChanged: (index: number, points: Point[]) => void;
  onPolygonDeleted: (index: number) => void;
  handleZoomToFit: (width: number, height: number) => TransformMatrix | void;
}

export function VisxAnnotator(props: annotatorProps) {
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point>();

  const imgRef = useRef<SVGImageElement | null>(null);
  const groupRef = props.groupRef;

  const containerWidth = props.divDimensions?.width;
  const containerHeight = props.divDimensions?.height;

  const scale =
    containerWidth! < props.imgOriginalDims?.width!
      ? containerWidth! / props.imgOriginalDims?.width!
      : containerHeight! / props.imgOriginalDims?.height!;

  /* ********* POLYLINE DRAWING FUNCTIONS BELOW ********* */

  function handleDrawPolylineOnClick(
    e: React.MouseEvent<SVGElement, MouseEvent>
  ) {
    const mouse = localPoint(e);
    if (mouse) {
      const prop = convertSvgCoordinatesToImgDims(mouse, groupRef);

      if (!isClosingPolygon(mouse) && prop) {
        setPolylinePoints((prevPolylinePoints) => [
          ...prevPolylinePoints,
          prop,
        ]);
      } else {
        props.onPolygonAdded(polylinePoints);
        setPolylinePoints([]);
      }
    }
  }

  function isClosingPolygon(point: Point) {
    if (polylinePoints.length >= 3) {
      const propPoint = convertSvgCoordinatesToImgDims(point, groupRef);
      if (
        Math.abs(polylinePoints[0].x - propPoint.x) <=
          7 / parseFloat(groupRef.current?.getAttribute("scale")!) &&
        Math.abs(polylinePoints[0].y - propPoint.y) <=
          7 / parseFloat(groupRef.current?.getAttribute("scale")!)
      ) {
        return true;
      }
    }
    return false;
  }

  function handleMouseMove(e: React.MouseEvent<SVGElement, MouseEvent>) {
    const pointer = localPoint(e);
    if (pointer && !isClosingPolygon(pointer)) {
      setMousePos(pointer);
    } else {
      const snap = convertImgDimsToSvgCoordinates(polylinePoints[0], groupRef);
      setMousePos(snap);
    }
  }

  /* ********* POLYLINE DRAWING FUNCTIONS ABOVE ********* */

  /* ********* ZOOMING FUNCTIONS BELOW ********* */

  function zoom100(zoom: ProvidedZoom<SVGSVGElement> & any) {
    if (containerWidth && containerHeight) {
      const center = {
        x: containerWidth / 2,
        y: containerHeight / 2,
      };
      const relatedTo = {
        x:
          (center.x - zoom.transformMatrix.translateX) /
          zoom.transformMatrix.scaleX,
        y:
          (center.y - zoom.transformMatrix.translateY) /
          zoom.transformMatrix.scaleY,
      };
      const transformMatrix = {
        scaleX: 1,
        scaleY: 1,
        translateX: center.x - relatedTo.x,
        translateY: center.y - relatedTo.y,
        skewX: 0,
        skewY: 0,
      };
      zoom.setTransformMatrix(transformMatrix);
      props.setCurrZoom(1);
    }
  }

  /* ********* ZOOMING FUNCTIONS ABOVE ********* */

  return (
    <Zoom<SVGSVGElement>
      width={containerWidth ? containerWidth : 100}
      height={containerHeight ? containerHeight : 100}
      initialTransformMatrix={props.initialTransform}
      scaleXMin={1 / 20}
      scaleXMax={10}
      scaleYMin={1 / 20}
      scaleYMax={10}
      // wheelDelta={(e) => {
      //   console.log(Math.sign(e.deltaY) * 1.05);
      //   return {
      //     scaleX: Math.sign(e.deltaY) * 1.05
      //   };
      // }}
    >
      {(zoom) => (
        <>
          <svg
            className={styles.svg}
            width={containerWidth}
            height={containerHeight}
            ref={!props.polygonDragging ? zoom.containerRef : null}
            style={{
              cursor: zoom.isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onWheel={(e) => {
              props.setCurrZoom(zoom.transformMatrix.scaleX);
            }}
            onMouseDown={() => {
              if (!props.isDrawing) {
                props.onZoomPan(true);
              }
            }}
            onMouseMove={(e) => {
              handleMouseMove(e);
            }}
            onMouseUp={(e) => props.onZoomPan(false)}
          >
            <Group
              transform={zoom.toString()}
              innerRef={groupRef}
              x={zoom.transformMatrix.translateX}
              y={zoom.transformMatrix.translateY}
              scale={zoom.transformMatrix.scaleX}
              style={{
                cursor: props.isDrawing
                  ? "crosshair"
                  : zoom.isDragging
                  ? "grabbing"
                  : "grab",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!zoom.isDragging && props.isDrawing) {
                  handleDrawPolylineOnClick(e);
                }
              }}
            >
              <>
                <image
                  className={styles.img}
                  href={props.currImage}
                  ref={imgRef}
                />
                {polylinePoints.length && (
                  <PolylineDrawer
                    groupRef={groupRef}
                    polylinePoints={polylinePoints}
                    mousePos={mousePos}
                    zoom={zoom}
                  />
                )}
                {props.polygonsData.map((polygon, i) => (
                  <PolygonDrawer
                    i={i}
                    key={i}
                    width={containerWidth ? containerWidth : 100}
                    height={containerHeight ? containerHeight : 100}
                    zoom={zoom}
                    imgOriginalDims={props.imgOriginalDims}
                    polygon={polygon}
                    onPolygonChanged={props.onPolygonChanged}
                    onPolygonDeleted={props.onPolygonDeleted}
                    groupRef={groupRef}
                    polygonDragging={props.polygonDragging}
                    onPolygonDrag={(bool) => props.onPolygonDrag(bool)}
                  />
                ))}
              </>
            </Group>
          </svg>
          <div>
            <button
              onClick={() => {
                zoom.setTransformMatrix(
                  props.handleZoomToFit(
                    props.imgOriginalDims?.width!,
                    props.imgOriginalDims?.height!
                  )!
                );
                props.setCurrZoom(scale);
              }}
            >
              Fit to container
            </button>
            <button onClick={() => zoom100(zoom)}>Zoom to 100%</button>
          </div>
        </>
      )}
    </Zoom>
  );
}
