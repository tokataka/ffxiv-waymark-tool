<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
  import type { WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { mapData } from '$lib/store';

  export let waymarkPresets: WaymarkPreset[] = [];
  export let currentPresetId: number;
</script>

<Sidebar asideClass="fixed z-20 w-72 h-screen top-16 left-0 pb-14 overflow-y-auto overflow-scroll">
  <SidebarWrapper>
    <SidebarGroup>
      {#each waymarkPresets as waymarkPreset, i}
        <SidebarItem
          aClass="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-purple-300 dark:hover:bg-gray-700"
          activeClass="flex items-center p-2 text-base font-normal text-gray-900 bg-purple-200 dark:bg-gray-700 rounded-lg dark:text-white hover:bg-purple-300 dark:hover:bg-gray-700"
          label={`${i + 1}. ${$mapData[waymarkPreset?.mapId]?.mapName}`}
          active={currentPresetId === i}
          on:click={() => (currentPresetId = i)}
        />
      {/each}
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
