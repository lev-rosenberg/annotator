export interface Point {
  x: number;
  y: number;
}

export interface LabelData {
  label: string
  coords: Point | null
  visible: boolean | null
}

export interface Window {
  width: number
  height: number
}