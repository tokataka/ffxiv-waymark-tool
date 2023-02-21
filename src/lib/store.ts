import { writable, type Writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';
import type { IMapData } from '$lib/interface/IMapData';
import { WaymarkPreset } from './model/WaymarkPreset';

export const mapData: Writable<Record<number, IMapData>> = writable({
  [0]: {
    mapName: '--',
    mapFile: 'default',
    subMaps: [
      {
        mapFileIndex: '00',
        subMapName: '',
        sizeFactor: 100,
        offsetX: 0,
        offsetY: 0
      }
    ]
  }
});

export const mapImage: Writable<Record<string, ImageBitmap>> = writable({});

const defaultWaymarkPresets: WaymarkPreset[] = [];
for (let i = 0; i < 30; i++) {
  defaultWaymarkPresets.push(new WaymarkPreset());
}
export const waymarkPresets = persisted('waymarkPresets', defaultWaymarkPresets);
