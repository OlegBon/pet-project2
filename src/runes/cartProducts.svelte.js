const cartProducts = $state([]);

const calculateTotalPrice = () => {
	return cartProducts
		.reduce((totalPrice, { price, count }) => (totalPrice += price * count), 0)
		.toFixed(2);
};

export function createProductsCart() {
	let totalPrice = calculateTotalPrice();
	return {
		get cartProducts() {
			return cartProducts;
		},
		get countProductsInCart() {
			// return cartProducts.length;
			return cartProducts.reduce((total, product) => total + product.count, 0);
		},
		get totalPrice() {
			// return cartProducts.reduce((totalPrice, { price }) => (totalPrice += price), 0).toFixed(2);
			// return cartProducts
			// 	.reduce((totalPrice, { price, count }) => (totalPrice += price * count), 0)
			// 	.toFixed(2);
			return totalPrice;
		},
		// deleteProductFromCart: (index) => cartProducts.splice(index, 1),
		deleteProductFromCart: (index) => {
			const product = cartProducts[index];
			if (product.count > 1) {
				product.count--;
			} else {
				cartProducts.splice(index, 1);
			}
			totalPrice = calculateTotalPrice();
		},
		// addProductToCart: (product) => cartProducts.push(product)
		addProductToCart: (product) => {
			const existingProduct = cartProducts.find((p) => p.id === product.id);
			if (existingProduct) {
				existingProduct.count++;
			} else {
				product.count = 1;
				cartProducts.push(product);
			}
			totalPrice = calculateTotalPrice();
		}
	};
}

// Створення екземпляру корзини
const cartInstance = createProductsCart();

// Експорт функцій для використання в інших частинах програми
export const { addProductToCart, deleteProductFromCart, totalPrice, countProductsInCart } =
	cartInstance;
