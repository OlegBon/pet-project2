const cartProducts = $state([]);

export function createProductsCart() {
	return {
		get cartProducts() {
			return cartProducts;
		},
		get countProductsInCart() {
			return cartProducts.reduce((total, product) => total + product.count, 0);
		},
		totalPrice: (products) => {
			return products
				.reduce((totalPrice, { price, count }) => (totalPrice += price * count), 0)
				.toFixed(2);
		},
		deleteProductFromCart: (index) => {
			const product = cartProducts[index];
			if (product.count > 1) {
				product.count--;
			} else {
				cartProducts.splice(index, 1);
			}
		},
		addProductToCart: (product) => {
			const existingProduct = cartProducts.find((p) => p.id === product.id);
			if (existingProduct) {
				existingProduct.count++;
			} else {
				product.count = 1;
				cartProducts.push(product);
			}
		}
	};
}
