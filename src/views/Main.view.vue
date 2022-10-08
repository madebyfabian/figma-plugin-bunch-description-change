<template>
	<div>
		<div v-if="currSelValid" id="ui">
			<section id="main">
				<div class="text-input-group">
					<TextareaInput v-model="values.match" placeholder="Match (optional)" class="text-input" />

					<div>
						<Dropdown v-model="useFieldType" :options="useFieldTypeValues" tabindex="1" />

						<SwitchInput v-model="values.useRegexMatch" :value="values.useRegexMatch" class="switch-input">
							Use RegEx
							<a
								class="link"
								title="Link to RegEx Tutorial"
								href="https://daneden.me/blog/2019/regex-for-designers-and-writers"
								target="_blank"
								><strong>?</strong></a
							>
						</SwitchInput>
					</div>
				</div>

				<div class="text-input-group">
					<TextareaInput v-model="values.replace" placeholder="Change to" class="text-input" />

					<div class="buttons">
						<FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('NUMBER_ASC')">
							123 &darr;
						</FigmaButton>

						<FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('NUMBER_DESC')">
							321 &uarr;
						</FigmaButton>

						<FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('VALUE_OR_MATCH')">
							Curr. {{ replaceMatchInsteadOfValue ? 'match' : 'value' }}
						</FigmaButton>

						<FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('LAYER_NAME')">
							Layer name
						</FigmaButton>

						<FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('CLEAR')">
							Clear {{ replaceMatchInsteadOfValue ? 'matched' : 'field' }}
						</FigmaButton>
					</div>
				</div>

				<div class="text-input-group" style="margin-bottom: 0;">
					<div class="text-input" style="display: flex; align-items: center; flex: 1;">
						<FigmaButton type="primary" class="button" ref="changeBtn" @click="clickChangeBtn">
							Change
						</FigmaButton>

						<SwitchInput
							@input="val => updateIsDocumentWideMode(val)"
							:value="isDocumentWideMode"
							class="switch-input"
							style="margin-left: 1rem; margin-top: 0;"
						>
							Document-wide
						</SwitchInput>
					</div>

					<FigmaButton type="secondary" class="button" @click="clickUseLastChanges">
						Use recent values
					</FigmaButton>
				</div>
			</section>

			<section id="preview">
				<div class="data-table">
					<section v-for="page of data.curr" :key="page.pageId">
						<h3 class="data-table__header">
							{{ isDocumentWideMode ? page.pageName : 'Selected Components' }}
						</h3>
						<div class="row" v-for="item of page.transformedComponentDataArr" :key="item.id">
							<div
								class="col col--value"
								v-if="getFieldValueOfItem(item) !== '' && getFieldValueOfItem(item) !== undefined"
								v-text="getFieldValueOfItem(item)"
							></div>
							<div class="col col--value col--empty" v-else>No {{ documentationLinksFieldLabel }}</div>
							<div class="col col--name" :title="item.name" v-text="item.name"></div>
						</div>
					</section>
				</div>
			</section>
		</div>

		<div v-else class="error-overlay">
			<div class="error-overlay__inner">
				<p>😋 Please select at least one Component.</p>
				<p class="error-overlay__seperator"><span>or</span></p>
				<p class="error-overlay__second-text">
					🚀 If you want to change <strong>all components</strong><br />in the document, use document-wide mode
				</p>
				<FigmaButton type="secondary" @click="() => updateIsDocumentWideMode(true)"
					>Switch to document-wide mode</FigmaButton
				>
			</div>
		</div>
	</div>
</template>

