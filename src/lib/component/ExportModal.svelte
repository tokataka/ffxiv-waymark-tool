<script lang="ts">
  import type { IFileData } from '$lib/interface/IFileData';
  import type { WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { mapData } from '$lib/store';
  import { exportDatFile, importDatFile } from '$lib/util/DatFileHandler';
  import { exportJsonWaymark } from '$lib/util/JsonHandler';
  import {
    Modal,
    Textarea,
    ButtonGroup,
    Button,
    Fileupload,
    Select,
    Checkbox,
    Label,
    P,
    Alert
  } from 'flowbite-svelte';

  export let waymarkPresets: WaymarkPreset[];
  export let open = false;

  let exportTypeToggle = false; // false: UISAVE.DAT, true: JSON

  const jsonExportChecked: boolean[] = [];
  for (let i = 0; i < 30; i++) {
    jsonExportChecked.push(false);
  }

  let jsonString = '';
  let files: FileList | undefined;
  let targetWaymarkPresetsToJson: WaymarkPreset[];
  let targetWaymarkPresetsToUisave: WaymarkPreset[];
  let targetFileData: IFileData | null = null;

  const selectPreset: number[] = [];
  let selectPresetOptions: { value: number; name: string }[] = [];
  for (let i = 0; i < 30; i++) {
    selectPreset.push(-1);
  }

  const resetModal = () => {
    jsonString = '';
    files = undefined;
    targetFileData = null;
    targetWaymarkPresetsToJson = [];
    targetWaymarkPresetsToUisave = [];

    selectPresetOptions = [{ value: -1, name: 'X' }];
    for (let i = 0; i < 30; i++) {
      jsonExportChecked[i] = false;
      selectPreset[i] = -1;
      if (waymarkPresets[i].mapId !== 0) {
        selectPresetOptions.push({
          value: i,
          name: `${i + 1}. ${$mapData[waymarkPresets[i]?.mapId]?.mapName}`
        });
      }
    }
  };

  const exportUisave = () => {
    if (targetFileData === null) return;

    for (let i = 0; i < targetWaymarkPresetsToUisave.length; i++) {
      if (selectPreset[i] === -1) continue;

      targetWaymarkPresetsToUisave[i] = waymarkPresets[selectPreset[i]];
    }

    exportDatFile(targetFileData, targetWaymarkPresetsToUisave);
  };

  $: {
    open;
    resetModal();
  }

  $: {
    exportTypeToggle;
    resetModal();
  }

  $: {
    if (files && files?.length > 0) {
      importDatFile(files[0]).then((el) => {
        ({ fileData: targetFileData, waymarkPresets: targetWaymarkPresetsToUisave } = el);
      });
    }
  }

  $: {
    targetWaymarkPresetsToJson = [];
    for (let i = 0; i < 30; i++) {
      if (jsonExportChecked[i]) {
        targetWaymarkPresetsToJson.push(waymarkPresets[i]);
      }
    }

    jsonString = exportJsonWaymark(targetWaymarkPresetsToJson);
  }
</script>

<Modal class="z-30 text-center w-4/5" bind:open size="xl" title="Export">
  <div>
    <ButtonGroup>
      <Button
        class={{ 'w-24': true, '!bg-purple-300': !exportTypeToggle, 'hover:bg-purple-400': true }}
        active={!exportTypeToggle}
        on:click={() => (exportTypeToggle = false)}
      >
        UISAVE.DAT
      </Button>
      <Button
        class={{ 'w-24': true, '!bg-purple-300': exportTypeToggle, 'hover:bg-purple-400': true }}
        active={exportTypeToggle}
        on:click={() => (exportTypeToggle = true)}
      >
        JSON
      </Button>
    </ButtonGroup>
  </div>

  {#if !exportTypeToggle}
    {#if targetFileData === null}
      <Alert>Select base UISAVE.DAT file</Alert>
    {/if}
    <Fileupload bind:files />
    <div />
    <div>
      {#each targetWaymarkPresetsToUisave as waymarkPreset, i}
        <div class="flex h-12 items-center">
          <div class="w-2/5">
            <Select bind:value={selectPreset[i]} items={selectPresetOptions} />
          </div>
          <div class="w-1/5">
            <P class="text-center">➤➤➤</P>
          </div>
          <div class="w-2/5">
            <P class="text-left">
              {i + 1}. {$mapData[waymarkPreset?.mapId].mapName}
            </P>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if exportTypeToggle}
    <div class="flex">
      <div class="w-2/5">
        {#each waymarkPresets as waymarkPreset, i}
          {#if waymarkPreset.mapId !== 0}
            <Label class="flex items-center gap-2">
              <Checkbox bind:checked={jsonExportChecked[i]} />
              <P>{i + 1}. {$mapData[waymarkPreset.mapId]?.mapName}</P>
            </Label>
          {/if}
        {/each}
      </div>
      <div class="w-3/5">
        <Textarea class="border-purple-500" rows="24" bind:value={jsonString} />
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    {#if !exportTypeToggle}
      <Button
        disabled={targetFileData === null}
        on:click={() => {
          open = false;
          exportUisave();
        }}
      >
        Export
      </Button>
      <Button on:click={() => (open = false)} color="alternative">Cancel</Button>
    {/if}
    {#if exportTypeToggle}
      <Button on:click={() => (open = false)} color="alternative">Close</Button>
    {/if}
  </svelte:fragment>
</Modal>
