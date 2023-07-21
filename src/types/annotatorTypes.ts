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