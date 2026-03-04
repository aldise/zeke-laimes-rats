export type Segment = {
  id: string;
  text: string;
  color: string;
  textColor: string;
  count: number;
  imageUrl?: string;
  hideText?: boolean;
};

export type WheelSettings = {
  centerText: string;
  centerColor: string;
  centerTextColor: string;
  spinDuration: number;
  pointerColor: string;
  backgroundImageUrl?: string;
  fontFamily?: string;
};
