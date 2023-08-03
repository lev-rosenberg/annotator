import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  RefObject,
} from "react";
import Link from "next/link";
import { VisxAnnotator } from "../components/visxDemo/visxAnnotator";
import styles from "../styles/svgAnnotator.module.css";
import { Dims, Point, PolygonData } from "../types/annotatorTypes";
import FormDialog from "../components/labelPopup";
import { customJson } from "../components/toFromJson";
import { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";
import Chip from "@mui/material/Chip";
import { convertImgDimsToSvgCoordinates } from "../components/visxDemo/utilities";

export default function VisxViewer(): JSX.Element {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [divDimensions, setDivDimensions] = useState<Dims | undefined>();
  const [imgDimensions, setImgDimensions] = useState<Dims | undefined>();
  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");
  const [currZoom, setCurrZoom] = useState(0.15);
  const [polygonsData, setPolygonsData] = useState<PolygonData[]>([]);
  const [draftPolygon, setDraftPolygon] = useState<Point[] | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isZoomingOrPanning, setIsZoomingOrPanning] = useState<boolean>(false);
  const [polygonDragging, setPolygonDragging] = useState<boolean>(false);

  const [initialTransform, setInitialTransform] = useState<TransformMatrix>({
    scaleX: 0.15,
    scaleY: 0.15,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  });
  const groupRef = useRef<SVGSVGElement | null>(null);
  const [viewLabels, setViewLabels] = useState<boolean>(true);
  const imageX = groupRef.current?.getAttribute("x");
  const imageY = groupRef.current?.getAttribute("y");
  /* ****** IMAGE LOADING BELOW ****** */

  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      handleZoomToFit(img.naturalWidth, img.naturalHeight);
    };
    img.src = "/images/maddoxdev.jpg";
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleResize() {
    const dims = document.querySelector("#container")?.getBoundingClientRect();
    setDivDimensions({
      width: dims?.width,
      height: dims?.height,
    });
  }

  /* ****** IMAGE LOADING ABOVE ****** */

  function handleChangeImage(image: string, num: number) {
    const img = new Image();
    img.onload = function () {
      const jsonData = customJson(num, img.naturalWidth, img.naturalHeight);
      setImgDimensions({ width: img.width, height: img.height });
      setPolygonsData(jsonData);
      // handleCirclesNotVisible();

      assignLabelCoords();

      setCurrImage(image);
      handleZoomToFit(img.naturalWidth, img.naturalHeight);
    };
    img.src = image;
    setIsDrawing(false);
    //
  }

  function handleZoomToFit(imgWidth: number, imgHeight: number) {
    const dims = document.querySelector("#container")?.getBoundingClientRect();
    if (dims) {
      const scale =
        dims.width < imgWidth ? dims.width / imgWidth : dims.height / imgHeight;
      return {
        scaleX: scale,
        scaleY: scale,
        translateX:
          dims.height < imgHeight ? (dims.width - imgWidth * scale) / 2 : 0,
        translateY:
          dims.width < imgWidth ? (dims.height - imgHeight * scale) / 2 : 0,
        skewX: 0,
        skewY: 0,
      };
    }
  }

  /* ****** POLYGON DATA UPDATING BELOW ****** */

  function handlePolygonChanged(index: number, points: Point[]) {
    setPolygonsData((prevPolygonsData) => {
      const newData = [...prevPolygonsData];
      newData[index].label.coords = null;
      newData[index].coordinates = points;
      return newData;
    });
  }

  function handlePolygonDelete(index: number) {
    setPolygonsData((prevPolygonsData) => {
      const newData = [...prevPolygonsData];
      newData.splice(index, 1);
      return newData;
    });
  }

  /* ****** POLYGON DATA UPDATING ABOVE ****** */

  /* ****** LABEL SELECTION AND UPDATING BELOW ****** */

  const getLabelCoords = useCallback(
    (polygon: Point[]) => {
      const offsetX = svgContainerRef.current?.offsetLeft;
      const offsetY = svgContainerRef.current?.offsetTop;
      if (offsetX && offsetY && imageX && imageY) {
        let bottomRightPoint: Point = findBottomRightCoordinate(polygon);
        return {
          x:
            bottomRightPoint.x * currZoom +
            offsetX +
            parseFloat(imageX) +
            10 * currZoom,
          y:
            bottomRightPoint.y * currZoom +
            offsetY +
            parseFloat(imageY) +
            10 * currZoom,
        };
      } else {
        return null;
      }
    },
    [currZoom, imageX, imageY]
  );
  const assignLabelCoords = useCallback(() => {
    setPolygonsData((prevPolygonsData) => {
      const polygons: PolygonData[] = [];
      prevPolygonsData.forEach((polygon) => {
        if (polygon.coordinates) {
          polygon.label.coords = getLabelCoords(polygon.coordinates);
          polygon.label.visible =
            isZoomingOrPanning || polygonDragging ? false : true;
          polygons.push(polygon);
        }
      });
      return polygons;
    });
  }, [getLabelCoords, isZoomingOrPanning, polygonDragging]);

  useEffect(() => {
    assignLabelCoords();
  }, [assignLabelCoords]);

  function handleLabelSelect(option: string) {
    const newLabel = {
      name: option,
      coords: getLabelCoords(draftPolygon!),
      visible: true,
    };
    setPolygonsData((prevData) => [
      ...prevData,
      { coordinates: draftPolygon, label: newLabel },
    ]);
    setDraftPolygon(null);
    setIsDrawing(false);
  }

  function findBottomRightCoordinate(coordinates: Point[]): Point {
    let currCoord: Point = coordinates[0];
    coordinates.map((coord) => {
      if (coord.y > currCoord.y) {
        currCoord = coord;
      }
    });
    return currCoord;
  }

  function isLabelChipVisible(x: number, y: number) {
    const offsetX = svgContainerRef.current?.offsetLeft;
    const offsetY = svgContainerRef.current?.offsetTop;
    const offsetWidth = svgContainerRef.current?.offsetWidth;
    const offsetHeight = svgContainerRef.current?.offsetHeight;

    if (offsetX && offsetY && offsetHeight && offsetWidth) {
      if (
        x < offsetX + offsetWidth &&
        x > offsetX &&
        y < offsetY + offsetHeight &&
        y > offsetY &&
        !isZoomingOrPanning &&
        !polygonDragging
      ) {
        return true;
      }
    } else {
      return false;
    }
  }

  /* ****** LABEL SELECTION AND UPDATING ABOVE ****** */

  return (
    <div>
      <Link href="/">
        <h5>other frameworks</h5>
      </Link>
      <Link href="/D3Viewer">
        <h5>to D3 Demo</h5>
      </Link>
      <Link href="./KonvaViewer">
        <h5>to Konva demo</h5>
      </Link>
      <h3>Visx annotator demo</h3>
      <div className="headerRow">
        <button onClick={() => setIsDrawing(!isDrawing)}>
          {isDrawing ? "Stop drawing" : "Start drawing"}
        </button>
        <div>
          <button
            onClick={() => handleChangeImage("/images/maddoxdev.jpg", 0)}
            className="reset"
          >
            idk what this is tbh (this one is normal)
          </button>
          <button
            onClick={() => handleChangeImage("/images/bigimage.jpg", 0)}
            className="reset"
          >
            tractor go brrrr (this img is huge)
          </button>
          <button
            onClick={() => handleChangeImage("/images/paul.jpg", 0)}
            className="reset"
          >
            paul (lots of polygons)
          </button>
        </div>
      </div>

      <div id="container" className={styles.container} ref={svgContainerRef}>
        <VisxAnnotator
          groupRef={groupRef}
          currImage={currImage}
          divDimensions={divDimensions}
          imgOriginalDims={imgDimensions}
          currZoom={currZoom}
          setCurrZoom={setCurrZoom}
          isDrawing={isDrawing}
          polygonsData={polygonsData}
          onPolygonAdded={(points: Point[]) => setDraftPolygon(points)}
          onPolygonChanged={(index: number, points: Point[]) =>
            handlePolygonChanged(index, points)
          }
          onPolygonDeleted={(index: number) => handlePolygonDelete(index)}
          onZoomPan={(bool: boolean) => setIsZoomingOrPanning(bool)}
          initialTransform={initialTransform}
          handleZoomToFit={handleZoomToFit}
          polygonDragging={polygonDragging}
          onPolygonDrag={(bool) => setPolygonDragging(bool)}
        />
        <FormDialog
          dialogueOpen={draftPolygon != null}
          onLabelSelect={handleLabelSelect}
        />
      </div>
      {viewLabels && (
        <div className="chips">
          {polygonsData.map((polygon, i) => {
            if (polygon.label.coords) {
              return (
                <Chip
                  label={polygon.label.name}
                  color="primary"
                  size="small"
                  key={i}
                  sx={{
                    position: "absolute",
                    top: `${polygon.label.coords?.y}px`,
                    left: `${polygon.label.coords?.x}px`,
                    display: isLabelChipVisible(
                      polygon.label.coords.x,
                      polygon.label.coords.y
                    )
                      ? "flex"
                      : "none",
                  }}
                />
              );
            }
          })}
        </div>
      )}
      <div className="footerRow" style={{ marginTop: "5vh" }}>
        <div>Current Zoom: {Math.round(currZoom * 100)}%</div>
        <button onClick={() => setViewLabels(!viewLabels)}>
          {viewLabels ? "Hide Labels" : "View Labels"}
        </button>
      </div>
      <ul className={styles.li}>
        {polygonsData.map((polygon, i) => (
          <li key={i}>
            <h3>
              polygon {i}: {polygon.label.name}{" "}
            </h3>
            {polygon.coordinates?.map((coords, j) => (
              <p key={j}>
                x: {coords.x} y: {coords.y}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
