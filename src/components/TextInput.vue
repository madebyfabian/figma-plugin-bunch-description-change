<template>
  <div class="input">
    <div class="input__floating-label-container">
      <input 
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
    height: 2.5rem;
    width: 100%;
    background-color: #fff;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;

    &__floating-label-container {
      width: 100%;
      position: relative;
      
      input {
        display: block;
        height: 100%;
        width: 100%;
        border: none;
        outline: none;
        appearance: none;
        margin: 0;
        background-color: transparent;
        padding: 23px .75rem 12px;
        border-radius: 3px;
        box-shadow: inset 0 0 0 1px #e5e5e5;

        &:focus {
          box-shadow: inset 0 0 0 2px #18a0fb;
        }
        &:focus ~ label,
        &:valid ~ label {
          transform: translateY(-7px) scale(.8125);
        }
        // hide real placeholder
        &::placeholder { color: #fff; opacity: 0 }
        &:-ms-input-placeholder { color: #fff }
        &::-ms-input-placeholder { color: #fff }
      }

      label {
        position: absolute;
        top: .75rem;
        line-height: 1rem;
        left: .75rem;
        transition: transform .12s ease, font-size .12s ease;
        transform-origin: top left;
        user-select: none;
        pointer-events: none;
        color: grey;
      }
    }
  }
</style>