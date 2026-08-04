<script lang="ts">
	import { css } from "@style-this/core";
	import Counter from './Counter.svelte';

	const ContainerStyle = css`
		display: flex;
		flex-direction: column;
	`;

	const colorStyle = css`
		color: coral;
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
	<span class={colorStyle}>
		world
	</span>
</div>

<style>
	:global(.Global__Main) {
		background: coral;
	}
</style>
