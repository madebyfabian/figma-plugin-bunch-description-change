<template>
  <div>
    <div v-if="currSelValid" id="ui">
      <section id="main">
        <div class="text-input-group">
          <TextareaInput 
            v-model="values.match"
            placeholder="Match (optional)"
            class="text-input"
          />

          <SwitchInput
            v-model="values.useRegexMatch" 
            :value="values.useRegexMatch"
            class="switch-input">
            
            Use RegEx
          </SwitchInput>
        </div>


        <div class="text-input-group">
          <TextareaInput
            v-model="values.replace" 
            placeholder="Change to"
            class="text-input"
          />

          <div class="buttons">
            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('NUMBER_ASC')">
              Number <span><svg class="svg" width="7" height="8" viewBox="0 0 7 8" xmlns="http://www.w3.org/2000/svg"><path d="M.14 3.133L3.163.138c.186-.184.486-.184.672 0l3.025 2.995c.185.183.185.481 0 .665-.186.184-.487.184-.672 0L3.975 1.607V8h-.95V1.607L.81 3.798c-.185.184-.486.184-.672 0-.185-.184-.185-.482 0-.665z" fill-rule="evenodd" fill-opacity="1" fill="#333" stroke="none"></path></svg></span>
            </FigmaButton>

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('NUMBER_DESC')">
              Number <span><svg class="svg" width="7" height="8" viewBox="0 0 7 8" xmlns="http://www.w3.org/2000/svg"><path d="M6.86 4.867L3.837 7.862c-.186.184-.486.184-.672 0L.139 4.867c-.185-.183-.185-.481 0-.665.186-.184.487-.184.672 0l2.214 2.191V0h.95v6.393L6.19 4.202c.185-.184.486-.184.672 0 .185.184.185.482 0 .665z" fill-rule="evenodd" fill-opacity="1" fill="#333" stroke="none"></path></svg></span>
            </FigmaButton>

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('DESCRIPTION_OR_MATCH')">
              Curr. {{ replaceMatchInsteadOfDescription ? 'match' : 'description' }}
            </FigmaButton>

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('LAYER_NAME')">
              Layer name
            </FigmaButton>
          </div>
        </div>


        <div class="buttons buttons--big">
          <FigmaButton 
            type="primary"
            class="button"
            ref="changeBtn"
            @click="clickChangeBtn">
            Change
          </FigmaButton>

          <FigmaButton
            type="secondary"
            class="button"
            @click="clickUseLastChanges">
            Use recent values
          </FigmaButton>
        </div>
      </section>

      <section id="preview">
        <div class="data-table">
          <div class="row" v-for="item of data.curr" :key="item.id">
            <div class="col col--description" v-if="item.description.length" v-text="item.description"></div>
            <div class="col col--description col--empty" v-else>No description</div>
            <div class="col col--name" :title="item.name" v-text="item.name"></div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="error-overlay">
      😋 Please select at least one Component.
    </div>
  </div>
</template>

