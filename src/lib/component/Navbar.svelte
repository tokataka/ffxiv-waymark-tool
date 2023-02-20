<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';

  export let importOpen: boolean;
  export let exportOpen: boolean;
</script>

<Navbar let:hidden let:toggle color="purple">
  <NavBrand href="">
    <span class="whitespace-nowrap text-xl font-semibold dark:text-white">FFXIV Waymark Tool</span>
  </NavBrand>
  <NavHamburger on:click={toggle} />
  <NavUl {hidden}>
    <NavLi href="javascript:void(0)" on:click={() => (importOpen = true)}>Import</NavLi>
    <NavLi href="javascript:void(0)" on:click={() => (exportOpen = true)}>Export</NavLi>
  </NavUl>
</Navbar>
