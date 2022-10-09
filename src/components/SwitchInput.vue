<template>
	<div class="switch">
		<label>
			<input
				:name="name"
				:checked="modelValue"
				:tabindex="1"
				@change="$emit('update:modelValue', $event.target.checked)"
				type="checkbox"
				class="switch__input"
				ref="input" />
			<span class="switch__label"><slot /></span>
		</label>
	</div>
</template>

<script>
	export default {
		name: 'SwitchInput',
		props: {
			name: {
				type: String,
				default: '',
			},
			modelValue: {
				type: Boolean,
				required: true,
			},
		},
	}
</script>

<style lang="postcss" scoped>
	.switch {
		display: flex;
		height: 1rem;

		label {
			display: flex;
			align-items: center;
		}

		&__input {
			--input-border: var(--figma-color-border);

			-webkit-appearance: none;
			outline: none;
			border: none;
			padding: 0;
			margin: 0;
			background: transparent;
			position: relative;
			border: 1px solid var(--input-border);
			width: 24px;
			height: 12px;
			border-radius: 11px;
			transition: background-color 0.2s ease;

			&:after {
				content: '';
				display: block;
				left: -1px; /* hack */
				top: -1px; /* hack */
				border-radius: 50%;
				width: 12px;
				height: 12px;
				position: absolute;
				border: 1px solid var(--input-border);
				transition: transform 0.2s ease;
				background: var(--figma-color-bg-inverse);
			}

			&:checked {
				background-color: var(--figma-color-bg-tertiary);

				&:after {
					transform: translateX(12px);
				}
			}
		}

		&__label {
			padding-left: 0.5rem;
		}
	}
</style>
