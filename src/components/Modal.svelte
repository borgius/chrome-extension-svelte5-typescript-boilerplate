<svelte:options runes />

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type Props = {
    visible?: boolean;
  };
  let { visible }: Props = $props();

  function keyPress(ev: KeyboardEvent) {
    if (ev.key == 'Escape') visible = false; //ESC
  }

  onMount(() => {
    window.addEventListener('keydown', keyPress);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', keyPress);
  });
</script>

{#if visible}
  <div class="top-modal" on:click={() => (visible = false)}>
    <div class="modal" on:click|stopPropagation={() => {}}>
      <svg class="close" on:click={() => (visible = false)} viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="6" />
        <line x1="3" y1="3" x2="9" y2="9" />
        <line x1="9" y1="3" x2="3" y2="9" />
      </svg>
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .top-modal {
    z-index: 9999;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #4448;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    position: relative;
    border-radius: 6px;
    background: white;
    border: 2px solid #000;
    filter: drop-shadow(5px 5px 5px #555);
    padding: 1em;
  }

  .close {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    fill: #f44;
    transition: transform 0.3s;
  }

  .close:hover {
    transform: scale(1.2);
  }

  .close line {
    stroke: #fff;
    stroke-width: 2;
  }
  .modal-content {
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
    overflow: auto;
  }
</style>
