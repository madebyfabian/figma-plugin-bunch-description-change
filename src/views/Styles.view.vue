<template>
	<Editor :styleData="data" editMode="styles" />

	<section id="preview">
		<DataTable v-for="(category, key) of data.curr" :key="key" :headerTitle="category.categoryLabel">
			<template v-if="category.transformedStyleDataArr.length">
				<DataTableRow v-for="item of category.transformedStyleDataArr" :key="item.id" :item="item" editMode="styles" />
			</template>
			<template v-else>
				<p class="EmptyRow">😋 No styles found in this category.</p>
			</template>
		</DataTable>
	</section>
</template>

<script setup lang="ts">
	import { onMounted, reactive, watch } from 'vue'
	import { store, transformFieldValue } from '../store'
	import { TransformedStyleData } from '../../app.types'
	import { StyleData, postMsg, defaultOnmessageHandler } from '../utils'

	// Components
	import DataTable from '../components/DataTable.vue'
	import DataTableRow from '../components/DataTableRow.vue'
	import Editor from '../components/layouts/Editor.vue'

	const data = reactive<StyleData>({
		curr: null,
		original: null,
	})

	const inputChange = () => {
		data.curr =
			data.curr?.map((categoryItem, categoryItemKey) => {
				return {
					...categoryItem,
					transformedStyleDataArr: categoryItem.transformedStyleDataArr.map((item, itemKey, arr) => {
						const originalData = data.original?.[categoryItemKey].transformedStyleDataArr[itemKey]
						if (!originalData) return item
						return transformFieldValue<TransformedStyleData>(originalData, item, itemKey, arr)
					}),
				}
			}) ?? null
	}

	watch(
		() => store.values,
		() => {
			inputChange()
		},
		{ deep: true }
	)

	onMounted(() => {
		postMsg('requestStylesData', {})
	})

	onmessage = event => {
		defaultOnmessageHandler(event)
		const msg = event.data.pluginMessage
		if (!msg) return

		switch (msg.type) {
			case 'useNewStyles': {
				const newData = msg.value
				data.curr = newData
				data.original = JSON.parse(JSON.stringify(newData))

				inputChange()

				break
			}
		}
	}
</script>

<style scoped lang="postcss">
	.EmptyRow {
		padding: 0 1rem 0;
	}
</style>
