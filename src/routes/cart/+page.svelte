<script>
    import { createProductsCart } from "../../runes/cartProducts.svelte";
    const { cartProducts, totalPrice, deleteProductFromCart, clearCart, plusProductFromCart, minusProductFromCart } = createProductsCart();

    // Змінні для форми
	let showOrderForm = false;
	let name = '';
	let phone = '';
	let address = '';

  let deliveryMethod = "nposhta"; // Спосіб доставки (за замовчуванням - Нова Пошта)

  let city = ""; // Текст у полі міста
  let cities = []; // Список міст
  let selectedCityRef = ""; // Збережений cityRef для вибраного міста

  let branch = ""; // Текст у полі відділення
  let branches = []; // Список відділень
  let selectedBranchRef = ""; // Ref вибраного відділення

	function toggleOrderForm() {
		showOrderForm = true; // Показати форму і приховати кнопку Order
	}

  async function fetchCities(event) {
    const searchValue = event.target.value;

    if (event.target.id === "city" && searchValue.length === 0) {
    // Очищення обраного відділення та списку відділень
      city = "";
      selectedCityRef = "";
      cities = [];
    }

    // Перевірка довжини введення
    if (searchValue.length < 3) {
      cities = []; // Очищаємо список міст, якщо введення менше 3 символів
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/nposhta/cities?findByCity=${encodeURIComponent(searchValue)}`
      );
      const data = await response.json();

      if (data.success) {
        cities = data.data; // Зберігаємо список міст
      } else {
        cities = []; // Очищаємо список, якщо запит не успішний
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      cities = [];
    }
  }

  function selectCity(selectedCity) {
    city = selectedCity.Description; // Підставляємо назву міста у прив'язаний інпут
    selectedCityRef = selectedCity.Ref; // Зберігаємо cityRef для подальшого використання
    cities = []; // Очищаємо список після вибору

    // console.log("Selected city:", selectedCity.Description);
    // console.log("City Ref:", selectedCity.Ref);
  }

  async function fetchBranches(event) {
    const searchValue = event.target.value;

    if (event.target.id === "branch" && searchValue.length === 0) {
    // Очищення обраного відділення та списку відділень
      branch = "";
      selectedBranchRef = "";
      branches = [];
    }

    // Формування параметра пошуку залежно від типу введення
    let apiUrl = "";
    if (/^\d+$/.test(searchValue)) {
      apiUrl = `http://127.0.0.1:8000/api/nposhta/branches?cityRef=${encodeURIComponent(selectedCityRef)}&findByBranch=${searchValue}`;
    } else if (searchValue.length >= 3) {
      apiUrl = `http://127.0.0.1:8000/api/nposhta/branches?cityRef=${encodeURIComponent(selectedCityRef)}&findByBranch=${encodeURIComponent(searchValue)}`;
    } else {
      branches = [];
      return;
    }

    try {
      // console.log("API URL:", apiUrl); // Логування URL
      const response = await fetch(apiUrl);
      const data = await response.json();

      // console.log("API Response:", data); // Логування відповіді

      if (data.success) {
        branches = data.data; // Зберігаємо список відділень
      } else {
        branches = []; // Очищаємо список, якщо запит не успішний
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      branches = [];
    }
  }

  function selectBranch(selectedBranch) {
    branch = `${selectedBranch.Description}, No. ${selectedBranch.Number}`; // Підставляємо вибране відділення у поле вводу
    selectedBranchRef = selectedBranch.Ref; // Зберігаємо Ref для подальшого використання
    branches = []; // Очищаємо список після вибору
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
        <button class="btn btn-primary q-mt-md" on:click={toggleOrderForm}> Order </button>
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
                bind:value={phone}
                placeholder="Your phone"
                class="input input-bordered w-full"
                required
              />
            </div>
            <!-- <div class="q-mb-md">
              <label for="address">Address:</label>
              <input
                id="address"
                type="text"
                bind:value={address}
                placeholder="Your address"
                class="input input-bordered w-full"
                required
              />
            </div> -->

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
            <div class="q-mb-md">
              <label for="city">City:</label>
              <input
                id="city"
                type="text"
                bind:value={city}
                on:input="{fetchCities}"
                placeholder="Your city"
                class="input input-bordered w-full"
                required
              />
              <!-- Список міст -->
              {#if cities.length > 0}
              <ul class="city-list">
                {#each cities as city}
                <li on:click={() => selectCity(city)}>
                  {city.Description}
                </li>
                {/each}
              </ul>
              {/if}
            </div>
            <div class="q-mb-md">
              <label for="branch">Branch:</label>
              <input
                id="branch"
                type="text"
                bind:value={branch}
                on:input="{fetchBranches}"
                placeholder="Your branch/address"
                class="input input-bordered w-full"
                required
              />
              <!-- Список відділень -->
              {#if branches.length > 0}
              <ul class="branch-list">
                {#each branches as branch}
                <li on:click={() => selectBranch(branch)}>
                  {branch.Description}, No. {branch.Number}
                </li>
                {/each}
              </ul>
              {/if}
            </div>
            {/if}
            <!-- Кнопка Submit -->
            <div style="margin-top: 1rem; text-align: center;">
              <button type="submit" class="btn btn-success"> Submit </button>
            </div>
          </form>
        </div>
      {/if}
</div>