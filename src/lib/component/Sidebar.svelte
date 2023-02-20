<script lang="ts">
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper
  } from 'flowbite-svelte';
  import type { WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { mapData } from '$lib/store';

  export let waymarkPresets: WaymarkPreset[] = [];
  export let currentPresetId: number;

  let aClass = 'flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-purple-300 dark:hover:bg-gray-700'
  let activeClass = 'flex items-center p-2 text-base font-normal text-gray-900 bg-purple-200 dark:bg-gray-700 rounded-lg dark:text-white hover:bg-purple-300 dark:hover:bg-gray-700'
</script>

<Sidebar>
  <SidebarWrapper>
    <SidebarGroup border>
      {#each waymarkPresets as waymarkPreset, i}
        <SidebarItem
          label={`${i + 1}. ${$mapData[waymarkPreset?.mapId]?.mapName}`}
          active={currentPresetId === i}
          on:click={() => (currentPresetId = i)}
          bind:aClass
          bind:activeClass
        />
      {/each}
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
