import React, { useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { VisxAnnotator } from "../components/visxDemo/visxAnnotator";
import styles from "../styles/svgAnnotator.module.css";
import { Dims, LabelData, Point, PolygonData } from "../types/annotatorTypes";

export default function D3Viewer(): JSX.Element {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [divDimensions, setDivDimensions] = useState<Dims | undefined>();
  const [imgDimensions, setImgDimensions] = useState<Dims | undefined>();

  const [currImage, setCurrImage] = useState("/images/maddoxdev.jpg");

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
        />
      </div>
    </div>
  );
}
