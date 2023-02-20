<script lang="ts">
  import { Modal, Textarea } from 'flowbite-svelte';

  export let open = false;

  let jsonString = '';

  $: {
    console.log(jsonString)
  }
</script>

<Modal bind:open fullscreen title="Export">
  <Textarea rows="8" bind:value={jsonString} />
</Modal>
