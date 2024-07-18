<template>
	<section id="Editor">
		<div class="text-input-group">
			<TextareaInput v-model="store.values.match" placeholder="Match (optional)" class="text-input" />

			<div>
				<Dropdown
					v-if="editMode === 'components' || editMode === 'styles'"
					v-model="store.useFieldType"
					:options="store.useFieldTypeValues"
					tabindex="1"
					class="field-type-dropdown" />

				<SwitchInput v-model="store.values.useRegexMatch" :value="store.values.useRegexMatch">
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
			<TextareaInput v-model="store.values.replace" placeholder="Change to" class="text-input" />

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
					{{ layerNameLabel }}
				</FigmaButton>

				<FigmaButton type="tertiary" class="button" @click="clickReplaceShortcut('CLEAR')">
					Clear {{ replaceMatchInsteadOfValue ? 'matched' : 'field' }}
				</FigmaButton>
			</div>
		</div>

		<div class="text-input-group" style="margin-bottom: 0">
			<div class="text-input" style="display: flex; align-items: center; flex: 1">
				<FigmaButton
					type="primary"
					class="button"
					ref="changeBtn"
					@click="() => clickChangeBtn()"
					:disabled="displayDisabled">
					Change
				</FigmaButton>

				<SwitchInput
					v-if="editMode === 'components'"
					@update:modelValue="(val: boolean) => updateIsDocumentWideMode(val)"
					:modelValue="store.isDocumentWideMode"
					class="switch-input"
					style="margin-left: 1rem; margin-top: 0">
					Document-wide
				</SwitchInput>
			</div>

			<FigmaButton type="secondary" class="button" @click="clickUseLastChanges"> Use recent values </FigmaButton>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import { store, replaceMatchInsteadOfValue, EditMode } from '../../store'
	import { ComponentData, StyleData, VariableData, postMsg, updateIsDocumentWideMode } from '../../utils'

	// Components
	import TextareaInput from '../TextareaInput.vue'
	import SwitchInput from '../SwitchInput.vue'
	import FigmaButton from '../FigmaButton.vue'
	import Dropdown from '../Dropdown.vue'

	const props = defineProps<{
		componentData?: ComponentData
		styleData?: StyleData
		variableData?: VariableData
		editMode: EditMode
		displayDisabled?: boolean
	}>()

	const layerNameLabel = computed(() => {
		switch (props.editMode) {
			case 'components':
				return 'Layer name'
			case 'variables':
				return 'Variable name'
			default:
				return 'Style name'
		}
	})

	// Methods
	const clickReplaceShortcut = (action: 'VALUE_OR_MATCH' | 'LAYER_NAME' | 'NUMBER_ASC' | 'NUMBER_DESC' | 'CLEAR') => {
		const translate = {
			VALUE_OR_MATCH: '$&',
			LAYER_NAME: '$L',
			NUMBER_ASC: '$nn',
			NUMBER_DESC: '$NN',
			CLEAR: '$CLEAR',
		}

		store.values.replace += translate[action]
	}

	const clickUseLastChanges = () => {
		postMsg('clickUseLastChanges', {})
	}

	const clickChangeBtn = () => {
		const options = {
			componentData: null as unknown,
			styleData: null as unknown,
			variableData: null as unknown,
			values: JSON.parse(JSON.stringify(store.values)),
			useDocumentationLinksFieldType: store.useFieldType === 'documentationLinks',
		}

		switch (props.editMode) {
			case 'components':
				options.componentData = JSON.parse(JSON.stringify(props.componentData?.curr))
				break

			case 'variables':
				options.variableData = JSON.parse(JSON.stringify(props.variableData?.curr))
				break

			default:
				options.styleData = JSON.parse(JSON.stringify(props.styleData?.curr))
				break
		}

		postMsg('changeBtnClicked', options)
	}
</script>

<style lang="postcss" scoped>
	#Editor {
		padding: 1.25rem 1rem;
		position: relative;
		z-index: 20;
		box-shadow: 0 3px 3px rgba(0, 0, 0, 0.08), 0 10px 25px rgba(0, 0, 0, 0.08);
	}

	@at-root {
		.figma-dark #Editor {
			box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2), 0 10px 25px rgba(0, 0, 0, 0.2);
		}
	}

	.link {
		color: inherit;
		text-decoration: none;
	}

	.text-input-group {
		display: flex;
		margin-bottom: 1rem;

		.text-input {
			margin: 0 1rem 0 0;
			max-width: calc(200px + 8px); /* scrollbar */
			flex-shrink: 0;
		}

		.switch-input {
			margin-top: 0.75rem;
		}

		.field-type-dropdown {
			margin-bottom: 0.75rem;
		}

		.buttons {
			justify-content: flex-start;
			height: 4rem;
		}
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		margin: -0.25rem;

		.button {
			margin: 0.25rem;
		}
	}
</style>
