const cartProducts = $state([]);

function saveToLocalStorage() {
	if (typeof window !== 'undefined') {
		localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
	}
}

export function createProductsCart() {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('cartProducts');
		if (saved) {
			try {
				cartProducts.splice(0, cartProducts.length, ...JSON.parse(saved));
			} catch (err) {
				console.error('Error parsing cart from localStorage:', err);
			}
		}
	}

	return {
		get cartProducts() {
			return cartProducts;
		},
		get countProductsInCart() {
			return cartProducts.reduce((acc, item) => acc + (item.count || 1), 0);
		},

		isProductInCart(productId) {
			// Логіка перевірки наявності товару в корзині
			return cartProducts.some((product) => product.id === productId);
		},

		clearCart() {
			cartProducts.splice(0, cartProducts.length);
			saveToLocalStorage();
		},

		totalPrice: (products) => {
			return products
				.reduce((totalPrice, { price, count }) => (totalPrice += price * count), 0)
				.toFixed(2);
		},

		deleteProductFromCart(index) {
			cartProducts.splice(index, 1);
			saveToLocalStorage();
		},
		addProductToCart(product) {
			const existing = cartProducts.find((p) => p.id === product.id);
			if (existing) {
				existing.count = (existing.count || 1) + (product.count || 1);
			} else {
				cartProducts.push({
					...product,
					count: product.count || 1
				});
			}
			saveToLocalStorage();
		},

		plusProductFromCart(index) {
			cartProducts[index].count++;
			saveToLocalStorage();
		},
		minusProductFromCart(index) {
			if (cartProducts[index].count > 1) {
				cartProducts[index].count--;
			} else {
				// Якщо count стає 0, видаляємо товар з Cart
				cartProducts.splice(index, 1);
			}
			saveToLocalStorage();
		}
	};
}
