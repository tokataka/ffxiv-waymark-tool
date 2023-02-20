<script lang="ts">
  import type { WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { mapData } from '$lib/store';
  import { importDatFile } from '$lib/util/DatFileHandler';
  import { Modal, Textarea, ButtonGroup, Button, Fileupload, Select } from 'flowbite-svelte';

  export let waymarkPresets: WaymarkPreset[];
  export let open = false;

  let importTypeToggle = false; // false: UISAVE.DAT, true: JSON

  let jsonString = '';
  let files: FileList;
  let importedWaymarkPresets: WaymarkPreset[];

  let selectPreset: number[] = [];
  let selectPresetOptions: { value: number; name: string }[] = [];

  const resetSelectPreset = () => {
    selectPreset = [];
    selectPresetOptions = [{ value: -1, name: 'X' }];
    for (let i = 0; i < 30; i++) {
      selectPreset.push(-1);
      selectPresetOptions.push({ value: i, name: `${i + 1}` });
    }
  };

  const importToPresets = () => {
    console.log(importedWaymarkPresets);
    console.log(selectPreset);
    importedWaymarkPresets.forEach((waymarkPreset, i) => {
      if (waymarkPreset.mapId === -1) return;
      if (selectPreset[i] === -1) return;
      waymarkPresets[selectPreset[i]] = waymarkPreset;
    });
  };

  $: {
    if (open) {
      resetSelectPreset();
    }
  }

  $: {
    importTypeToggle;
    importedWaymarkPresets = [];
  }

  $: {
    if (files?.length > 0) {
      importDatFile(files[0]).then(({ waymarkPresets: w }) => {
        importedWaymarkPresets = w;
      });
    }
  }
</script>

<Modal class="text-center w-4/5" bind:open size="xl" title="Import">
  <div>
    <ButtonGroup>
      <Button
        class={{ 'w-24': true, 'bg-purple-300': !importTypeToggle, 'hover:bg-purple-400': true }}
        active={!importTypeToggle}
        on:click={() => (importTypeToggle = false)}
      >
        UISAVE.DAT
      </Button>
      <Button
        class={{ 'w-24': true, 'bg-purple-300': importTypeToggle, 'hover:bg-purple-400': true }}
        active={importTypeToggle}
        on:click={() => (importTypeToggle = true)}
      >
        JSON
      </Button>
    </ButtonGroup>
  </div>
  {#if !importTypeToggle}
    <Fileupload bind:files />
  {/if}
  {#if importTypeToggle}
    <Textarea class="border-purple-500" rows="4" bind:value={jsonString} />
    <div class="text-right !mt-0">
      <Button>Check</Button>
    </div>
  {/if}
  <div>
    {#each importedWaymarkPresets as waymarkPreset, i}
      {#if waymarkPreset.mapId !== -1}
        <div class="flex h-12 items-center">
          <div class="w-2/5 text-left">
            {i + 1}. {$mapData[waymarkPreset.mapId].mapName}
          </div>
          <div class="w-1/5">→</div>
          <div class="w-2/5">
            <Select bind:value={selectPreset[i]} items={selectPresetOptions} />
          </div>
        </div>
      {/if}
    {/each}
  </div>
  <svelte:fragment slot="footer">
    <Button
      on:click={() => {
        open = false;
        importToPresets();
      }}
    >
      Import
    </Button>
    <Button on:click={() => (open = false)} color="alternative">Cancel</Button>
  </svelte:fragment>
</Modal>
