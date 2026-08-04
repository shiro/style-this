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

	let count = $state(0);
</script>

<div class={CounterStyle}>
	{count}
	<button 
		onclick={() => count++}
		disabled={count >= 3}
	>
		count me
	</button>
</div>
