<template>
  <div>
    <div v-if="currSelValid">
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
            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('NAME_OR_MATCH')">
              Current {{ matchValueEmpty ? 'name' : 'match' }}
            </FigmaButton>

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('NUMBER_ASC')">
              Number <span><svg class="svg" width="7" height="8" viewBox="0 0 7 8" xmlns="http://www.w3.org/2000/svg"><path d="M.14 3.133L3.163.138c.186-.184.486-.184.672 0l3.025 2.995c.185.183.185.481 0 .665-.186.184-.487.184-.672 0L3.975 1.607V8h-.95V1.607L.81 3.798c-.185.184-.486.184-.672 0-.185-.184-.185-.482 0-.665z" fill-rule="evenodd" fill-opacity="1" fill="#333" stroke="none"></path></svg></span>
            </FigmaButton>

            <FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('NUMBER_DESC')">
              Number <span><svg class="svg" width="7" height="8" viewBox="0 0 7 8" xmlns="http://www.w3.org/2000/svg"><path d="M6.86 4.867L3.837 7.862c-.186.184-.486.184-.672 0L.139 4.867c-.185-.183-.185-.481 0-.665.186-.184.487-.184.672 0l2.214 2.191V0h.95v6.393L6.19 4.202c.185-.184.486-.184.672 0 .185.184.185.482 0 .665z" fill-rule="evenodd" fill-opacity="1" fill="#333" stroke="none"></path></svg></span>
            </FigmaButton>
          </div>
        </div>


        <div class="buttons">
          <FigmaButton 
            :disabled="!!this.values.replace.length === false"
            type="primary"
            class="button"
            @click="clickChangeBtn">

            Change
          </FigmaButton>
        </div>
      </section>

      <section id="preview">
        <div class="preview-scroll">
          <div class="data-table-new">
            <div class="row" v-for="item of currData" :key="item.id">
              <div class="col col--description" v-if="!!item.description.length" v-text="item.description"></div>
              <div class="col col--description col--empty" v-else>No description</div>
              <div class="col col--name" :title="item.name" v-text="item.name"></div>
            </div>
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

  import TextInput from '../components/TextInput'
  import TextareaInput from '../components/TextareaInput'
  import SwitchInput from '../components/SwitchInput'
  import FigmaButton from '../components/FigmaButton'

  export default {
    name: "App",

    components: { TextInput, SwitchInput, FigmaButton, TextareaInput },

    data: () => ({
      values: {
        match: '',
        replace: '',
        useRegexMatch: false
      },
      currSelValid: true,
      currData: null,
      originalData: null
    }),

    methods: {
      changeData() {
        this.currData = this.currData.map((item, i) => {
          let description

          if (!this.values.match.length)
            description = (!this.values.replace.length) ? this.originalData[i].description : this.values.replace
          else {
            let matchStr = this.values.match
            if (this.values.useRegexMatch) {
              try {
                matchStr = new RegExp(this.values.match)
              } catch (error) {
                matchStr = ''
              }
            }
            description = this.originalData[i].description.replace(matchStr, this.values.replace)
          }

          // Now replace all variables with their' data
          description = description.replace(/\$&/gi, this.matchValueEmpty ? item.name : this.values.match)

          const ascNumberMatches = description.match(/\$n+/g) || []
          for (const str of ascNumberMatches) {
            description = description.replace(str, String(i).padStart(str.length - 1, '0'))
          }

          const descNumberMatches = description.match(/\$N+/g) || []
          for (const str of descNumberMatches) {
            description = description.replace(str, String(this.currData.length - i - 1).padStart(str.length - 1, '0'))
          }
            
          return { ...item, description }
        })
      },

      clickChangeBtn() {
        Object.assign(this.$data.values, this.$options.data().values);
        postMsg('changeBtnClicked', this.currData)
      },

      clickReplaceShortcut(action) {
        const translate = {
          'NAME_OR_MATCH': '$&',
          'NUMBER_ASC':  '$nn',
          'NUMBER_DESC': '$NN'
        }
        
        this.values.replace = this.values.replace + translate[action]
      }
    },

    watch: {
      values: {
        handler() { this.changeData() },
        deep: true
      }
    },

    computed: {
      'matchValueEmpty'() {
        return !this.values.match.length
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

            this.currData = msg.value
            this.originalData = JSON.parse(JSON.stringify(msg.value))

            this.changeData()
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
      max-width: 200px;
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
  }


  #preview {
    height: 168px;
    overflow: hidden;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;

    .preview-scroll {
      height: 100%; // 5.5rem 
      overflow-x: hidden;
      overflow-y: auto;
    }

    .data-table-new {
      width: 100%;
      padding: .5rem 0;

      .row {
        padding: .5rem 1rem;
        display: grid;
        grid-template-columns: 174px 1fr;
        gap: 1.5rem;
        align-items: center;

        &:nth-child(odd) { background: #fff }
        &:nth-child(even) { background: #F5F5F5 }

        .col {
          &--empty {
            color: #999;
          }

          &--description {
            white-space: pre-line;
            word-break: break-all; 
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