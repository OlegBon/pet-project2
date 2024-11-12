/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const response = await fetch('https://dummyjson.com/products');
	const { products } = await response.json();
	// console.log('products', products);
	return {
		products: products
	};
}
