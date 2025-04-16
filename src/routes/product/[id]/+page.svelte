<script>
    import { onMount } from 'svelte';
	import { page } from '$app/stores';
    import { createProductsCart } from "../../../runes/cartProducts.svelte";
  	import { get } from 'svelte/store';
	import { getCurrentProduct } from '../../../runes/productStore.svelte';
	const { addProductToCart } = createProductsCart();

    let product = {};

    // Для перевірки наявності продукту в корзині
	const cart = createProductsCart(); // Ініціалізуємо корзину
	// export let product = {}; // Продукт передається в компонент

    onMount(async () => {
    const { id } = $page.params;
    const currentProduct = getCurrentProduct();

    if (currentProduct && currentProduct.id === parseInt(id)) {
      product = currentProduct;
    } else {
      const response = await fetch(`http://127.0.0.1:8000/api/product/${id}`);
      product = await response.json();
    }
  });
</script>
<div>
    <h1 class="title-product">{product.title}</h1>
    <div class="carousel-center">
    <div class="carousel w-96">
        
            {#each product.images as image, index}
                <div id={index + 1} class="carousel-item h-96">
                    <img src={image.url} class="w-full" alt={image.title} />
                </div>
            {/each}
      </div>
    </div>
      <div class="flex w-full justify-center gap-2 py-2">
        {#each product.images as image, index}
            <a href={`#${index + 1}`} class="btn btn-xs">{index + 1}</a>
        {/each}
      </div>
      <div class="flex flex-col gap-2 product-txt">
        {#if product.product_quantity >= 100}
          <span class="badge badge-primary badge-sm">In stock</span>
        {/if}
        {#if product.product_quantity < 100 && product.product_quantity > 10}
          <span class="badge badge-warning badge-sm">Still in stock</span>
        {/if}
        {#if product.product_quantity <= 0}
          <span class="badge badge-success badge-sm">Out of stock</span>
        {/if}
        {#if product.product_quantity > 0 && product.product_quantity <= 10}
          <span class="badge badge-info badge-sm">Only {product.product_quantity} left</span>
        {/if}	
        <p><span>Description:</span> {product.description}</p>
        <p><span>Price:</span> {product.price} $</p>
        <p><span>Warranty:</span> {product.warrantyInformation}</p>
        <div style="width: 100px; margin: 0 auto;">
          {#if product.product_quantity <= 0}
          <button 
          class="btn btn-disabled"
          aria-label="Add product to cart"						
          >
            <svg
              class="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                stroke="#FFBE00"
                stroke-width="1.5"
              />
              <path
                d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                stroke="#FFBE00"
                stroke-width="1.5"
              />
              <path
                d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
                stroke="#FFBE00"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
          {:else if cart.isProductInCart(product.id)}
            <button 
            class="btn"
            aria-label="Add product to cart"
            onclick={() => {
              goToCart();
              }}
            >
              <svg
                class="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                />
                <path
                  d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                />
                <path
                  d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
                  stroke="#FFFFFF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          {:else}
            <button 
              class="btn"
              aria-label="Add product to cart"
              onclick={() => {
                addProductToCart(product);
                }}
            >
              <svg
                class="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                  stroke="#0000FF"
                  stroke-width="1.5"
                />
                <path
                  d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                  stroke="#0000FF"
                  stroke-width="1.5"
                />
                <path
                  d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
                  stroke="#0000FF"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          {/if}		
        </div>
      </div>
</div>
