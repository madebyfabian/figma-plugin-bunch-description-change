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
        position: relative;
        display: block;
        height: 4rem;
        padding: 1.25rem .5rem .5rem .75rem;
        width: 100%;
        border: none;
        outline: none;
        appearance: none;
        margin: 0;
        border-radius: 3px;
        border: 1px solid #e5e5e5;
        box-shadow: inset 0 0 0 2px transparent!important;
        line-height: 1rem;
        resize: none;
        overflow-y: scroll;
        
        // &::-webkit-scrollbar {
        //   width: 7px;
        //   position: absolute;
        //   right: 0;
        //   top: 0;
        //   cursor: pointer;
        //   overflow: visible;
        // }

        // &::-webkit-scrollbar-track {
        //   opacity: 0;
        // }

        // &::-webkit-scrollbar-thumb {
        //   // background: #ddd;
        //   // border-left: 4px solid #ddd;
        //   // border-radius: 10px 40px 40px 10px;
        //   background: transparent;
        //   box-shadow: inset 1px 0 green;
          
        //   &:hover {
        //     border-color: #ccc;
        //   }
        // }


        &::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        &::-webkit-scrollbar-thumb {
          height: 6px;
          border: 2px solid rgba(255, 255, 255, 0);
          background-clip: padding-box;
          border-radius: 7px;
          background-color: #ddd;

          &:hover {
            background-color: #ccc;
          }
        }

        &::-webkit-scrollbar-button {
          width: 0;
          height: 0;
          display: none;
        }

        &::-webkit-scrollbar-corner {
          background-color: transparent;
        }



        &:focus {
          box-shadow: inset 0 0 0 2px #18a0fb!important;
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
        width: calc(100% - 12px);
        height: calc(1.25rem - 1px);
        background: #fff;
        border-top: 2px;
      }
    }
  }
</style>