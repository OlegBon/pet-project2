<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { formatDate } from '../../utils/dateUtils';
    
	let data = { orders: [] };

	let loading = false;
	let isOpenModal = false;
	let searchValue = '';

	let selectedOrders = [];
	let isAllSelected = false;

	function fetchOrders(url) {
		loading = true;
		fetch(url)
			.then((res) => res.json())
			.then((enterData) => {
				if (!enterData.length) {
					isOpenModal = true;
				} else {
					data.orders = enterData;
				}
				loading = false;
			});            
	}

	// $: if (searchValue === '') {
	// 	fetchOrders(`http://127.0.0.1:8000/api/orders`);
	// }

	// Викликаємо fetchOrders тільки після завантаження компонента
    onMount(() => {
        if (searchValue === '') {
            fetchOrders(`http://127.0.0.1:8000/api/orders`);
        }
    });

	async function deleteOrder(id) {
		try {
 			// Надсилаємо DELETE-запит на сервер
			const res = await fetch(`http://127.0.0.1:8000/api/order/${id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.ok) {
 				// Видаляємо замовлення з локального масиву
				data.orders = data.orders.filter((o) => o.id !== id);
			} else {
				console.error('Error deleting order:', await res.text());
			}
		} catch (err) {
			console.error('Error deleting order:', err);
		}
	}

	function toggleOrderSelection(id, isSelected) {
		if (isSelected) {
			selectedOrders.push(id);
		} else {
			selectedOrders = selectedOrders.filter((selectedId) => selectedId !== id);
		}
	}

	async function deleteSelectedOrders() {
		try {
			for (const id of selectedOrders) {
				const res = await fetch(`http://127.0.0.1:8000/api/order/${id}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				if (res.ok) {
					data.orders = data.orders.filter((o) => o.id !== id);
				} else {
					console.error('Error deleting order:', await res.text());
				}
			}

			// Очищуємо вибрані замовлення після видалення
			selectedOrders = [];
			// Знімаємо чекбокс у шапці таблиці
			isAllSelected = false;
		} catch (err) {
			console.error('Error deleting orders:', err);
		}
	}

	function toggleAllOrdersSelection(isSelected) {
		isAllSelected = isSelected;
		if (isSelected) {
			selectedOrders = data.orders.map(order => order.id); // Обираємо всі
		} else {
			selectedOrders = []; // Скидаємо вибір
		}
	}
</script>

<div style="text-align:center;">
    <h1 class="page-title adm-h1">Welcome to Admin Panel</h1>
	<h2 class="page-title">Orders List</h2>
    <div class="overflow-x-auto margin-top-20" style="text-align: left;">
		<button class="btn btn-active btn-primary" style="margin-left: 80px;;" on:click={deleteSelectedOrders}>
			<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M10 12V17" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M14 12V17" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M4 7H20" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span style="color: white;">Delete Selected Orders</span></button>
		<table class="table">
				<!-- head -->
				<thead>
					<tr>
						<th>
							<label>
								<input
									type="checkbox"
									class="checkbox"
									bind:checked={isAllSelected}
									on:change={(event) => toggleAllOrdersSelection(event.target.checked)}
								/>
							</label>
						</th>
						<th>ID</th>
						<th>Name</th>
						<th>Total</th>
						<th>Status</th>
						<th>Created</th>
						<th>Updated</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<!-- row 1 -->
					{#each data.orders as order}
						<tr>
							<th>
								<label>
									<input
										type="checkbox"
										class="checkbox"
										checked={selectedOrders.includes(order.id)}
										on:change={(event) => toggleOrderSelection(order.id, event.target.checked)}
									/>
								</label>
							</th>
							<td>{order.id}</td>
							<td>{order.name}</td>
							<td>{order.total}</td>
							<td>{order.status}</td>
							<td>{formatDate(order.created_at)}</td>
							<td>{formatDate(order.updated_at)}</td>
							<td>
								<button class="btn" on:click={() => goto(`/admin/order/${order.id}`)}>
									<svg class="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
										<title/>										
										<g id="Complete">										
										<g id="edit">										
										<g>										
										<path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="#0000FF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
										<polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="#0000FF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
										</g>										
										</g>										
										</g>										
									</svg>
								</button>
								<button class="btn" on:click={() => deleteOrder(order.id)}>
									<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M10 12V17" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M14 12V17" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M4 7H20" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#0000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
				<!-- foot -->
				<tfoot>
					<tr>
						<th></th>
						<th>ID</th>
						<th>Name</th>
						<th>Total</th>
						<th>Status</th>
						<th>Created</th>
						<th>Updated</th>
						<th></th>
					</tr>
				</tfoot>
			</table>
	</div>
</div>