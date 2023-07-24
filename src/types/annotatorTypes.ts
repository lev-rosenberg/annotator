export interface Point {
  x: number;
  y: number;
}

export interface LabelData {
  name: string
  coords: Point | null
  visible: boolean | null
}

export interface Dims {
  width: number | undefined
  height: number | undefined
}
export interface PolygonData {
  coordinates: Point[] | null
  label: LabelData
}




/// this is for the JSON
interface Label {
  coordinates: Point[];
  id: string;
  polygonId: string;
  probability: null;
  type: string;
}

// Define an interface for the 'LatestHumanAnnotation' type
interface LatestHumanAnnotation {
  createdAt: number;
  id: string;
  inferenceId: string;
  labels: Label[];
  // ... Add any other properties as needed
}

// Define an interface for the 'Annotation' type
interface Annotation {
  latestHumanAnnotation: LatestHumanAnnotation;
  machinePrediction: null;
}

// Define an interface for the 'Annotations' type with a string index signature
export interface Annotations {
  [key: string]: Annotation;
}