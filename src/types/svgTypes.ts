export interface Point {
  x: number;
  y: number;
}

export interface LabelData {
  label: string
  coords: Point | null
  visible: boolean | null
}

export interface Dims {
  width: number | undefined
  height: number | undefined
}