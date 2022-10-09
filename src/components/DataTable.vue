<template>
	<div class="DataTable">
		<section>
			<h3 class="DataTable__header">
				{{ headerTitle }}
			</h3>
			<slot />
		</section>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		headerTitle: string
	}>()
</script>

<style lang="postcss" scoped>
	.DataTable {
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
	}

	@at-root {
		.figma-dark .DataTable__header {
			background: linear-gradient(to bottom, rgba(44, 44, 44, 0.95) 70%, rgba(44, 44, 44, 0));
		}
	}
</style>
