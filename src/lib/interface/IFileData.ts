export interface IFileData {
  header: Uint8Array;
  xorData: Uint8Array;
  waymarkStartOffset: number;
  waymarkCount: number;
}
