export enum WaymarkId {
  A,
  B,
  C,
  D,
  One,
  Two,
  Three,
  Four
}

export class Waymark {
  x: number;
  y: number;
  z: number;
  active: boolean;

  constructor(x?: number, y?: number, z?: number, active?: boolean) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.active = active || false;
  }

  static from(waymark: Waymark): Waymark {
    return new Waymark(waymark.x, waymark.y, waymark.z, waymark.active);
  }
}

export class WaymarkPreset {
  mapId: number;
  waymarks: Waymark[];

  constructor(mapId?: number, waymarks?: Waymark[]) {
    this.mapId = mapId || 0;
    this.waymarks = [];
    if (waymarks) {
      for (let i = 0; i < 8; i++) {
        this.waymarks.push(Waymark.from(waymarks[i]));
      }
    } else {
      for (let i = 0; i < 8; i++) {
        this.waymarks.push(new Waymark());
      }
    }
  }

  static from(waymarkPreset: WaymarkPreset): WaymarkPreset {
    return new WaymarkPreset(waymarkPreset.mapId, waymarkPreset.waymarks);
  }
}

export function defaultWaymarkPresets(): WaymarkPreset[] {
  const presets: WaymarkPreset[] = [];
  for (let i = 0; i < 30; i++) {
    presets.push(new WaymarkPreset());
  }

  return presets;
}