<script>
	const postMsg = (type, value) => parent.postMessage({ pluginMessage: { type, value } }, '*')

	import TextareaInput from '../components/TextareaInput'
	import SwitchInput from '../components/SwitchInput'
	import FigmaButton from '../components/FigmaButton'
	import Dropdown from '../components/Dropdown'

	export default {
		name: 'App',

		components: { SwitchInput, FigmaButton, TextareaInput, Dropdown },

		data: () => ({
			isDocumentWideMode: false,

			currSelValid: true,

			values: {
				match: '',
				replace: '',
				useRegexMatch: false,
			},

			useFieldType: 'description',
			useFieldTypeValues: [
				{ value: 'description', label: 'Change Description' },
				{ value: 'documentationLinks', label: 'Change Documentation Link' },
			],

			data: {
				curr: null,
				original: null,
			},
		}),

		computed: {
			useDocumentationLinksFieldType() {
				return this.useFieldType === 'documentationLinks'
			},

			documentationLinksFieldLabel() {
				return this.useDocumentationLinksFieldType ? 'documentation link' : 'description'
			},

			dataHasChanged() {
				return JSON.stringify(this.data.curr) !== JSON.stringify(this.data.original)
			},

			replaceMatchInsteadOfValue() {
				return this.values.match !== ''
			},
		},

		methods: {
			/**
			 * Takes in an item (e.g. { name: '...', description: '...', documentationLinks: [...] }) and
			 * @returns {String} The Value of either the description or the documentationLinks field.
			 */
			getFieldValueOfItem(item) {
				if (this.useDocumentationLinksFieldType)
					return item.documentationLinks && item.documentationLinks[0] ? item.documentationLinks[0].uri : null
				else return item.description
			},

			inputChange() {
				this.data.curr = this.data.curr.map((pageItem, j) => {
					return {
						...pageItem,
						transformedComponentDataArr: pageItem.transformedComponentDataArr.map((item, i, arr) => {
							// Holds the string with the field's value
							let fieldValue = ''

							const originalData = this.data.original[j].transformedComponentDataArr[i]
							const originalFieldValue = this.getFieldValueOfItem(originalData) || ''

							if (!this.values.match.length)
								fieldValue = !this.values.replace.length ? originalFieldValue : this.values.replace
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
							fieldValue = fieldValue.replace(
								/\$&/gi,
								this.replaceMatchInsteadOfValue ? this.values.match : originalFieldValue
							)
							fieldValue = fieldValue.replace(/\$L/gi, originalData.name)
							fieldValue = fieldValue.replace(/\$CLEAR/gi, '')

							const ascNumberMatches = fieldValue.match(/\$n+/g) || []
							for (const str of ascNumberMatches) {
								fieldValue = fieldValue.replace(str, String(i).padStart(str.length - 1, '0'))
							}
							const descNumberMatches = fieldValue.match(/\$N+/g) || []
							for (const str of descNumberMatches) {
								fieldValue = fieldValue.replace(str, String(arr.length - i - 1).padStart(str.length - 1, '0'))
							}

							let returnData = { ...item }
							if (this.useDocumentationLinksFieldType) {
								// Check if value is valid url
								returnData.documentationLinks = [{ uri: fieldValue }]
							} else returnData.description = fieldValue

							return returnData
						}),
					}
				})
			},

			clickUseLastChanges() {
				postMsg('clickUseLastChanges', {})
			},

			clickChangeBtn() {
				postMsg('changeBtnClicked', {
					data: this.data.curr,
					values: this.values,
					useDocumentationLinksFieldType: this.useDocumentationLinksFieldType,
				})
			},

			clickReplaceShortcut(action) {
				const translate = {
					VALUE_OR_MATCH: '$&',
					LAYER_NAME: '$L',
					NUMBER_ASC: '$nn',
					NUMBER_DESC: '$NN',
					CLEAR: '$CLEAR',
				}

				this.values.replace += translate[action]
			},

			updateIsDocumentWideMode(isDocumentWideMode) {
				postMsg('updateIsDocumentWideMode', { isDocumentWideMode })
			},
		},

		watch: {
			values: {
				handler() {
					this.inputChange()
				},
				deep: true,
			},
		},

		created() {
			onmessage = event => {
				const msg = event.data.pluginMessage
				if (!msg) return

				switch (msg.type) {
					case 'useNewComponentNodes': {
						this.currSelValid = true

						const data = msg.value
						if (!data || !data.length) this.currSelValid = false

						if (data.length === 1 && data[0].transformedComponentDataArr.length === 0) this.currSelValid = false

						if (!this.currSelValid) return

						this.data.curr = msg.value
						this.data.original = JSON.parse(JSON.stringify(msg.value))

						this.inputChange()

						break
					}

					case 'clickUseLastChanges': {
						this.values = msg.value
						break
					}

					case 'updateIsDocumentWideMode': {
						this.isDocumentWideMode = msg.value
						break
					}

					case 'resetValues': {
						Object.assign(this.$data.values, this.$options.data().values)
						break
					}
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.error-overlay {
		height: 100vh;
		width: 100vw;
		display: flex;
		justify-content: center;
		align-items: center;

		p,
		strong {
			font-size: 13px;
			line-height: 1.5;
		}

		&__inner {
			text-align: center;
		}

		&__second-text {
			margin-bottom: 1.25rem;
		}

		&__seperator {
			margin: 2rem 0;
			position: relative;

			span {
				background: var(--figma-color-bg);
				padding: 0.5rem;
				position: relative;
			}

			&::before {
				content: '';
				left: 0;
				top: calc(50% - 0.5px);
				height: 1px;
				width: 100%;
				background: var(--figma-color-border);
				position: absolute;
			}
		}
	}

	#ui {
		display: flex;
		flex-flow: column;
		height: 100vh;
	}

	#main {
		padding: 1.25rem 1rem;
		position: relative;
		z-index: 20;
		box-shadow: 0 3px 3px rgba(0, 0, 0, 0.08), 0 10px 25px rgba(0, 0, 0, 0.08);
	}

	@at-root .figma-dark #main {
		box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2), 0 10px 25px rgba(0, 0, 0, 0.2);
	}

	.link {
		color: inherit;
		text-decoration: none;
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
			margin-top: 0.75rem;
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
		margin: -0.25rem;

		.button {
			margin: 0.25rem;
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
			border: 2px solid transparent;
			background-clip: padding-box;
			border-radius: 7px;
			background-color: var(--figma-color-bg-tertiary);
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

			&__header {
				margin: 0;
				padding: 1rem 1rem 0.5rem;
				position: sticky;
				top: 0;
				pointer-events: none;
				z-index: 10;
				background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 70%, rgba(255, 255, 255, 0));
			}

			@at-root .figma-dark #preview .data-table {
				&__header {
					background: linear-gradient(to bottom, rgba(44, 44, 44, 0.95) 70%, rgba(44, 44, 44, 0));
				}
			}

			.row {
				padding: 0.5rem 1rem;
				display: grid;
				grid-template-columns: 174px 1fr;
				gap: 2rem;

				&:nth-child(odd) {
					background: var(--figma-color-bg);
				}
				&:nth-child(even) {
					background: var(--figma-color-bg-secondary);
				}

				&:first-child {
					padding-top: 1rem;
				}
				&:last-child {
					padding-bottom: 1rem;
				}

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
						color: var(--figma-color-text-component);
						display: inline-block;
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
						font-feature-settings: 'ss02' on, 'liga' on, 'calt' on;

						&::before {
							content: '❖';
							padding-right: 0.5rem;
						}

						svg {
							margin: 0 0.25rem 0 0;
							display: inline;
						}
					}
				}
			}
		}
	}
</style>
