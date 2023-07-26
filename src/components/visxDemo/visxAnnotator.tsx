import React, { useRef, RefObject, useEffect, useState } from "react";
import { LinePath } from "@visx/shape";
import { useDrag, Drag } from "@visx/drag";
import { localPoint } from "@visx/event";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import { Point, PolygonData, Dims } from "../../types/annotatorTypes";
import styles from "../../styles/svgAnnotator.module.css";

interface annotatorProps {
  currImage: string;
  divDimensions: Dims | undefined;
  imgOriginalDims: Dims | undefined;
}

export function VisxAnnotator(props: annotatorProps) {
  const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);
  const imgRef = useRef<SVGImageElement | null>(null);

  function getProportionalCoordsToImg(e) {
    if (imgRef.current && props.imgOriginalDims) {
      const mouse = localPoint(e);
      const { x, y, width } = imgRef.current.getBBox()!;
      const scale = width / props.imgOriginalDims.width!;
      const proportional = {
        x: (mouse!.x - x) / scale,
        y: (mouse!.y - y) / scale,
      };
      console.log(proportional);
    }
  }

  return (
    <Zoom<SVGSVGElement>
      width={props.divDimensions ? props.divDimensions.width! : 100}
      height={props.divDimensions ? props.divDimensions.height! : 100}
      scaleXMin={1 / 2}
      scaleXMax={4}
      scaleYMin={1 / 2}
      scaleYMax={4}
    >
      {(zoom) => (
        <svg className={styles.svg} width="100%" height="100%">
          <Group
            width="100%"
            // transform={zoom.toString()}
          >
            <Drag
              width={props.divDimensions ? props.divDimensions.width! : 100}
              height={props.divDimensions ? props.divDimensions.height! : 100}
              onDragStart={() => {}}
              snapToPointer={false}
            >
              {({ dragStart, dragEnd, dragMove, isDragging, x, y, dx, dy }) => (
                <image
                  className={styles.img}
                  href={props.currImage}
                  ref={imgRef}
                  width="100%"
                  x={x ? x + dx : dx}
                  y={y ? y + dy : dy}
                  onClick={(e) => getProportionalCoordsToImg(e)}
                  onMouseMove={dragMove}
                  onMouseUp={dragEnd}
                  onMouseDown={dragStart}
                  // onWheel={(e) => {
                  //   const point = localPoint(e) || { x: 0, y: 0 };
                  //   console.log(point);
                  //   zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                  // }}
                />
              )}
            </Drag>
          </Group>
        </svg>
      )}
    </Zoom>
  );
}
