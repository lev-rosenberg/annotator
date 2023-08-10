import React, { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";

import { Zoom } from "@visx/zoom";
import { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";

import VisxAnnotator from "../components/visxDemo/visxAnnotator";
import FormDialog from "../components/labelPopup";
import { customJson } from "../components/toFromJson";
import styles from "../styles/svgAnnotator.module.css";
import { Dims, Point, PolygonData } from "../types/annotatorTypes";
import Chip from "@mui/material/Chip";

export default function VisxViewer(): JSX.Element {
  /* ******* STATE MANAGMENT BELOW ******* */

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGSVGElement | null>(null);

  const [divDimensions, setDivDimensions] = useState<Dims | undefined>();
  const [imgDimensions, setImgDimensions] = useState<Dims | undefined>();

  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");
  const [currZoom, setCurrZoom] = useState(0.15);

  const [polygonsData, setPolygonsData] = useState<PolygonData[]>([]);
  const [draftPolygon, setDraftPolygon] = useState<Point[] | null>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [polygonDragging, setPolygonDragging] = useState<boolean>(false);
  const [viewLabels, setViewLabels] = useState<boolean>(true);
  const [polygonsEditable, setPolygonsEditable] = useState<boolean[]>([]);

  /* ******* STATE MANAGMENT ABOVE ******* */

  const imageX = groupRef.current?.getAttribute("x");
  const imageY = groupRef.current?.getAttribute("y");
  const scale =
    divDimensions?.width! < imgDimensions?.width!
      ? divDimensions?.width! / imgDimensions?.width!
      : divDimensions?.height! / imgDimensions?.height!;

  /* ****** IMAGE LOADING BELOW ****** */

  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = "/images/maddoxdev.jpg";
    handleResize();
    handleCirclesNotVisible();
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

  function handleChangeImage(
    image: string,
    num: number,
    zoom: ProvidedZoom<SVGSVGElement>
  ) {
    const img = new Image();
    img.onload = function () {
      const jsonData = customJson(num, img.naturalWidth, img.naturalHeight);
      setImgDimensions({ width: img.width, height: img.height });
      setPolygonsData(jsonData);
      handleCirclesNotVisible();

      assignLabelCoords();
      setCurrImage(image);
      handleZoomToFit(img.naturalWidth, img.naturalHeight, zoom)!;
    };
    img.src = image;
    setIsDrawing(false);
  }

  /* ********* ZOOMING FUNCTIONS BELOW ********* */

  function handleZoom100(zoom: ProvidedZoom<SVGSVGElement> & any) {
    if (divDimensions?.width && divDimensions.height) {
      const center = {
        x: divDimensions?.width / 2,
        y: divDimensions?.height / 2,
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
      setCurrZoom(1);
    }
  }
  function handleZoomToFit(
    imgWidth: number,
    imgHeight: number,
    zoom: ProvidedZoom<SVGSVGElement>
  ) {
    const dims = document.querySelector("#container")?.getBoundingClientRect();
    if (dims) {
      const scale =
        dims.width < imgWidth ? dims.width / imgWidth : dims.height / imgHeight;
      setCurrZoom(scale);
      zoom.setTransformMatrix({
        scaleX: scale,
        scaleY: scale,
        translateX:
          dims.height < imgHeight ? (dims.width - imgWidth * scale) / 2 : 0,
        translateY:
          dims.width < imgWidth ? (dims.height - imgHeight * scale) / 2 : 0,
        skewX: 0,
        skewY: 0,
      });
    }
  }
  /* ********* ZOOMING FUNCTIONS ABOVE ********* */

  /* ****** POLYGON DATA UPDATING BELOW ****** */

  function handleCirclesNotVisible() {
    setPolygonsEditable((prevPolygonsEditable) => {
      const newData = Array(prevPolygonsEditable.length).fill(false);
      return newData;
    });
  }

  function handlePolygonClicked(index: number) {
    setPolygonsEditable((prevPolygonsEditable) => {
      const newData = Array(prevPolygonsEditable.length).fill(false);
      newData[index] = true;
      return newData;
    });
  }

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
    setPolygonsEditable((prevPolygonsEditable) => {
      const newData = [...prevPolygonsEditable];
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
          polygon.label.visible = isPanning || polygonDragging ? false : true;
          polygons.push(polygon);
        }
      });
      return polygons;
    });
  }, [getLabelCoords, isPanning, polygonDragging]);

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
    setPolygonsEditable((prevPolygonsVisible) => {
      return [...prevPolygonsVisible, false];
    });
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
        !isPanning &&
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
    <Zoom<SVGSVGElement>
      width={divDimensions?.width ? divDimensions?.width : 100}
      height={divDimensions?.height ? divDimensions?.height : 100}
      scaleXMin={1 / 20}
      scaleXMax={10}
      scaleYMin={1 / 20}
      scaleYMax={10}
    >
      {(zoom) => (
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
            <button
              onClick={() => {
                setIsDrawing(!isDrawing);
                handleCirclesNotVisible();
              }}
            >
              {isDrawing ? "Stop drawing" : "Start drawing"}
            </button>
            <div>
              <button
                onClick={() =>
                  handleChangeImage("/images/maddoxdev.jpg", 0, zoom)
                }
                className="reset"
              >
                idk what this is tbh (this img is avergae)
              </button>
              <button
                onClick={() =>
                  handleChangeImage("/images/bigimage.jpg", 0, zoom)
                }
                className="reset"
              >
                tractor go brrrr (this img is huge)
              </button>
              <button
                onClick={() => handleChangeImage("/images/paul.jpg", 0, zoom)}
                className="reset"
              >
                paul (this img is small)
              </button>
            </div>
          </div>
          <div
            id="container"
            className={styles.container}
            ref={svgContainerRef}
          >
            {imgDimensions && (
              <VisxAnnotator
                groupRef={groupRef}
                currImage={currImage}
                divDimensions={divDimensions}
                imgDimensions={imgDimensions}
                currZoom={currZoom}
                setCurrZoom={setCurrZoom}
                isDrawing={isDrawing}
                polygonsData={polygonsData}
                onPolygonAdded={(points: Point[]) => setDraftPolygon(points)}
                onPolygonChanged={(index: number, points: Point[]) =>
                  handlePolygonChanged(index, points)
                }
                onPolygonDeleted={(index: number) => handlePolygonDelete(index)}
                onZoomPan={(bool: boolean) => setIsPanning(bool)}
                polygonDragging={polygonDragging}
                onPolygonDrag={(bool) => setPolygonDragging(bool)}
                zoom={zoom}
                fitOnLoad={(width: number, height: number) =>
                  handleZoomToFit(width, height, zoom)
                }
                polygonsEditable={polygonsEditable}
                onPolygonClicked={(index) => handlePolygonClicked(index)}
              />
            )}
            <FormDialog
              dialogueOpen={draftPolygon != null}
              onLabelSelect={(option: string) => handleLabelSelect(option)}
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
            <div>
              Current Zoom: {Math.round(currZoom * 100)}%
              <div>
                <button
                  onClick={() => {
                    handleZoomToFit(
                      imgDimensions?.width!,
                      imgDimensions?.height!,
                      zoom
                    );
                    setCurrZoom(scale);
                  }}
                >
                  Fit to container
                </button>
                <button onClick={() => handleZoom100(zoom)}>
                  Zoom to 100%
                </button>
              </div>
            </div>
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
      )}
    </Zoom>
  );
}
