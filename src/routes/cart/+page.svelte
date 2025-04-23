<script>
	import { onMount } from "svelte";
  import NovaPoshtaSelector from "../../components/NovaPoshtaSelector.svelte";
  import { createProductsCart } from "../../runes/cartProducts.svelte";
  import IMask from 'imask';

  const { cartProducts, totalPrice, deleteProductFromCart, clearCart, plusProductFromCart, minusProductFromCart } = createProductsCart();

    // Змінні для форми
	let showOrderForm = false;
	let name = '';
	let phone = '';
	let address = '';

  let deliveryMethod = "nposhta"; // Спосіб доставки (за замовчуванням - Нова Пошта)

  export let city = ""; // Текст у полі міста
  export let cities = []; // Список міст
  export let selectedCityRef = ""; // Збережений cityRef для вибраного міста

  export let branch = ""; // Текст у полі відділення
  export let branches = []; // Список відділень
  export let selectedBranchRef = ""; // Ref вибраного відділення

	function toggleOrderForm() {
		showOrderForm = true; // Показати форму і приховати кнопку Order
	}

  function inputPhoneMask(node) {
    const mask = IMask(node, {
    mask: '+{38} 000 000 00 00',
 			lazy: false // показує маску навіть до введення
    });

    mask.on('accept', () => {
 			phone = mask.unmaskedValue; // отримуємо: 380XXXXXXXXX
    });

 		// Фокус — встановлюємо курсор після +38
    function onFocus() {
      setTimeout(() => {
 				// Якщо тільки +38 — ставимо курсор після нього
        if (mask.value.startsWith('+38') && mask.unmaskedValue.length < 4) {
          mask.cursorPos = mask.value.length; // або просто 4
      }
      }, 0);
    }

    node.addEventListener('focus', onFocus);

    return {
      destroy() {
        node.removeEventListener('focus', onFocus);
        mask.destroy();
      }
    };
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
			address: deliveryMethod === 'courier' ? address : '',
			delivery_method: deliveryMethod,
      np_city: deliveryMethod === 'nposhta' ? city : '', // Якщо доставка Нова Пошта, передаємо місто
      np_city_ref: deliveryMethod === 'nposhta' ? selectedCityRef : '', // Якщо доставка Нова Пошта, передаємо cityRef
      np_branch: deliveryMethod === 'nposhta' ? branch : '', // Якщо доставка Нова Пошта, передаємо відділення
      np_branch_ref: deliveryMethod === 'nposhta' ? selectedBranchRef : '', // Якщо доставка Нова Пошта, передаємо branchRef
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
      city = '';
      branch = '';
      cities = []; // очищаємо список міст
      branches = []; // очищаємо список відділень
		} catch (error) {
			console.error('Error creating order:', error);			
		}
	}
</script>

<div style="text-align:center;">
    <h1 class="mt-10">Welcome to Cart Producrs</h1>
    {#if cartProducts.length === 0}
        <h2 class="mt-10">Your cart is empty. Please add some products.</h2>
    {/if}
    {#if cartProducts.length > 0}
        <h2 class="mt-10">Products in your cart: {cartProducts.length}</h2>
        <div class="overflow-x-auto mt-10">
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
                      class="btn" aria-label="Delete" on:click={() => deleteProductFromCart(index)}
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
          <button class="btn btn-primary mt-10" on:click={toggleOrderForm}> Order </button>
        {/if}
  
        <!-- Якщо showOrderForm, показуємо форму -->
        {#if showOrderForm}
          <!-- Блок форми-->
          <div class="q-mt-md" style="max-width: 300px; margin: 0 auto; text-align: left;">
            <form on:submit|preventDefault={submitOrder}>
              <div class="q-mb-md">
                <label for="name">Name:</label>
                <input
                  id="name"
                  type="text"
                  bind:value={name}
                  placeholder="Your name"
                  class="input input-bordered w-full"
                  required
                />
              </div>
              <div class="q-mb-md">
                <label for="phone">Phone number:</label>
                <input
                  id="phone"
                  type="text"
                  use:inputPhoneMask
                  placeholder="+38 ___ ___ __ __"
                  class="input input-bordered w-full"
                  required
                />
              </div>
  
              <!-- Вибір способу доставки -->
              <div class="q-mb-md mt-10">
                <label>Delivery method:</label>
                <div>
                  <label>
                    <input type="radio" bind:group={deliveryMethod} value="courier" />
                    Courier
                  </label>
                </div>
                <div>
                  <label>
                    <input type="radio" bind:group={deliveryMethod} value="nposhta" />
                    Nova Poshta
                  </label>
                </div>
              </div>
  
              <!-- Поля для Кур'єра -->
              {#if deliveryMethod === "courier"}
              <div class="q-mb-md">
                <label for="address">Address:</label>
                <input
                  id="address"
                  type="text"
                  bind:value={address}
                  placeholder="Your address"
                  class="input input-bordered w-full"
                  required
                />
              </div>
              {/if}
  
              <!-- Поля для Нової Пошти -->
              {#if deliveryMethod === "nposhta"}
              <NovaPoshtaSelector bind:city bind:cities bind:selectedCityRef bind:branch bind:branches bind:selectedBranchRef />
              {/if}
              <!-- Кнопка Submit -->
              <div style="margin-top: 1rem; text-align: center;">
                <button type="submit" class="btn btn-success"> Submit </button>
              </div>
            </form>
          </div>
        {/if}
    {/if}
</div>