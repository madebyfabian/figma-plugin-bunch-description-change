<template>
	<div class="tabs" role="tablist" aria-orientation="horizontal">
		<button
			v-for="tabItem in tabs"
			role="tab"
			:aria-selected="isActive(tabItem)"
			@click="changeTab(tabItem.name)"
			class="tab"
			:class="{ 'is-active': isActive(tabItem) }">
			{{ tabItem.label }}
		</button>
	</div>

	<div class="tabs-details">
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
	import type { EditMode } from '../store'

	export type Tab = {
		name: EditMode
		label: string
	}

	const props = defineProps<{
		tabs: Tab[]
		tab: EditMode
	}>()

	const emit = defineEmits<{
		(e: 'changeTab', tab: EditMode): void
	}>()

	const changeTab = (tab: EditMode) => {
		emit('changeTab', tab)
	}

	const isActive = (tabItem: Tab) => {
		return tabItem.name === props.tab
	}
</script>

<style scoped lang="postcss">
	.tabs {
		display: flex;
		align-items: center;
		padding: 0 4px;
		border-bottom: 1px solid var(--figma-color-border);

		.tab {
			font-weight: 500;
			padding: 0 12px;
			appearance: none;
			background: transparent;
			height: 40px;
			line-height: 40px;
			color: var(--figma-color-text-secondary);
			border: none;
			box-shadow: none !important;

			&.is-active,
			&:hover {
				color: var(--figma-color-text);
			}
		}
	}

	.tabs-details {
		position: relative;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
</style>
