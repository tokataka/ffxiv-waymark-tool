export interface IJsonWaymarkMarker {
  X: number;
  Y: number;
  Z: number;
  ID: number;
  Active: boolean;
}

export interface IJsonWaymark {
  [key: string]: number | string | IJsonWaymarkMarker;
  Name: string;
  MapID: number;
  A: IJsonWaymarkMarker;
  B: IJsonWaymarkMarker;
  C: IJsonWaymarkMarker;
  D: IJsonWaymarkMarker;
  One: IJsonWaymarkMarker;
  Two: IJsonWaymarkMarker;
  Three: IJsonWaymarkMarker;
  Four: IJsonWaymarkMarker;
}
