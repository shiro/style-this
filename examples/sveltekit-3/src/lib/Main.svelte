<script lang="ts">
	import Counter from './Counter.svelte';
</script>

<div class="ContainerStyle Global__Main">
	<Counter />
	hello
	<span class="colorStyle">
		world
	</span>
</div>

<style>
	.ContainerStyle {
		display: flex;
		flex-direction: column;
	}

	.colorStyle {
		color: coral;
	}

	:global(.Global__Main) {
		background: coral;
	}
</style>
