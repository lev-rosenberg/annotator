export interface Point {
  x: number;
  y: number;
}

export interface labelData {
  label: string
  coords: Point | null
  visible: boolean | null
}
