<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, Button } from 'flowbite-svelte';

  export let importOpen: boolean;
  export let exportOpen: boolean;
</script>

<Navbar
  navClass="fixed w-full h-16 z-10 top-0 left-0 px-3 py-0"
  navDivClass="mx-auto flex flex-wrap justify-between items-center h-16"
  color="purple"
>
  <NavBrand href="">
    <span class="whitespace-nowrap text-xl font-semibold dark:text-white">FFXIV Waymark Tool</span>
  </NavBrand>
  <NavUl
    hidden={false}
    ulClass="flex bg-transparent p-0 items-center space-x-4 mt-0 text-sm font-medium h-16"
    divClass="block w-auto h-16"
  >
    <NavLi href="" on:click={() => (importOpen = true)}>
      <Button outline size="sm">Import</Button>
    </NavLi>
    <NavLi href="" on:click={() => (exportOpen = true)}>
      <Button outline size="sm">Export</Button>
    </NavLi>
  </NavUl>
</Navbar>
