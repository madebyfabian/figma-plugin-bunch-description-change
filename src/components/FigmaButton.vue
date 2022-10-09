<template>
	<button :type="type" :tabindex="type === 'tertiary' ? 1 : 0" :disabled="disabled">
		<slot />
	</button>
</template>

<script>
	export default {
		name: 'FigmaButton',

		props: {
			type: {
				type: String,
				default: 'primary',
			},
			disabled: {
				type: Boolean,
				default: false,
			},
		},
	}
</script>

<style lang="postcss" scoped>
	button {
		height: 2rem;
		text-align: center;
		line-height: calc(2rem - 2px);
		padding: 0 15px;
		border-radius: 6px;
		font-size: 11px;
		border: none;
		flex-shrink: 0;
		box-shadow: inset 0 0 0 1px var(--figma-color-bg-inverse);

		&[type='primary'] {
			background: var(--figma-color-bg-brand);
			box-shadow: none;
			color: var(--figma-color-text-onbrand);
			font-weight: 500;

			&:disabled {
				background: var(--figma-color-bg-brand-tertiary);
			}

			&:active:not(:disabled) {
				box-shadow: inset 0 0 0 2px var(--figma-color-border-brand);
			}
		}

		&[type='secondary'] {
			background: transparent;
			box-shadow: inset 0 0 0 1px var(--figma-color-bg-inverse);
			color: var(--figma-color-text);

			&:disabled {
				color: var(--figma-color-disabled);
				box-shadow: inset 0 0 0 1px var(--figma-color-border-disabled);
			}

			&:active:not(:disabled),
			&:focus:not(:disabled) {
				box-shadow: inset 0 0 0 2px var(--figma-color-border-brand);
			}
		}

		&[type='tertiary'] {
			background: transparent;
			color: var(--figma-color-text);
			box-shadow: none;
			border: 1px dashed var(--figma-color-bg-inverse);
			height: 1.75rem;
			line-height: calc(1.75rem - 2px);
			padding: 0 0.5rem;
			border-radius: 3px;
		}
	}
</style>
