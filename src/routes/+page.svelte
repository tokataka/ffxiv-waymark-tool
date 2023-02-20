<script lang="ts">
  import { onMount } from 'svelte';
  import MapCanvas from '$lib/component/MapCanvas.svelte';
  import Sidebar from '$lib/component/Sidebar.svelte';
  import { mapData, waymarkPresets } from '$lib/store';
  import loadCsv from '$lib/util/LoadCsv';
  import { MARKER_BASE_URL } from '$lib/constants';
  import ImportModal from '$lib/component/ImportModal.svelte';
  import ExportModal from '$lib/component/ExportModal.svelte';
  import Navbar from '$lib/component/Navbar.svelte';
  import { WaymarkId, type WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { Input, Label, Checkbox, Radio, Select } from 'flowbite-svelte';

  let importOpen = false;
  let exportOpen = false;

  const canvasSize = 512;
  let appHeight: number;

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

  // To persist waymarkPresets on change
  $: {
    $waymarkPresets = $waymarkPresets;
  }

  onMount(async () => {
    $mapData = {
      [-1]: {
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

<ImportModal bind:open={importOpen} bind:waymarkPresets={$waymarkPresets} />
<ExportModal bind:open={exportOpen} />

<Navbar bind:importOpen bind:exportOpen />

<div class="container flex">
  <div class="sidebar-container" style="--sidebar-height:{appHeight}">
    <Sidebar bind:waymarkPresets={$waymarkPresets} bind:currentPresetId />
  </div>
  <div class="main-container grid grid-cols-2" bind:clientHeight={appHeight}>
    <div class="canvas-container">
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
        <div class="sub-map-container">
          <form>
            <div class="flex items-center gap-3 m-3">
              {#each $mapData[currentPreset.mapId].subMaps as option, i}
                <Radio bind:group={currentSubMapId} value={i} custom>
                  <div
                    class="inline-flex justify-between items-center px-3 py-2 w-full text-gray-500 bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div class="w-full text-lg font-semibold">{option.mapFileIndex}</div>
                  </div>
                </Radio>
              {/each}
            </div>
          </form>
        </div>
      {/if}
    </div>

    <div class="edit-container mt-20">
      {#each currentPreset.waymarks as waymark, i}
        <form class="edit-form">
          <div class="preset-info flex items-center gap-3 mb-2">
            <div class="flex-initial">
              <Checkbox id={`edit-active-${i}`} bind:checked={waymark.active} />
            </div>
            <div class="flex-initial w-16">
              <Label for={`edit-active-${i}`}>
                <img src={`${MARKER_BASE_URL}/${WaymarkId[i]}.png`} width="48" height="48" alt="" />
              </Label>
            </div>
            <div class="flex-initial flex items-center gap-2 w-24">
              <Label for={`edit-x-${i}`} class="mb-2">X</Label>
              <Input id={`edit-x-${i}`} class="text-right" bind:value={waymark.x} />
            </div>
            <div class="flex-initial flex items-center gap-2 w-24">
              <Label for={`edit-y-${i}`} class="mb-2">Y</Label>
              <Input id={`edit-y-${i}`} class="text-right" bind:value={waymark.y} />
            </div>
            <div class="flex-initial flex items-center gap-2 w-24">
              <Label for={`edit-z-${i}`} class="mb-2">Z</Label>
              <Input id={`edit-z-${i}`} class="text-right" bind:value={waymark.z} />
            </div>
          </div>
        </form>
      {/each}
    </div>
  </div>
</div>

<div style="--canvas-size:{canvasSize};" />

<style>
  .sidebar-container {
    min-width: 280px;
    max-width: 280px;
    height: calc(max(var(--sidebar-height) * 1px, 100vh - 72px));
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .main-container {
    margin: 10px;
    display: flex;
    flex-wrap: nowrap;
  }

  .canvas-container {
    width: calc(var(--canvas-size) * 1px);
    margin-right: 20px;
  }

  .edit-form {
    max-width: calc(var(--canvas-size) * 1px);
  }
</style>
