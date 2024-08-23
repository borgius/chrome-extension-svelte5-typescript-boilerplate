<script lang="ts">
  import { store } from '../store';
  type Props = {
    labelLeft?: boolean;
    hideOptions?: string[];
  };
  let { labelLeft, hideOptions }: Props = $props();
</script>

{#if $store.isReady}
  <label class:labeleft={labelLeft}>
    <input
      type="checkbox"
      name="content"
      bind:checked={$store.feature.content}
    />
    Show Content
  </label>
{/if}

<style lang="scss">
  .labeleft {
    flex-direction: row-reverse;
  }
  label {
    display: flex;
    padding: 2px 0px;
    input {
      margin: 0 5px;
    }
  }
</style>
