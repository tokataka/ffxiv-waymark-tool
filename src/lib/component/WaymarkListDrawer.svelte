<script lang="ts">
  import type { WaymarkPreset } from '$lib/model/WaymarkPreset';
  import Drawer, { Content as DrawerContent } from '@smui/drawer';
  import List, { Item as ListItem, Text as ListText } from '@smui/list';
  import { mapData } from '$lib/store';

  export let waymarkPresets: WaymarkPreset[] = [];
  export let currentPresetId: number;

</script>

<Drawer>
  <DrawerContent>
    <List>
      {#each waymarkPresets as waymarkPreset, i}
        <ListItem
          href="javascript:void(0)"
          activated={currentPresetId === i}
          on:click={() => (currentPresetId = i)}
        >
          <ListText>
            {i + 1}. {$mapData[waymarkPreset?.mapId]?.mapName}
          </ListText>
        </ListItem>
      {/each}
    </List>
  </DrawerContent>
</Drawer>
