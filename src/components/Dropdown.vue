<template>
	<div class="dropdown">
		<select @change="e => $emit('input', e.target.value)" tabindex="1">
			<option
				v-for="(option, key) of options"
				:key="key"
				:value="option.value"
				:selected="option.value === value"
				v-text="option.label"
			/>
		</select>
		<span>⌃</span>
	</div>
</template>

<script>
	export default {
		props: {
			value: { required: true },
			options: { required: true, type: Array },
			tabindex: { default: 1 },
		},
	}
</script>

<style lang="scss" scoped>
	.dropdown {
		position: relative;
	}

	select {
		appearance: none;
		background: var(--figma-color-bg);
		color: var(--figma-color-text);
		position: relative;
		display: block;
		height: 2rem;
		padding: 0 1.5rem 0 0.5rem;
		width: 100%;
		border: none;
		outline: none;
		margin: 0;
		border-radius: 3px;
		border: 1px solid var(--figma-color-border);
		box-shadow: inset 0 0 0 2px transparent !important;
	}

	span {
		content: '';
		position: absolute;
		pointer-events: none;
		top: 0.4rem;
		right: 0.5rem;
		transform: rotate(180deg);
	}
</style>
