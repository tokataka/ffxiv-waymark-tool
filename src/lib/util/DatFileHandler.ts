import type { IFileData } from '$lib/interface/IFileData';
import { Waymark, WaymarkPreset } from '../model/WaymarkPreset';
import { saveAs } from 'file-saver';

export async function importDatFile(
  file: File
): Promise<{ fileData: IFileData; waymarkPresets: WaymarkPreset[] }> {
  const buf = await file.arrayBuffer();
  const rawData = new Uint8Array(buf);

  const header = rawData.slice(0, 16);

  const validBytes = new DataView(header.buffer, 8, 4).getUint32(0, true);

  const xorData = rawData.slice(16).map((_) => _ ^ 0x31);

  let currentOffset = 16;
  let sectionId: number;
  let sectionLength: number;

  const sections = [];
  let waymarkSectionId = -1;

  while (currentOffset < validBytes) {
    if (validBytes <= currentOffset + 16) {
      return Promise.reject('Section header corruped: offset=' + currentOffset);
    }

    sectionId = new DataView(xorData.buffer, currentOffset, 2).getUint16(0, true);

    // Skip 6 bytes (unknown)
    sectionLength = new DataView(xorData.buffer, currentOffset + 8, 4).getUint32(0, true);

    if (validBytes <= currentOffset + sectionLength) {
      return Promise.reject('Section body corruped: offset=' + currentOffset);
    }

    // Skip 4 bytes (unknown)
    sections.push({
      id: sectionId,
      length: sectionLength,
      headerData: xorData.slice(currentOffset, currentOffset + 16),
      bodyData: xorData.slice(currentOffset + 16, currentOffset + 16 + sectionLength),
      offset: currentOffset
    });

    if (sectionId === 0x11) {
      waymarkSectionId = sections.length - 1;
    }

    // Skip 4 bytes (unknown)
    currentOffset += 16 + sectionLength + 4;
  }

  if (waymarkSectionId < 0) {
    return Promise.reject('No waymark section found');
  }

  const waymarkSection = sections[waymarkSectionId];
  const waymarkPresets: WaymarkPreset[] = [];

  // Skip 16 bytes (unknown)
  let waymarkOffset = 16;

  while (waymarkOffset + 104 < waymarkSection.length) {
    const currentWaymarks: Waymark[] = [];

    // Marker positions
    for (let i = 0; i < 8; i++) {
      const buffer = new DataView(waymarkSection.bodyData.buffer, waymarkOffset, 12);

      const curX = buffer.getInt32(0, true) / 1000;
      const curY = buffer.getInt32(4, true) / 1000;
      const curZ = buffer.getInt32(8, true) / 1000;

      currentWaymarks.push(new Waymark(curX, curY, curZ));

      waymarkOffset += 12;
    }

    const activeMask = new DataView(waymarkSection.bodyData.buffer, waymarkOffset, 1).getUint8(0);

    for (let i = 0; i < 8; i++) {
      currentWaymarks[i].active = (activeMask & (1 << i)) > 0;
    }

    // Skip 1 byte (maybe further active mask bit?)
    waymarkOffset += 2;

    const currentMapId = new DataView(waymarkSection.bodyData.buffer, waymarkOffset, 2).getUint16(
      0,
      true
    );

    // Skip 4 bytes (timestamp)
    waymarkOffset += 6;

    waymarkPresets.push(new WaymarkPreset(currentMapId, currentWaymarks));
  }

  return {
    fileData: {
      header,
      xorData,
      waymarkStartOffset: waymarkSection.offset + 32,
      waymarkCount: waymarkPresets.length
    },
    waymarkPresets
  };
}

export function exportDatFile(
  fileData: IFileData,
  waymarkPresets: WaymarkPreset[],
  indexToExport: number[]
) {
  const { header, xorData, waymarkStartOffset } = fileData;

  for (const waymarkIndex of indexToExport) {
    const waymarkPreset = waymarkPresets[waymarkIndex];
    let waymarkOffset = waymarkStartOffset + waymarkIndex * 104;

    for (let i = 0; i < 8; i++) {
      const buffer = new DataView(xorData.buffer, waymarkOffset, 12);
      buffer.setInt32(0, waymarkPreset.waymarks[i].x * 1000, true);
      buffer.setInt32(4, waymarkPreset.waymarks[i].y * 1000, true);
      buffer.setInt32(8, waymarkPreset.waymarks[i].z * 1000, true);

      waymarkOffset += 12;
    }

    let activeMask = 0;
    for (let i = 0; i < 8; i++) {
      activeMask |= (waymarkPreset.waymarks[i].active ? 1 : 0) << i;
    }
    new DataView(xorData.buffer, waymarkOffset, 1).setUint8(0, activeMask);

    waymarkOffset += 2;

    new DataView(xorData.buffer, waymarkOffset, 2).setUint16(0, waymarkPreset.mapId, true);
  }

  const datFile = new Uint8Array([...header, ...xorData.map((_) => _ ^ 0x31)]);
  const datFileBlob = new Blob([datFile]);

  saveAs(datFileBlob, 'UISAVE.DAT');
}
