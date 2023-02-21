import { writable, type Writable } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';
import type { IMapData } from '$lib/interface/IMapData';
import { defaultWaymarkPresets } from './model/WaymarkPreset';

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

export const waymarkPresets = persisted('waymarkPresets', defaultWaymarkPresets());
