<template>
  <div class="input">
    <div class="input__floating-label-container">
      <textarea 
        @input="updateInput"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
        :name="name" 
        :value="value"
        :type="type" 
        :placeholder="placeholder"
        :spellcheck="spellcheck"
        :required="required"
        ref="input"
      />
      <span class="floated-label-bg"></span>
      <label :for="name">
        {{ placeholder }}
      </label>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Input',
    props: {
      'name': {
        type: String,
        default: ''
      },
      'value': {
        type: String,
        default: ''
      },
      'type': {
        type: String,
        default: 'text'
      },
      'placeholder': {
        type: String,
        default: ''
      },
      'spellcheck': {
        type: String,
        default: 'false'
      },
      'required': {
        type: String,
        default: 'required'
      },
      'autofocus': {
        type: Boolean,
        default: true
      }
    },
    methods: {
      updateInput() {
        this.$emit('input', this.$refs.input.value)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .input {
    height: 4rem;
    width: 100%;
    background-color: #fff;
    overflow: hidden;
    position: relative;

    &__floating-label-container {
      width: 100%;
      position: relative;
      overflow: hidden;
      
      textarea {
        display: block;
        height: 4rem;
        padding: 1.25rem .75rem .5rem;
        width: 100%;
        border: none;
        outline: none;
        appearance: none;
        margin: 0;
        border-radius: 3px;
        border: 1px solid #e5e5e5;
        box-shadow: inset 0 0 0 2px transparent;
        line-height: 1rem;
        resize: none;

        &:focus {
          box-shadow: inset 0 0 0 2px #18a0fb;
          border-color: transparent;
        }

        &:focus ~ label, &:valid ~ label {
          transform: translateY(-6px) scale(.9);
        }

        &:focus ~ .floated-label-bg {
          // top: 3px;
          border-top: 2px solid #18a0fb;
        }

        // hide real placeholder
        &::placeholder { color: #fff; opacity: 0 }
        &:-ms-input-placeholder { color: #fff }
        &::-ms-input-placeholder { color: #fff }
      }

      label, .floated-label-bg {
        user-select: none;
        pointer-events: none;
        position: absolute;
      }

      label {
        line-height: 1rem;
        top: .75rem;
        left: calc(.75rem + 1px);
        width: 100%;
        transition: transform .12s ease, font-size .12s ease;
        transform-origin: top left;
        color: grey;
      }

      .floated-label-bg {
        left: 3px;
        top: 1px;
        width: calc(100% - 16px - 6px);
        height: calc(1.25rem - 1px);
        background: #fff;
        border-top: 2px;
      }
    }
  }
</style>