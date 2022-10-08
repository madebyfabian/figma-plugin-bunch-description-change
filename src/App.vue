<template>
	<main>
		<MainView />
	</main>
</template>

<script>
	import MainView from './views/Main.view'

	export default {
		name: 'App',

		components: { MainView },
	}
</script>

<style lang="scss">
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
</style>
