
  import { Point } from "../../types/annotatorTypes"
  /* ********* UTILITY FUNCTIONS BELOW ********* */

  export function convertPoints(points: Point[]) {
    const converted: number[] = [];
    points.map((obj) => converted.push(obj.x, obj.y));
    return converted;
  }



  export function isPointWithinImage(x: number, y: number, image: HTMLImageElement | undefined) {
    if (image) {
      if (x < image.width && x > 0 && y < image.height && y > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  /* ********* UTILITY FUNCTIONS ABOVE ********* */
