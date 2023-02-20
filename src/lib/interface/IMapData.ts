export interface IMapData {
  mapName: string;
  mapFile: string;
  subMaps: {
    subMapName: string;
    mapFileIndex: string;
    sizeFactor: number;
    offsetX: number;
    offsetY: number;
  }[];
}
