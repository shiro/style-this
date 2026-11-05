<script lang="ts">
	import { css, mergeStyles } from "@style-this/core";
	import Counter from './Counter.svelte';

	const ContainerStyle = css`
		display: flex;
		flex-direction: column;
	`;

	const colorStyle = css`
		color: coral;
	`;

	const highlightStyle = css`
		color: crimson;
	`;

	const _GlobalMain = css`
		:global(.Global__Main) {
			background: coral;
		}
	`;
</script>

<div class={`${ContainerStyle} Global__Main`}>
	<Counter />
	hello
	<span class={mergeStyles(colorStyle, highlightStyle)}>
		world
	</span>
</div>

<style>
	:global(.Global__Main) {
		background: coral;
	}
</style>
