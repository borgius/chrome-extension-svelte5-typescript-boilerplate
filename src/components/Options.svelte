<script lang="ts">
  import { store } from '../store';
  import Features from './Features.svelte';
</script>

{#if $store.isReady}
  <Features />
  <label>
    <input type="text" name="localRepoPath" bind:value={$store.localRepoPath} />
    Prefix for VS Repo Path
  </label>
{/if}

<style>
  label {
    display: flex;
  }
</style>
