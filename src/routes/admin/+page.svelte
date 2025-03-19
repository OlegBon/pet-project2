<script>
    let data = { orders: [] };

    let loading = false;
    let isOpenModal = false;
	let searchValue = '';

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
                // console.log('data.orders:', data.orders);
			});            
	}

	$: if (searchValue === '') {
		fetchOrders('http://127.0.0.1:8000/api/orders');
	}
</script>

<div style="text-align:center;">
    <h1>Welcome to Admin Panel</h1>
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
    </div>
</div>