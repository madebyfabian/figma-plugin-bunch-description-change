<template>
	<Editor :variableData="data" editMode="variables" />

	<section id="preview">
		<DataTable v-for="(collection, key) of data.curr" :key="key" :headerTitle="collection.collectionName">
			<template v-if="collection.transformedVariableDataArr.length">
				<DataTableRow
					v-for="item of collection.transformedVariableDataArr"
					:key="item.id"
					:item="item"
					editMode="variables" />
			</template>
			<template v-else>
				<p class="EmptyRow">😋 No variables found in this collection.</p>
			</template>
		</DataTable>
	</section>
</template>

<script setup lang="ts">
	import { onMounted, reactive, watch } from 'vue'
	import { store, transformFieldValue } from '../store'
	import { TransformedVariableData } from '../../app.types'
	import { VariableData, postMsg, defaultOnmessageHandler } from '../utils'

	// Components
	import DataTable from '../components/DataTable.vue'
	import DataTableRow from '../components/DataTableRow.vue'
	import Editor from '../components/layouts/Editor.vue'

	const data = reactive<VariableData>({
		curr: null,
		original: null,
	})

	const inputChange = () => {
		data.curr =
			data.curr?.map((categoryItem, categoryItemKey) => {
				return {
					...categoryItem,
					transformedVariableDataArr: categoryItem.transformedVariableDataArr.map((item, itemKey, arr) => {
						const originalData = data.original?.[categoryItemKey].transformedVariableDataArr[itemKey]
						if (!originalData) return item
						return transformFieldValue<TransformedVariableData>(originalData, item, itemKey, arr)
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
		postMsg('requestVariablesData', {})
	})

	onmessage = event => {
		defaultOnmessageHandler(event)
		const msg = event.data.pluginMessage
		if (!msg) return

		switch (msg.type) {
			case 'useNewVariables': {
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
