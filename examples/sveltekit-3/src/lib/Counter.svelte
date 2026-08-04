<script lang="ts">
	import { css, extraClass } from '@style-this/core';

	const spacing = 16;

	export const CounterStyle = css`
		display: flex;
		align-items: center;
		gap: 8px;
		padding: ${spacing}px;
		margin: ${spacing}px;
		border: 1px solid blue;
		border-radius: ${spacing / 2}px;
		background: white;
		${extraClass("something")}
	`;

	const ButtonStyle = css`
		border: 1px solid blue;
		border-radius: 2px;
		padding: 8px;
		cursor: pointer;
	`;

	let count = $state(0);
</script>

<div class={CounterStyle}>
	{count}
	<button 
		class={ButtonStyle}
		style="background: {count >= 3 ? 'red' : 'green'}"
		onclick={() => count++}
		disabled={count >= 3}
	>
		count me
	</button>
</div>
