let currentProduct = $state([]);

export function setCurrentProduct(product) {
	currentProduct = product;
}

export function getCurrentProduct() {
	return currentProduct;
}
