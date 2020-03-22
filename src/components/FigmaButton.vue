<template>
  <button 
    @click="$emit('click')"
    :type="type"
    :disabled="disabled">
    
    <slot />
  </button>
</template>

<script>
  export default {
    name: 'FigmaButton',

    props: {
      'type': {
        type: String,
        default: 'primary'
      },
      'disabled': {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style lang="scss" scoped>
  button {
    height: 2rem;
    text-align: center;
    line-height: calc(2rem - 2px);
    padding: 0 15px;
    border-radius: 6px;
    font-size: 11px;
    border: none;
    flex-shrink: 0;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.8);
    
    &[type=primary] {
      background: #18a0fb;
      box-shadow: none;
      color: #fff;
      font-weight: 500;

      &:disabled {
        background: rgba(#000, .3);
      }

      &:active:not(:disabled), &:focus:not(:disabled) {
        box-shadow: inset 0 0 0 2px rgba(0,0,0,.3);
      }
    }

    &[type=secondary] {
      background: #fff;

      &:disabled {
        color: rgba(#000, .3);
        box-shadow: inset 0 0 0 1px rgba(#000, .3);
      }

      &:active:not(:disabled), &:focus:not(:disabled) {
        box-shadow: inset 0 0 0 2px #18a0fb;
      }
    }

    &[type=tertiary] {
      background: #fff;
      box-shadow: none;
      border: 1px dashed #ccc;
      height: 1.75rem;
      line-height: calc(1.75rem - 2px);
      padding: 0 .5rem;
      border-radius: 3px;

      &:hover {
        border-color: #333;
      }
    }
  }
</style>