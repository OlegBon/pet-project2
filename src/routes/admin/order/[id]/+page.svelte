<script>
    import { page } from '$app/stores';
 	import { onMount } from 'svelte';
 
 	let orderId = $page.params.id;
 	let order = null;
 
 	// Повідомлення про успіх/помилку
 	let successMessage = '';
 	let errorMessage = '';
 
 	// Завантажуємо замовлення під час монтування
 	onMount(async () => {
 		try {
 			const res = await fetch(`http://127.0.0.1:8000/api/order/${orderId}`);
 			if (!res.ok) {
 				errorMessage = 'Error loading order: ' + (await res.text());
 				return;
 			}
 			order = await res.json();
 		} catch (err) {
 			errorMessage = 'Error fetching order: ' + err;
 		}
 	});
 
 	// Реактивний перерахунок total (округлення до 2 знаків)
 	$: if (order && order.items) {
 		let sum = 0;
 		for (const item of order.items) {
 			sum += item.price * item.count;
 		}
 		order.total = parseFloat(sum.toFixed(2));
 	}
 
 	// Зберегти зміни (PUT /api/order/{id})
 	async function updateOrder() {
 		successMessage = '';
 		errorMessage = '';
 
 		const body = {
 			name: order.name,
 			phone: order.phone,
 			address: order.address,
 			total: order.total,
 			status: order.status,
 			// Отправляем все items
 			items: order.items.map((i) => ({
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
 				const data = await res.json();
 				order = data.order;
 				successMessage = data.message || 'The order is updated.';
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
 		if (!order.items) {
 			order.items = [];
 		}
 		order.items.push({
 			id: null,
 			product_id: '',
 			title: '', // не редагуємо на фронті
 			price: 0, // не редагуємо на фронті
 			count: 1
 		});
 		// Оновлюємо посилання, щоб Svelte побачив зміни
 		order.items = [...order.items];
 	}
 
 	// Видалити товар (DELETE /api/orders{orderId}/items/{itemId})
 	async function removeItem(item, index) {
 		successMessage = '';
 		errorMessage = '';
 
 		// Якщо id=null => товар ще не в БД
 		if (!item.id) {
 			order.items.splice(index, 1);
 			order.items = [...order.items];
 			return;
 		}
 
 		// Інакше робимо запит DELETE
 		try {
 			const res = await fetch(`http://127.0.0.1:8000/api/order/${orderId}/items/${item.id}`, {
 				method: 'DELETE',
 				headers: { 'Content-Type': 'application/json' }
 			});
 			if (res.ok) {
 				const data = await res.json();
 				order = data.order;
 				successMessage = data.message || 'Item removed successfully';
 			} else {
 				errorMessage = 'Error removing item: ' + (await res.text());
 			}
 		} catch (err) {
 			errorMessage = 'Error removing item: ' + err;
 		}
 	}
</script>

<div style="text-align:center;">
    {#if order}
 	<h3 class="page-title">Edit Order {order.id}</h3>
 
 	<!-- Повідомлення -->
 	{#if successMessage}
 		<p class="success-msg">{successMessage}</p>
 	{/if}
 	{#if errorMessage}
 		<p class="error-msg">{errorMessage}</p>
 	{/if}
 
 	<!-- Поля замовлення -->
 	<div class="edit-form">
 		<div class="form-group">
 			<label>Name:</label>
 			<input bind:value={order.name} />
 		</div>
 
 		<div class="form-group">
 			<label>Phone:</label>
 			<input bind:value={order.phone} />
 		</div>
 
 		<div class="form-group">
 			<label>Address:</label>
 			<input bind:value={order.address} />
 		</div>
 
 		<div class="form-group">
 			<label>Total:</label>
 			<input type="number" bind:value={order.total} disabled />
 		</div>
 
 		<div class="form-group">
 			<label>Status:</label>
 			<select bind:value={order.status}>
 				<option value="pending">Pending</option>
 				<option value="processing">Processing</option>
 				<option value="completed">Completed</option>
 				<option value="cancelled">Cancelled</option>
 			</select>
 		</div>
 	</div>
 
 	<h4 class="page-title">Order Items</h4>
 	<table class="items-table">
 		<thead>
 			<tr>
 				<th>ID</th>
 				<th>Product ID</th>
 				<!-- title / price відображаємо, але без можливості редагування -->
 				<th>Title</th>
 				<th>Price</th>
 				<th>Count</th>
 				<th>Actions</th>
 			</tr>
 		</thead>
 		<tbody>
 			{#each order.items as item, index}
 				<tr>
 					<td>{item.id}</td>
 					<td>
 						<input type="number" bind:value={item.product_id} />
 					</td>
 					<!-- Просто текст, не можна змінювати -->
 					<td>{item.title}</td>
 					<td>{item.price}</td>
 					<td>
 						<input type="number" min="1" bind:value={item.count} />
 					</td>
 					<td>
 						<button class="delete-btn" on:click={() => removeItem(item, index)}>Remove</button>
 					</td>
 				</tr>
 			{/each}
 		</tbody>
 	</table>
 
 	<!-- Кнопка "Add Item" (зелена) -->
 	<button class="add-btn" on:click={addItem}>Add item</button>
 
 	<!-- Кнопка "Save" (синій, як раніше) -->
 	<button class="save-btn" on:click={updateOrder}>Save</button>
    {:else if errorMessage}
        <p class="error-msg">{errorMessage}</p>
    {:else}
        <p>Loading order...</p>
    {/if}
</div>