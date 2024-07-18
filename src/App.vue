<template>
	<Tabs :tabs="tabs" :tab="store.editMode" @changeTab="(newVal: EditMode) => (store.editMode = newVal)">
		<component :is="currentTabItem?.component" />
	</Tabs>
</template>

<script setup lang="ts">
	import { EditMode, store } from './store'
	import { ref, computed } from 'vue'

	// Components
	import Tabs from './components/Tabs.vue'
	import type { Tab } from './components/Tabs.vue'

	// Views
	import ComponentsView from './views/Components.view.vue'
	import StylesView from './views/Styles.view.vue'
	import VariablesView from './views/Variables.view.vue'
	const tabs = ref<(Tab & { component: unknown })[]>([
		{
			name: 'components',
			label: 'Components',
			component: ComponentsView,
		},
		{
			name: 'styles',
			label: 'Styles',
			component: StylesView,
		},
		{
			name: 'variables',
			label: 'Variables',
			component: VariablesView,
		},
	])
	const currentTabItem = computed(() => {
		return tabs.value.find(tab => tab.name === store.editMode)
	})
</script>

<style lang="postcss">
	@import url('https://rsms.me/inter/inter.css');

	* {
		font-family: 'Inter var', system-ui, sans-serif !important;
		user-select: none;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	*:not(html) {
		font-size: 11px;
		letter-spacing: 0.055px;
	}

	html {
		font-size: 16px;
	}

	body {
		margin: 0;
	}

	*,
	*::after,
	*::before {
		box-sizing: border-box;
		line-height: 16px;
	}

	*:focus {
		outline: none;
	}

	*:focus:not(:focus-visible) {
		box-shadow: 0 0 0 2px var(--figma-color-bg-brand) !important;
	}

	body {
		color: var(--figma-color-text);
		overflow: hidden;
	}

	#app {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	#preview {
		flex-grow: 1;
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
	}
</style>
