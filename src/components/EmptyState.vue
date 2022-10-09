<template>
	<div class="EmptyState">
		<slot />
	</div>
</template>

<script setup lang="ts"></script>

<style scoped lang="postcss">
	.EmptyState {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
		text-align: center;

		:slotted(p),
		:slotted(strong) {
			font-size: 13px;
			line-height: 1.5;
			margin-top: 0;
		}
	}
</style>
