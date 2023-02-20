<script lang="ts">
  import MapCanvas from '$lib/component/MapCanvas.svelte';
  import WaymarkListDrawer from '$lib/component/WaymarkListDrawer.svelte';
  import { WaymarkId, type WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { exportDatFile, importDatFile } from '$lib/util/DatFileHandler';
  import Button, { Label as ButtonLabel } from '@smui/button';
  import { AppContent as DrawerAppContent } from '@smui/drawer';
  import Textfield from '@smui/textfield';
  import FormField from '@smui/form-field';
  import Checkbox from '@smui/checkbox';
  import Select, { Option as SelectOption } from '@smui/select';
  import Radio from '@smui/radio';
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item as ListItem, Text as ListText } from '@smui/list';
  import { mapData, waymarkPresets } from '$lib/store';
  import { onMount } from 'svelte';
  import loadCsv from '$lib/util/LoadCsv';
  import type { IFileData } from '$lib/interface/IFileData';
  import { MARKER_BASE_URL } from '$lib/constants';
  import ImportJsonDialog from '$lib/component/ImportJsonDialog.svelte';

  let importMenu: Menu;
  let exportMenu: Menu;
  let uisaveFiles: FileList;
  let importUisaveFileInput: any;
  let fileData: IFileData;

  let importJsonOpen = false;

  const canvasSize = 512;
  let appHeight: number;

  let importUisave = async () => {
    for (const file of uisaveFiles) {
      let newWaymarkPresets;
      ({ fileData, waymarkPresets: newWaymarkPresets } = await importDatFile(file));

      // TODO: waymark preset import window/component
      $waymarkPresets = newWaymarkPresets;
    }
  };

  let exportUisave = () => {
    if (!fileData) {
      // TODO: waymark preset export window/component
      return;
    }
    exportDatFile(fileData, $waymarkPresets, [0, 1, 2]);
  };

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

  // For persist waymarkPresets purpose
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

<div class="top-app-bar-container">
  <TopAppBar variant="static">
    <Row>
      <Section>
        <Title>FFXIV Waymark tool</Title>
      </Section>
      <Section align="end" toolbar>
        <div>
          <Button on:click={() => importMenu.setOpen(true)}>
            <ButtonLabel>Import..</ButtonLabel>
          </Button>
          <Menu bind:this={importMenu}>
            <List>
              <input
                type="file"
                accept=".DAT"
                bind:this={importUisaveFileInput}
                bind:files={uisaveFiles}
                on:change={importUisave}
                style="display: none;"
              />
              <ListItem on:SMUI:action={() => importUisaveFileInput.click()}>
                <ListText>Import UISAVE</ListText>
              </ListItem>
              <ListItem on:SMUI:action={() => (importJsonOpen = true)}>
                <ListText>Import JSON</ListText>
              </ListItem>
            </List>
          </Menu>
        </div>
        <div>
          <Button on:click={() => exportMenu.setOpen(true)}>
            <ButtonLabel>Export..</ButtonLabel>
          </Button>
          <Menu bind:this={exportMenu}>
            <List>
              <ListItem on:SMUI:action={exportUisave}>
                <ListText>export UISAVE</ListText>
              </ListItem>
              <ListItem on:SMUI:action={() => console.log('export JSON')}>
                <ListText>export JSON</ListText>
              </ListItem>
            </List>
          </Menu>
        </div>
      </Section>
    </Row>
  </TopAppBar>
</div>

<ImportJsonDialog bind:open={importJsonOpen} />

<div class="container">
  <div class="drawer-container" style="--drawer-height:{appHeight}">
    <WaymarkListDrawer bind:waymarkPresets={$waymarkPresets} bind:currentPresetId />
  </div>

  <DrawerAppContent class="app-content" style="--canvas-size:{canvasSize};">
    <div class="main-container" bind:clientHeight={appHeight}>
      <div class="canvas-container">
        <MapCanvas
          bind:waymarkPreset={currentPreset}
          bind:subMapId={currentSubMapId}
          width={canvasSize}
          height={canvasSize}
        />

        {#if currentPreset.mapId in $mapData}
          <div class="sub-map-container">
            {#each $mapData[currentPreset.mapId].subMaps as option, i}
              <FormField>
                <Radio bind:group={currentSubMapId} value={i} touch />
                <span slot="label">{option.mapFileIndex}</span>
              </FormField>
            {/each}
          </div>
          <Select bind:value={currentPreset.mapId} class="map-name-container">
            {#each Object.keys($mapData).map((el) => Number(el)) as mapId}
              <SelectOption value={mapId}>{$mapData[mapId].mapName}</SelectOption>
            {/each}
          </Select>
        {/if}
      </div>

      <div class="edit-container">
        {#each currentPreset.waymarks as waymark, i}
          <div class="preset-info">
            <FormField>
              <img src={`${MARKER_BASE_URL}/${WaymarkId[i]}.png`} width="32" height="32" alt="" />
              <Checkbox bind:checked={waymark.active} />
              <Textfield bind:value={waymark.x} label="x" type="number" input$step="0.001" />
              <Textfield bind:value={waymark.y} label="y" type="number" input$step="0.001" />
              <Textfield bind:value={waymark.z} label="z" type="number" input$step="0.001" />
            </FormField>
          </div>
        {/each}
      </div>
    </div>
  </DrawerAppContent>
</div>

<div style="--canvas-size:{canvasSize};" />

<style>
  .container {
    position: relative;
    display: flex;
    height: 100vh;
    border: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
    z-index: 0;
  }

  * :global(.app-content) {
    flex: auto;
    position: relative;
    flex-grow: 1;
  }

  .drawer-container {
    min-height: calc(var(--drawer-height) * 1px);
    height: calc(var(--drawer-height) * 1px);
  }

  .main-container {
    margin: 10px;
    display: flex;
    flex-wrap: wrap;
  }

  .canvas-container {
    width: calc(var(--canvas-size) * 1px);
  }

  .sub-map-container {
    width: calc(var(--canvas-size) * 1px);
  }

  * :global(.map-name-container) {
    width: calc(var(--canvas-size) * 1px);
  }

  .edit-container {
    width: calc(var(--canvas-size) * 1px);
  }
</style>
