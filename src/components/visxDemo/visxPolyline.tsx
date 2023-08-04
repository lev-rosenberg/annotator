import { LinePath, Line } from "@visx/shape";
import { localPoint } from "@visx/event";
import { Group } from "@visx/group";
import { convertSvgCoordinatesToImgDims } from "./utilities";

import { Point } from "../../types/annotatorTypes";
import { RefObject } from "react";

interface annotatorProps {
  groupRef: RefObject<SVGSVGElement>;
  polylinePoints: Point[];
  mousePos: Point | undefined;
  zoom: any;
}

export function PolylineDrawer(props: annotatorProps) {
  function polylineToMouse() {
    const start: Point | undefined = props.polylinePoints.at(-1);
    if (props.polylinePoints.length > 0 && props.mousePos && start) {
      const end: Point = convertSvgCoordinatesToImgDims(
        props.mousePos,
        props.groupRef
      );
      return [start, end];
    } else {
      return [];
    }
  }
  return (
    <Group>
      <Line // this is the line from the end of the polyline to my mouse as you draw
        from={props.polylinePoints.at(-1)}
        to={polylineToMouse()[1]}
        strokeWidth={1 / props.zoom.transformMatrix.scaleX}
        stroke="red"
      />
      <LinePath
        data={props.polylinePoints}
        stroke="red"
        strokeWidth={1 / props.zoom.transformMatrix.scaleX}
        x={(d) => d.x}
        y={(d) => d.y}
      />
    </Group>
  );
}
