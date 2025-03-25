<script>
    import { page } from '$app/state';
	import { formatDate } from '../../../../utils/dateUtils';

	let orderId = page.params.id;

 	// Повідомлення про успіх/помилку
	let successMessage = '';
	let errorMessage = '';

	let data = { order: null };

	let loading = false;
	let isOpenModal = false;
	let searchValue = '';

	function fetchOrder(url) {
		loading = true;
		fetch(url)
			.then((res) => res.json())
			.then((enterData) => {
				if (!enterData || Object.keys(enterData).length === 0) {
					isOpenModal = true;
				} else {
					data.order = enterData;
				}
				loading = false;
			});            
	}

	$: if (searchValue === '') {
		fetchOrder(`http://127.0.0.1:8000/api/order/${orderId}`);
	}

 	// Реактивний перерахунок total (округлення до 2 знаків)
	$: if (data.order && data.order.items) {
		let sum = 0;
		for (const item of data.order.items) {
 			sum += item.price * item.count;
		}
		data.order.total = parseFloat(sum.toFixed(2));
	}

 	// Зберегти зміни (PUT /api/order/{id})
	async function updateOrder() {
		successMessage = '';
		errorMessage = '';

		const body = {
			name: data.order.name,
			phone: data.order.phone,
			address: data.order.address,
			total: data.order.total,
			status: data.order.status,
 			// Отправляем все items
			items: data.order.items.map((i) => ({
				id: i.id,
				product_id: i.product_id,
				title: i.title,
				price: i.price,
				count: i.count
			}))
		};

		try {
			const res = await fetch(`http://127.0.0.1:8000/api/order/${orderId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (res.ok) {
				const dataId = await res.json();
				data.order = dataId.order;
				successMessage = dataId.message || 'The order is updated.';
			} else {
				errorMessage = 'Error updating order: ' + (await res.text());
			}
		} catch (err) {
			errorMessage = 'Error updating order: ' + err;
		}
	}

 	// Додати новий товар (id=null), нехай адмін вкаже product_id, count
 	// (title/price підтягнуться на бекенді або під час збереження)
	function addItem() {
		if (!data.order.items) {
			data.order.items = [];
		}
		data.order.items.push({
			id: null,
			product_id: '',
 			title: '', // не редагуємо на фронті
 			price: 0, // не редагуємо на фронті
			count: 1
		});
 		// Оновлюємо посилання, щоб Svelte побачив зміни
		 data.order.items = [...data.order.items];
	}

 	// Видалити товар (DELETE /api/orders/orderId}/items/{itemId})
	async function removeItem(item, index) {
		successMessage = '';
		errorMessage = '';

 		// Якщо id=null => товар ще не в БД
		if (!item.id) {
			data.order.items.splice(index, 1);
			data.order.items = [...data.order.items];
			return;
		}

 		// Інакше робимо запит DELETE
		try {
			const res = await fetch(`http://127.0.0.1:8000/api/order/${orderId}/items/${item.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.ok) {
				const dataId = await res.json();
				data.order = dataId.order;
				successMessage = dataId.message || 'Item removed successfully';
			} else {
				errorMessage = 'Error removing item: ' + (await res.text());
			}
		} catch (err) {
			errorMessage = 'Error removing item: ' + err;
		}
	}
</script>

<div style="text-align:center;">
    {#if data.order}
	<h1 class="page-title adm-h1">Edit Order #{data.order.id}</h1>

	<!-- Повідомлення -->
	{#if successMessage}
		<p class="success-msg margin-20-auto">{successMessage}</p>
	{/if}
	{#if errorMessage}
		<p class="error-msg margin-20-auto">{errorMessage}</p>
	{/if}

	<!-- Поля замовлення -->
	<h3 class="page-title">Order Data</h3>
	<!-- <div class="overflow-x-auto"> -->
	 <!-- overflow-x-auto додає скрол таблиці -->
	 <div>
		<table class="table margin-top-20">
			<!-- head -->
			<thead>
				<tr>
					<th></th>
					<th>Phone</th>
					<th>Address</th>
					<th>Total</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->
					<tr>
						<td></td>
						<td>{data.order.name}</td>
						<td>{data.order.phone}</td>
						<td>{data.order.address}</td>
						<td>
							<label for="orderStatus">Status:</label>
							<select id="orderStatus" bind:value={data.order.status}>
								<option value="pending">Pending</option>
								<option value="processing">Processing</option>
								<option value="completed">Completed</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</td>
						<td></td>
					</tr>
			</tbody>
			<!-- foot -->
			<tfoot>
			</tfoot>
		</table>
	</div>

	<h3 class="page-title margin-top-40">Order Details</h3>
	<div class="overflow-x-auto">
		<table class="table margin-top-20">
			<!-- head -->
			<thead>
				<tr>
					<th></th>
					<th>ID</th>
					<th>Product ID</th>
					<th>Title</th>
					<th>Price</th>
					<th>Count</th>
					<th>Created</th>
					<th>Updated</th>
					<th></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<!-- row 1 -->
				{#each data.order.items as item, index}
					<tr>
						<td></td>
						<td>{item.id}</td>
						<td><input type="number" bind:value={item.product_id} /></td>
						<td>{item.title}</td>
						<td>{item.price}</td>
						<td><input type="number" min="1" bind:value={item.count} /></td>
						<td>{formatDate(item.created_at)}</td>
						<td>{formatDate(item.updated_at)}</td>
						<td><button class="btn" aria-labelledby="Delete" on:click={() => removeItem(item, index)}>
							<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 12V17" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M14 12V17" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M4 7H20" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button></td>
						<td></td>
					</tr>
				{/each}
			</tbody>
			<!-- foot -->
			<tfoot>
				<tr>
					<th></th>
					<th>ID</th>
					<th>Product ID</th>
					<th>Title</th>
					<th>Price</th>
					<th>Count</th>
					<th>Created</th>
					<th>Updated</th>
					<th></th>
					<th></th>
				</tr>
			</tfoot>
		</table>
	</div>

	<p class="margin-top-20">* У базі 194 ID товарів (продуктів). Коли додаєте товар, він з'явиться в таблиці, якщо його ID не більше 194.</p>

	<button class="btn btn-active btn-primary margin-top-40" on:click={addItem}>Add Product</button>

	<button class="btn btn-active btn-warning" on:click={updateOrder}>Save Order</button>
    {:else if errorMessage}
        <p class="error-msg">{errorMessage}</p>
    {:else}
        <p class="loading-msg">Loading order...</p>
    {/if}
</div>