<script lang="ts">
  import { cn } from "@repo/utils";
  import { inputClasses } from "../../../shared/variants/input";

  export let value = "";
  export let placeholder = "";
  export let disabled = false;
  let className = "";
  export { className as class };

  $: classes = cn(inputClasses.base, className);
  
  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
  }
</script>

<input
  type="text"
  class={classes}
  {value}
  {placeholder}
  {disabled}
  on:input={handleInput}
  on:change
  on:focus
  on:blur
/>
