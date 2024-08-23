<script lang="ts">
  import { store } from '../store';
    import Features from './Features.svelte';
  const manifest = chrome.runtime.getManifest();
</script>

{#if $store.isReady}
  <div class="options ba">
    <p>{manifest.name}:</p>
    <div>
      <Features/>
    </div>
  </div>
{/if}

<style>
  .options {
    min-width: 350px;
  }
</style>
