<script>
//     let data = { orders: [] };

// let loading = false;
// let isOpenModal = false;
// let searchValue = '';

// function fetchOrders(url) {
//     loading = true;
//     fetch(url)
//         .then((res) => res.json())
//         .then((enterData) => {
//             if (!enterData.length) {
//                 isOpenModal = true;
//             } else {
//                 data.orders = enterData;
//             }
//             loading = false;
//             // console.log('data.orders:', data.orders);
//         });            
// }

// $: if (searchValue === '') {
//     fetchOrders('http://127.0.0.1:8000/api/orders');
// }
    
    import { onMount } from 'svelte';
 	import { goto } from '$app/navigation';
 
 	let orders = [];
 
 	onMount(async () => {
 		const res = await fetch('http://127.0.0.1:8000/api/orders');
 		orders = await res.json();
 	});
 
 	function editOrder(id) {
 		goto(`/admin/order/${id}`);
 	}
 
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
 				orders = orders.filter((o) => o.id !== id);
 			} else {
 				console.error('Error deleting order:', await res.text());
 			}
 		} catch (err) {
 			console.error('Error deleting order:', err);
 		}
 	}
</script>

<div style="text-align:center;">
    <!-- <h1>Welcome to Admin Panel</h1>
    <div style="text-align:left;">
        {#each data.orders as order, index}
            <div class="card" style="margin: 10px;">
                <div class="card-body">
                    <h2>Order: {order.id}</h2>
                    <p>Name: {order.name}, Phone: {order.phone}, Address: {order.address}</p>
                    <p>Details:</p>
                    {#each order.items as item}
                        <p>{item.title} - {item.price} x {item.count}</p>
                    {/each}
                    <p>Total: {order.total}</p>
                </div>
            </div>
         {/each}
    </div> -->

    <h3 class="page-title">Orders List</h3>
 {#if orders.length === 0}
 	<p>No orders found.</p>
 {:else}
 	<table class="orders-table">
 		<thead>
 			<tr>
 				<th>ID</th>
 				<th>Customer Name</th>
 				<th>Total</th>
 				<th>Status</th>
 				<th>Actions</th>
 			</tr>
 		</thead>
 		<tbody>
 			{#each orders as order}
 				<tr>
 					<td>{order.id}</td>
 					<td>{order.name}</td>
 					<td>{order.total}</td>
 					<td>{order.status}</td>
 					<td>
 						<button class="edit-btn" on:click={() => editOrder(order.id)}>Edit</button>
 						<button class="delete-btn" on:click={() => deleteOrder(order.id)}>Delete</button>
 					</td>
 				</tr>
 			{/each}
 		</tbody>
 	</table>
 {/if}
</div>