<script>
  const postMsg = (type, value) => parent.postMessage({ pluginMessage: { type, value }}, '*')

  import TextareaInput from '../components/TextareaInput'
  import SwitchInput from '../components/SwitchInput'
  import FigmaButton from '../components/FigmaButton'

  export default {
    name: "App",

    components: { SwitchInput, FigmaButton, TextareaInput },

    data: () => ({
      values: {
        match: '',
        replace: '',
        useRegexMatch: false
      },

      data: {
        curr: null,
        original: null
      },

      currSelValid: true
    }),

    methods: {
      inputChange() {
        this.data.curr = this.data.curr.map((item, i) => {
          let description
          const originalData = this.data.original[i]
          const originalDescriptionStr = originalData.description
          const layerNameStr = originalData.name

          if (!this.values.match.length)
            description = (!this.values.replace.length) ? originalData.description : this.values.replace
          else {
            let matchStr = this.values.match
            if (this.values.useRegexMatch) {
              try {
                matchStr = new RegExp(this.values.match)
              } catch (error) {
                matchStr = ''
              }
            }
            description = originalData.description.replace(matchStr, this.values.replace)
          }

          // Now replace all variables with their data
          description = description.replace(/\$&/gi, this.replaceMatchInsteadOfDescription ? this.values.match : originalDescriptionStr)

          description = description.replace(/\$L/gi, layerNameStr)

          const ascNumberMatches = description.match(/\$n+/g) || []
          for (const str of ascNumberMatches) {
            description = description.replace(str, String(i).padStart(str.length - 1, '0'))
          }

          const descNumberMatches = description.match(/\$N+/g) || []
          for (const str of descNumberMatches) {
            description = description.replace(str, String(this.data.curr.length - i - 1).padStart(str.length - 1, '0'))
          }

          return { ...item, description }
        })
      },

      clickUseLastChanges() {
        postMsg('clickUseLastChanges', {})
      },

      clickChangeBtn() {
        postMsg('changeBtnClicked', {
          data: (this.dataHasChanged) ? this.data.curr : null,
          values: this.values
        })
      },

      clickReplaceShortcut(action) {
        const translate = {
          'DESCRIPTION_OR_MATCH': '$&',
          'LAYER_NAME': '$L',
          'NUMBER_ASC':  '$nn',
          'NUMBER_DESC': '$NN'
        }
        
        this.values.replace += translate[action]
      }
    },

    watch: {
      'values': {
        handler() { this.inputChange() },
        deep: true
      }
    },

    computed: {
      'dataHasChanged'() {
        return JSON.stringify(this.data.curr) !== JSON.stringify(this.data.original)
      },

      'replaceMatchInsteadOfDescription'() {
        return this.values.match !== ''
      }
    },

    created() {
      onmessage = event => {
        const msg = event.data.pluginMessage
        switch (msg.type) {
          case 'selectionchange': {
            this.currSelValid = !!msg.value.length
            if (!this.currSelValid) 
              return

            this.data.curr = msg.value
            this.data.original = JSON.parse(JSON.stringify(msg.value))

            this.inputChange()

            break
          }

          case 'clickUseLastChanges': {
            this.values = msg.value
            break
          }

          case 'resetValues': {
            Object.assign(this.$data.values, this.$options.data().values)
            break
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .error-overlay {
    font-size: 14px;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }


  #ui {
    display: flex;
    flex-flow: column;
    height: 100vh;
  }

  #main {
    background: #fff;
    padding: 1.25rem 1rem;
    position: relative;
    z-index: 1;
    box-shadow: 0 3px 3px rgba(0,0,0,.08),
                0 10px 25px rgba(0,0,0,.08)
  }

  .text-input-group {
    display: flex;
    // align-items: center;
    margin-bottom: 1rem;

    .text-input {
      margin: 0 1rem 0 0;
      max-width: calc(200px + 8px); // scrollbar
      flex-shrink: 0;
    }

    .switch-input {
      margin-top: .75rem;
    }

    .buttons {
      justify-content: flex-start;
      height: 4rem;
    }
  }

  
  .buttons {
    display: flex;
    // justify-content: flex-end;
    flex-wrap: wrap;
    margin: -.25rem;

    .button {
      margin: .25rem;
    }

    &--big {
      margin: 0;
      max-width: 208px;
      justify-content: space-between;

      .button {
        margin: 0;
      }
    }
  }


  #preview {
    flex: 1;
    overflow: hidden;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    overflow-x: hidden;
    overflow-y: auto;

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

    .data-table {
      width: 100%;

      .row {
        padding: .5rem 1rem;
        display: grid;
        grid-template-columns: 174px 1fr;
        gap: 2rem;

        &:nth-child(odd) { background: #fff }
        &:nth-child(even) { background: #F5F5F5 }

        &:first-child { padding-top: 1rem }
        &:last-child { padding-bottom: 1rem }

        .col {
          &--empty {
            color: #999;
            font-style: italic;
          }

          &--description {
            white-space: pre-wrap;
            overflow-wrap: break-word;
            letter-spacing: 0px;
          }

          &--name {
            position: relative;
            font-weight: 500;
            color: #7B61FF;
            display: inline-block;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            padding-left: calc(1.25rem);
            font-feature-settings: 'ss02' on,'liga' on,'calt' on;

            &::before {
              content: '';
              position: absolute;
              height: 1rem;
              width: 1rem;
              top: 0;
              left: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%237B61FF'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.743 4.748L8 2.5l2.257 2.248L8 6.996 5.743 4.748zm-.995 5.51L2.5 8l2.248-2.257L6.996 8l-2.248 2.257zm5.51.994L8 13.5l-2.257-2.248L8 9.004l2.257 2.248zM13.5 8l-2.248-2.257L9.004 8l2.248 2.257L13.5 8z' /%3E%3C/svg%3E");
            }

            svg {
              margin: 0 .25rem 0 0;
              display: inline;
            }
          }
        }
      }
    }
  }
</style>