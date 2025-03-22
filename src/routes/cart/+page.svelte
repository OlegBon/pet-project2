<script>
    import { createProductsCart } from "../../runes/cartProducts.svelte";
    const { cartProducts, totalPrice, deleteProductFromCart, clearCart, plusProductFromCart, minusProductFromCart } = createProductsCart();

    // Змінні для форми
	let showOrderForm = false;
	let name = '';
	let phone = '';
	let address = '';

	function toggleOrderForm() {
		showOrderForm = true; // Показати форму і приховати кнопку Order
	}

	async function submitOrder() {
		// Збираємо дані форми
		const items = cartProducts.map((p) => ({
			id: p.id,
			title: p.title,
			price: p.price,
			count: p.count
		}));

		const total = totalPrice(cartProducts);

		// Створюємо об'єкт для відправлення
		const orderData = {
			name,
			phone,
			address,
			items,
			total
		};

		console.log('Order submitted:', orderData);

		try {
			// Відправляємо POST-запит на бекенд (Laravel)
			const res = await fetch('http://127.0.0.1:8000/api/order-create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(orderData)
			});

			if (!res.ok) {
				throw new Error(`Server error: ${res.status}`);
			}

			const result = await res.json();
			console.log('Order created successfully:', result);

			clearCart(); // кошик очищено, localStorage оновлено

			// Прикриваємо форму й очищаємо поля
			showOrderForm = false;
			name = '';
			phone = '';
			address = '';
		} catch (error) {
			console.error('Error creating order:', error);			
		}
	}
</script>

<div style="text-align:center;">
    <h1>Welcome to Cart Producrs</h1>
    <div class="overflow-x-auto">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" class="checkbox" />
                </label>
              </th>
              <th>Product	</th>
              <th>Description</th>
              <th>Price</th>
              <th style="width: 128px;">Count</th>
              <!-- Додали стовпець для кількості -->
              <th></th>
              <!-- Стовпець для кнопки видалення -->
            </tr>
          </thead>
          <tbody>
            {#each cartProducts as product, index}
            <tr>
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" />
                  </label>
                </th>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="mask mask-squircle h-12 w-12">
                        <img
                          src={product.thumbnail}
                          alt={product.title} />
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">{product.title}</div>
                      <div class="text-sm opacity-50">{product.category}</div>
                    </div>
                  </div>
                </td>
                <td>
                    {product.description}
                  <br />
                  <span class="badge badge-ghost badge-sm">{product.warrantyInformation}</span>
                </td>

                <td><strong>{product.price} $</strong></td>
    
                <td>
                  <button class="btn btn-xs" on:click={() => minusProductFromCart(index)}>-</button>
                  <span class="mx-2">{product.count}</span>
                  <button class="btn btn-xs" on:click={() => plusProductFromCart(index)}>+</button>
                </td>
    
                <th>
                    <button 
                    class="btn" on:click={() => deleteProductFromCart(index)}
                >
                <svg class="v-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 7H20" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 7V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V7" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#ff0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                </th>
              </tr>
            {/each}
          </tbody>
          <!-- foot -->
          <tfoot>
            <tr>
              <th></th>
              <th>Product	</th>
              <th>Description</th>
              <th>Price</th>
              <th>Count</th>
              <!-- Додали стовпець для кількості -->
              <th></th>
              <!-- Стовпець для кнопки видалення -->
            </tr>
            <tr>
              <th></th>
              <th></th>              
              <th class="text-right"><strong>Total</strong></th>
              <th><strong>${totalPrice(cartProducts)}</strong></th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Кнопка "Order" (показуємо тільки якщо showOrderForm == false і cartProducts.length > 0) -->
	    {#if !showOrderForm && cartProducts.length > 0}
        <button class="btn btn-primary q-mt-md" on:click={toggleOrderForm}> Order </button>
      {/if}

      <!-- Якщо showOrderForm, показуємо форму -->
      {#if showOrderForm}
        <!-- Блок форми-->
        <div class="q-mt-md" style="max-width: 300px; margin: 0 auto; text-align: left;">
          <form on:submit|preventDefault={submitOrder}>
            <div class="q-mb-md">
              <label>Name:</label>
              <input
                type="text"
                bind:value={name}
                placeholder="Your name"
                class="input input-bordered w-full"
                required
              />
            </div>
            <div class="q-mb-md">
              <label>Phone number:</label>
              <input
                type="text"
                bind:value={phone}
                placeholder="Your phone"
                class="input input-bordered w-full"
                required
              />
            </div>
            <div class="q-mb-md">
              <label>Address:</label>
              <input
                type="text"
                bind:value={address}
                placeholder="Your address"
                class="input input-bordered w-full"
                required
              />
            </div>
            <!-- Кнопка Submit -->
            <div style="margin-top: 1rem; text-align: center;">
              <button type="submit" class="btn btn-success"> Submit </button>
            </div>
          </form>
        </div>
      {/if}
</div>