import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import KonvaAnnotator from '../components/konvaDemo/konvaAnnotator';
import styles from '../styles/konvaAnnotator.module.css';


export default function KonvaViewer(): JSX.Element {

  return (
    <div>
      <Link href="/">
        <h3>go back</h3>
      </Link>
      <Link href="/D3Viewer">
        <h3>D3 Demo</h3>
      </Link>
      <div id = "container" className = {styles.container}>
        <KonvaAnnotator/>
      </div>
    </div>
  );
}
