import Papa from 'papaparse';
import { PUBLIC_CSV_BASE_URL } from '$env/static/public';
import axios, { type AxiosResponse } from 'axios';
import type { IMapData } from '$lib/interface/IMapData';

export default async function loadCsv() {
  const placeNameData: Record<string, string> = {};
  const territoryData: Record<string, IMapData> = {};
  const mapIdToTerritoryId: Record<string, string> = {};
  const mapData: Record<number, IMapData> = {};

  let res: AxiosResponse<string, unknown>;
  let papaResult: Papa.ParseResult<string[]>;

  res = await axios.get(`${PUBLIC_CSV_BASE_URL}/PlaceName.csv`);
  papaResult = Papa.parse<string[]>(res.data);
  papaResult.data.forEach((value, index) => {
    if (index < 3) return;
    if (value.length < 13) return;

    const placeNameId = value[0];
    const placeName = value[1];

    placeNameData[placeNameId] = placeName;
  });

  res = await axios.get(`${PUBLIC_CSV_BASE_URL}/Map.csv`);
  papaResult = Papa.parse<string[]>(res.data);
  papaResult.data.forEach((value, index) => {
    if (index < 3) return;
    if (value.length < 21) return;

    const mapId = value[0];
    const territoryId = value[16];
    const [mapFile, mapFileIndex] = value[7].split('/');
    if (!mapFile) return;
    const subMapName = placeNameData[value[13]];
    const sizeFactor = Number(value[8]);
    const offsetX = Number(value[9]);
    const offsetY = Number(value[10]);

    if (!(territoryId in territoryData)) {
      territoryData[territoryId] = { mapName: '', mapFile, subMaps: [] };
    }

    territoryData[territoryId].subMaps.push({
      mapFileIndex,
      subMapName,
      sizeFactor,
      offsetX,
      offsetY
    });

    mapIdToTerritoryId[mapId] = territoryId;
  });

  res = await axios.get(`${PUBLIC_CSV_BASE_URL}/TerritoryType.csv`);
  papaResult = Papa.parse<string[]>(res.data);
  papaResult.data.forEach((value, index) => {
    if (index < 3) return;
    if (value.length < 44) return;

    const territoryId = value[0];
    const mapId = value[7];
    const exclusiveType = value[9];
    if (exclusiveType !== '2') return;

    if (!(territoryId in territoryData)) {
      if (!(mapId in mapIdToTerritoryId)) return;

      const prevTerritoryId = mapIdToTerritoryId[mapId];
      territoryData[territoryId] = {
        mapName: '',
        mapFile: territoryData[prevTerritoryId].mapFile,
        subMaps: territoryData[prevTerritoryId].subMaps
      };
    }
  });

  res = await axios.get(`${PUBLIC_CSV_BASE_URL}/ContentFinderCondition.csv`);
  papaResult = Papa.parse<string[]>(res.data);
  papaResult.data.forEach((value, index) => {
    if (index < 3) return;
    if (value.length < 95) return;

    const contentfinderConditionId = Number(value[0]);
    const territoryId = value[2];
    if (!(territoryId in territoryData)) return;

    const mapName = value[42];
    if (!mapName) return;

    const isPvp = value[5];
    if (isPvp === 'True') return;

    const contentType = value[44];
    // [Dungeons, Trials, Raids, Deep Dungeons, Eureka, Ultimate Raids, V&C Dungeon Finder]
    const wantedContentTypes = ['2', '4', '5', '21', '26', '28', '30'];
    if (!wantedContentTypes.includes(contentType)) return;

    const currentMapData = territoryData[territoryId];

    currentMapData.mapName = mapName;

    mapData[contentfinderConditionId] = currentMapData;
  });

  return mapData;
}
