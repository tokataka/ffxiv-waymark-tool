import type { IJsonWaymark, IJsonWaymarkMarker } from '$lib/interface/IJsonWaymark';
import { Waymark, WaymarkId, WaymarkPreset } from '$lib/model/WaymarkPreset';

export function importJsonWaymark(jsonString: string): WaymarkPreset[] | null {
  try {
    const parsed = JSON.parse(jsonString);
    let maybeJsonWaymarks;
    if (parsed instanceof Array) {
      maybeJsonWaymarks = parsed;
    } else {
      maybeJsonWaymarks = [parsed];
    }

    maybeJsonWaymarks.forEach((preset) => validateJsonWaymark(preset));

    return jsonWaymarkToWaymarkPreset(maybeJsonWaymarks as IJsonWaymark[]);
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateJsonWaymark(parsed: any) {
  const objectKeys = ['Name', 'MapID', 'A', 'B', 'C', 'D', 'One', 'Two', 'Three', 'Four'];
  const markerKeys = ['X', 'Y', 'Z', 'ID', 'Active'];

  objectKeys.forEach((key) => {
    if (!Object.keys(parsed).includes(key)) {
      throw 'Invalid JSON';
    }
  });

  for (let i = 0; i < 8; i++) {
    markerKeys.forEach((key) => {
      if (!Object.keys(parsed[WaymarkId[i]]).includes(key)) {
        throw 'Invalid JSON';
      }
    });
  }
}

function jsonWaymarkToWaymarkPreset(jsonWaymarks: IJsonWaymark[]): WaymarkPreset[] {
  const waymarkPresets: WaymarkPreset[] = [];

  for (const jsonWaymark of jsonWaymarks) {
    const waymarks: Waymark[] = [];
    for (let i = 0; i < 8; i++) {
      const jsonWaymarkMarker = jsonWaymark[WaymarkId[i]];

      if (typeof jsonWaymarkMarker === 'string' || typeof jsonWaymarkMarker === 'number') {
        continue;
      }

      waymarks.push(
        new Waymark(
          jsonWaymarkMarker.X,
          jsonWaymarkMarker.Y,
          jsonWaymarkMarker.Z,
          jsonWaymarkMarker.Active
        )
      );
    }

    waymarkPresets.push(new WaymarkPreset(jsonWaymark.MapID, waymarks));
  }

  return waymarkPresets;
}

export function exportJsonWaymark(waymarkPresets: WaymarkPreset[]): string {
  const jsonWaymarks: IJsonWaymark[] = [];

  for (const waymarkPreset of waymarkPresets) {
    const jsonWaymarkMarkers: Record<string, IJsonWaymarkMarker> = {};
    for (let i = 0; i < 8; i++) {
      const waymark = waymarkPreset.waymarks[i];
      jsonWaymarkMarkers[WaymarkId[i]] = {
        ID: i,
        X: waymark.x,
        Y: waymark.y,
        Z: waymark.z,
        Active: waymark.active
      };
    }

    const jsonWaymark: IJsonWaymark = {
      Name: '',
      MapID: waymarkPreset.mapId,
      A: jsonWaymarkMarkers['A'],
      B: jsonWaymarkMarkers['B'],
      C: jsonWaymarkMarkers['C'],
      D: jsonWaymarkMarkers['D'],
      One: jsonWaymarkMarkers['One'],
      Two: jsonWaymarkMarkers['Two'],
      Three: jsonWaymarkMarkers['Three'],
      Four: jsonWaymarkMarkers['Four']
    };

    jsonWaymarks.push(jsonWaymark);
  }

  if (jsonWaymarks.length === 0) {
    return '';
  }

  if (jsonWaymarks.length === 1) {
    return JSON.stringify(jsonWaymarks[0]);
  }

  return JSON.stringify(jsonWaymarks);
}
