<script lang="ts">
  import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
  import Textfield from '@smui/textfield';

  export let open = false;

  let jsonString = '';
</script>

<Dialog bind:open fullscreen>
  <Title id="import-json-dialog-title">Import JSON</Title>
  <Content id="import-json-dialog-content">
    <Textfield textarea bind:value={jsonString} />
  </Content>
</Dialog>
