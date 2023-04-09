<script lang="ts">
  import { onMount } from 'svelte';
  import MapCanvas from '$lib/component/MapCanvas.svelte';
  import Sidebar from '$lib/component/Sidebar.svelte';
  import { mapData, waymarkPresets } from '$lib/store';
  import loadCsv from '$lib/util/LoadCsv';
  import { PUBLIC_MARKER_BASE_URL } from '$env/static/public';
  import ImportModal from '$lib/component/ImportModal.svelte';
  import ExportModal from '$lib/component/ExportModal.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { WaymarkId, WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { NumberInput, Label, Checkbox, Radio, Select, P } from 'flowbite-svelte';

  let importOpen = false;
  let exportOpen = false;

  const canvasSize = 512;

  let currentPresetId = 0;
  let prevPresetId = 0;
  let currentSubMapId = 0;

  let currentPreset: WaymarkPreset;
  $: {
    currentPreset = $waymarkPresets[currentPresetId];
  }

  $: {
    if (prevPresetId !== currentPresetId) {
      currentSubMapId = 0;
      prevPresetId = currentPresetId;
    }
  }

  $: {
    // To persist waymarkPresets on change
    $waymarkPresets = $waymarkPresets;
  }

  onMount(async () => {
    $mapData = {
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
      },
      ...(await loadCsv())
    };
  });
</script>

<svelte:head>
  <title>FFXIV Waymark Tool</title>
</svelte:head>

<ImportModal bind:open={importOpen} bind:waymarkPresets={$waymarkPresets} />
<ExportModal bind:open={exportOpen} bind:waymarkPresets={$waymarkPresets} />

<div class="container">
  <Navbar bind:importOpen bind:exportOpen />

  <Sidebar bind:waymarkPresets={$waymarkPresets} bind:currentPresetId />

  <div class="flex flex-wrap items-center !ml-72 mt-20 mr-4" style="--canvas-size:{canvasSize};">
    <div class="canvas-container ml-4">
      <Select
        class="mb-3"
        bind:value={currentPreset.mapId}
        items={Object.keys($mapData).map((el) => ({
          value: Number(el),
          name: $mapData[Number(el)].mapName
        }))}
      />

      <MapCanvas
        bind:waymarkPreset={currentPreset}
        bind:subMapId={currentSubMapId}
        width={canvasSize}
        height={canvasSize}
      />

      {#if currentPreset.mapId in $mapData}
        <form class="flex items-center gap-3 m-3">
          {#each $mapData[currentPreset.mapId].subMaps as option, i}
            <Radio bind:group={currentSubMapId} value={i} custom>
              <div
                class="inline-flex justify-between items-center px-3 py-2 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div class="w-full text-lg font-semibold">{option.mapFileIndex}</div>
              </div>
            </Radio>
          {/each}
        </form>
      {/if}
    </div>

    <div class="edit-container ml-8">
      {#each currentPreset.waymarks as waymark, i}
        <form class="edit-form">
          <div class="preset-info flex items-center gap-6 mb-2">
            <Label class="flex items-center">
              <Checkbox bind:checked={waymark.active} />
              <img
                src={`${PUBLIC_MARKER_BASE_URL}/${WaymarkId[i]}.png`}
                width="64"
                height="64"
                alt=""
              />
            </Label>
            <Label class="flex items-center gap-2">
              <P>X</P>
              <NumberInput class="text-right" bind:value={waymark.x} />
            </Label>
            <Label class="flex items-center gap-2">
              <P>Y</P>
              <NumberInput class="text-right" bind:value={waymark.y} />
            </Label>
            <Label class="flex items-center gap-2">
              <P>Z</P>
              <NumberInput class="text-right" bind:value={waymark.z} />
            </Label>
          </div>
        </form>
      {/each}
    </div>
  </div>
</div>

<style>
  .edit-container {
    min-width: calc((var(--canvas-size) - 25) * 1px);
    max-width: calc((var(--canvas-size) - 25) * 1px);
  }
</style>
