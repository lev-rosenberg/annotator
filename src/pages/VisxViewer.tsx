import React, { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { VisxAnnotator } from "../components/visxDemo/visxAnnotator";
import styles from "../styles/svgAnnotator.module.css";
import { Dims, Point, PolygonData } from "../types/annotatorTypes";
import FormDialog from "../components/labelPopup";

export default function D3Viewer(): JSX.Element {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [divDimensions, setDivDimensions] = useState<Dims | undefined>();
  const [imgDimensions, setImgDimensions] = useState<Dims | undefined>();
  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");
  const [currZoom, setCurrZoom] = useState(1);
  const [polygonsData, setPolygonsData] = useState<PolygonData[]>([]);
  const [draftPolygon, setDraftPolygon] = useState<Point[] | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = function () {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = "/images/maddoxdev.jpg";
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleResize() {
    setDivDimensions({
      width: svgContainerRef.current?.clientWidth,
      height: svgContainerRef.current?.clientHeight,
    });
  }

  function handleLabelSelect(option: string) {
    const newLabel = {
      name: option,
      coords: null,
      visible: null,
    };
    setPolygonsData((prevData) => [
      ...prevData,
      { coordinates: draftPolygon, label: newLabel },
    ]);
    setDraftPolygon(null);
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
  }

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

      <div id="container" className={styles.container} ref={svgContainerRef}>
        <VisxAnnotator
          currImage={currImage}
          divDimensions={divDimensions}
          imgOriginalDims={imgDimensions}
          currZoom={currZoom}
          setCurrZoom={setCurrZoom}
          polygonsData={polygonsData}
          onPolygonAdded={(points: Point[]) => setDraftPolygon(points)}
          onPolygonChanged={(index: number, points: Point[]) =>
            handlePolygonChanged(index, points)
          }
          onPolygonDeleted={(index: number) => handlePolygonDelete(index)}
        />
        <FormDialog
          dialogueOpen={draftPolygon != null}
          onLabelSelect={handleLabelSelect}
        />
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