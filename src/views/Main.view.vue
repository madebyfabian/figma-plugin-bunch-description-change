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

          <div>
            <Dropdown
              v-model="otherValues.useFieldType"
              :options="data.useFieldTypeValues"
              tabindex="1"
            />

            <SwitchInput
              v-model="values.useRegexMatch" 
              :value="values.useRegexMatch"
              class="switch-input">
              
              Use RegEx
            </SwitchInput>
          </div>
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

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('VALUE_OR_MATCH')">
              Curr. {{ replaceMatchInsteadOfValue ? 'match' : 'value' }}
            </FigmaButton>

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('LAYER_NAME')">
              Layer name
            </FigmaButton>

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('CLEAR')">
              Clear {{ replaceMatchInsteadOfValue ? 'matched part' : 'whole field' }} 
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
            <div class="col col--value" v-if="getFieldValueOfItem(item) !== '' && getFieldValueOfItem(item) !== undefined" v-text="getFieldValueOfItem(item)"></div>
            <div class="col col--value col--empty" v-else>No {{ documentationLinksFieldLabel }}</div>
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
  import Dropdown from '../components/Dropdown'

  export default {
    name: "App",

    components: { SwitchInput, FigmaButton, TextareaInput, Dropdown },

    data: () => ({
      values: {
        match: '',
        replace: '',
        useRegexMatch: false
      },

      otherValues: {
        useFieldType: 'description'
      },

      data: {
        curr: null,
        original: null,
        useFieldTypeValues: [
          { value: 'description', label: 'Change Description' },
          { value: 'documentationLinks', label: 'Change Documentation Link' }
        ]
      },

      currSelValid: true
    }),

    computed: {
      'useDocumentationLinksFieldType'() {
        return this.otherValues.useFieldType === 'documentationLinks'
      },

      'documentationLinksFieldLabel'() {
        return this.useDocumentationLinksFieldType ? 'documentation link' : 'description'
      },

      'dataHasChanged'() {
        return JSON.stringify(this.data.curr) !== JSON.stringify(this.data.original)
      },

      'replaceMatchInsteadOfValue'() {
        return this.values.match !== ''
      }
    },

    methods: {
      /**
       * Takes in an item (e.g. { name: '...', description: '...', documentationLinks: [...] }) and
       * @returns {String} The Value of either the description or the documentationLinks field.
       */
      getFieldValueOfItem( item ) {
        if (this.useDocumentationLinksFieldType)
          return item.documentationLinks && item.documentationLinks[0] ? item.documentationLinks[0].uri : null
        else
          return item.description
      },

      inputChange() {
        this.data.curr = this.data.curr.map(( item, i ) => {
          // Holds the string with the field's value
          let fieldValue = ''

          const originalData = this.data.original[i]
          const originalFieldValue = this.getFieldValueOfItem(originalData) || ''

          if (!this.values.match.length)
            fieldValue = (!this.values.replace.length) ? originalFieldValue : this.values.replace
          else {
            let matchStr = this.values.match
            if (this.values.useRegexMatch)
              try {
                matchStr = new RegExp(this.values.match)
              } catch (error) {
                matchStr = ''
              }
            
            fieldValue = originalFieldValue.replace(matchStr, this.values.replace)
          }

          // Now replace all variables with their data
          fieldValue = fieldValue.replace(/\$&/gi, this.replaceMatchInsteadOfValue ? this.values.match : originalFieldValue)
          fieldValue = fieldValue.replace(/\$L/gi, originalData.name)
          fieldValue = fieldValue.replace(/\$CLEAR/gi, '')

          const ascNumberMatches = fieldValue.match(/\$n+/g) || []
          for (const str of ascNumberMatches) {
            fieldValue = fieldValue.replace(str, String(i).padStart(str.length - 1, '0'))
          }
          const descNumberMatches = fieldValue.match(/\$N+/g) || []
          for (const str of descNumberMatches) {
            fieldValue = fieldValue.replace(str, String(this.data.curr.length - i - 1).padStart(str.length - 1, '0'))
          }

          let returnData = { ...item }
          if (this.useDocumentationLinksFieldType) {
            // Check if value is valid url
            returnData.documentationLinks = [{ uri: fieldValue }]
          }
            
          else
            returnData.description = fieldValue

          return returnData
        })
      },

      clickUseLastChanges() {
        postMsg('clickUseLastChanges', {})
      },

      clickChangeBtn() {
        postMsg('changeBtnClicked', {
          data: this.data.curr,
          values: this.values,
          useDocumentationLinksFieldType: this.useDocumentationLinksFieldType
        })
      },

      clickReplaceShortcut(action) {
        const translate = {
          'VALUE_OR_MATCH': '$&',
          'LAYER_NAME': '$L',
          'NUMBER_ASC':  '$nn',
          'NUMBER_DESC': '$NN',
          'CLEAR': '$CLEAR'
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

    created() {
      onmessage = event => {
        const msg = event.data.pluginMessage
        if (!msg)
          return 

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

          &--value {
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