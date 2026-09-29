<script>
	// --- SCHULTE TABLE LOGIK ---
	let size = $state(5);
	const SIZES = [5, 7, 9];

	function centerIndex(n) {
		const mid = Math.floor(n / 2);
		return mid * n + mid;
	}

	function shuffleArray(arr) {
		const a = arr.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function buildGrid(n) {
		const total = n * n;
		const mid = centerIndex(n);
		const rest = [];
		for (let num = 2; num <= total; num++) rest.push(num);
		const shuffled = shuffleArray(rest);
		const grid = new Array(total);
		let ri = 0;
		for (let i = 0; i < total; i++) {
			if (i === mid) {
				grid[i] = 1;
			} else {
				grid[i] = shuffled[ri];
				ri++;
			}
		}
		return grid;
	}

	let grid = $state(buildGrid(size));
	function changeSize(n) {
		size = n;
		grid = buildGrid(size);
	}
	function shuffle() {
		grid = buildGrid(size);
	}
</script>
<h1 class="text-center mb-3">Shulte table</h1>

<div class="schulte-wrap">
	<div class="d-flex justify-content-center row mb-3">
		<div class="col-auto">
			<div class="btn-group" role="group">
				{#each SIZES as s, i (i)}
					<button
						class="btn {size === s ? 'btn-primary' : 'btn-outline-primary'}"
						type="button"
						onclick={() => changeSize(s)}>{s}x{s}</button
					>
				{/each}
			</div>
		</div>
		<div class="col-auto">
			<button class="btn btn-danger" type="button" onclick={shuffle}>Promiješaj</button>
		</div>
	</div>

	<div
		class="schulte-grid mt-5"
		style="grid-template-columns: repeat({size}, 1fr); max-width: {size * 70}px;"
	>
		{#each grid as num, i (i)}
			<div class="schulte-cell {num === 1 ? 'schulte-center' : ''}">{num}</div>
		{/each}
	</div>
</div>

<style>
	.schulte-grid {
       
		display: grid;
		gap: 4px;
        margin: 0 auto;
	}
	.schulte-cell {
		aspect-ratio: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1.4rem;
		font-weight: bold;
		background: #f8f9fa;
		user-select: none;
	}
	.schulte-center {
		background: #ffe066;
		border-color: #f5c518;
	}
</style>
