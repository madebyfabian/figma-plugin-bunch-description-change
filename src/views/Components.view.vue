<template>
	<Editor :componentData="data" editMode="components" :displayDisabled="!currSelValid" />

	<section id="preview">
		<template v-if="currSelValid">
			<DataTable
				v-for="(page, key) of data.curr"
				:key="key"
				:headerTitle="store.isDocumentWideMode ? page.pageName : 'Selected Components'">
				<DataTableRow
					v-for="item of page.transformedComponentDataArr"
					:key="item.id"
					:item="item"
					editMode="components" />
			</DataTable>
		</template>

		<EmptyState v-else>
			<p>
				😋 Please select at least one component on the current page.<br />Want to change
				<strong>every component</strong> in this file?
			</p>
			<FigmaButton type="secondary" @click="() => updateIsDocumentWideMode(true)">
				Switch to document-wide mode
			</FigmaButton>
		</EmptyState>
	</section>
</template>

<script setup lang="ts">
	import { computed, onMounted, reactive, watch } from 'vue'
	import { store, transformFieldValue } from '../store'
	import { ComponentData, defaultOnmessageHandler, postMsg, updateIsDocumentWideMode } from '../utils'
	import { TransformedComponentData } from '../../app.types'

	// Components
	import FigmaButton from '../components/FigmaButton.vue'
	import EmptyState from '../components/EmptyState.vue'
	import Editor from '../components/layouts/Editor.vue'
	import DataTable from '../components/DataTable.vue'
	import DataTableRow from '../components/DataTableRow.vue'

	const data = reactive<ComponentData>({
		curr: null,
		original: null,
	})

	const currSelValid = computed(() => {
		if (!data.curr || !data.curr.length) return false
		if (data.curr.length === 1 && data.curr[0].transformedComponentDataArr.length === 0) return false

		return true
	})

	const inputChange = () => {
		data.curr =
			data.curr?.map((pageItem, pageItemKey) => {
				return {
					...pageItem,
					transformedComponentDataArr: pageItem.transformedComponentDataArr.map((item, itemKey, arr) => {
						const originalData = data.original?.[pageItemKey].transformedComponentDataArr[itemKey]
						if (!originalData) return item
						return transformFieldValue<TransformedComponentData>(originalData, item, itemKey, arr)
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
		postMsg('requestComponentsData', {})
	})

	onmessage = event => {
		defaultOnmessageHandler(event)

		const msg = event.data.pluginMessage
		if (!msg) return

		switch (msg.type) {
			case 'useNewComponentNodes': {
				const newData = msg.value
				data.curr = newData
				data.original = JSON.parse(JSON.stringify(newData))

				inputChange()

				break
			}
		}
	}
</script>

<style scoped lang="postcss"></style>
