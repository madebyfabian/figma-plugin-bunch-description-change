<template>
	<div class="DataTableRow">
		<div
			v-if="fieldValueOfData !== '' && fieldValueOfData !== undefined"
			v-text="fieldValueOfData"
			class="col col--value" />
		<div class="col col--value col--empty" v-else>
			No {{ store.useFieldType === 'documentationLinks' ? 'documentation link' : 'description' }}
		</div>
		<div
			class="col col--name"
			:title="item.name"
			:style="{
				'color': props.editMode === 'components' ? 'var(--figma-color-text-component)' : 'var(--figma-color-text)',
			}">
			{{ icon }}&nbsp;&nbsp;{{ item.name }}
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import { TransformedStyleData, TransformedComponentData } from '../../app.types'
	import { store, getFieldValueOfData, EditMode } from '../store'

	const props = defineProps<{
		item: TransformedComponentData | TransformedStyleData
		editMode: EditMode
	}>()

	const fieldValueOfData = computed(() => {
		return getFieldValueOfData(props.item)
	})

	const icon = computed(() => {
		if (props.editMode === 'components') {
			return '❖'
		} else {
			if (!('type' in props.item)) return ''

			switch (props.item.type) {
				case 'TEXT':
					return '📝'
				case 'PAINT':
					return '🎨'
				case 'EFFECT':
					return '🌈'
				case 'GRID':
					return '🔲'
			}
		}
	})
</script>

<style scoped lang="postcss">
	.DataTableRow {
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
			&--value {
				white-space: pre-wrap;
				overflow-wrap: break-word;
				letter-spacing: 0px;
			}

			&--empty {
				color: #999;
				font-style: italic;
				white-space: nowrap;
			}

			&--name {
				position: relative;
				font-weight: 600;
				display: inline-block;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				font-feature-settings: 'ss02' on, 'liga' on, 'calt' on;

				svg {
					margin: 0 0.25rem 0 0;
					display: inline;
				}
			}
		}
	}
</style>
