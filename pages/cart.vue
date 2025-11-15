<template>
  <div class="container">
    <header class="header">
      <h1>Shopping Cart</h1>
      <nav>
        <NuxtLink to="/" class="btn btn-secondary">Back to Catalog</NuxtLink>
        <NuxtLink to="/cart" class="btn btn-primary" aria-current="page">
          Cart
          <span
            v-if="cartStore.items.length > 0"
            class="cart-badge"
            aria-label="Items in cart"
          >
            {{ cartStore.items.length }}
          </span>
        </NuxtLink>
      </nav>
    </header>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <h2>Your cart is empty</h2>
      <p>Start adding exams to your cart to see them here.</p>
      <NuxtLink to="/" class="btn btn-primary">Browse Catalog</NuxtLink>
    </div>

    <div v-else class="cart-layout">
      <main class="cart-items">
        <h2>Cart Items</h2>
        <div class="items-list">
          <article
            v-for="item in cartStore.itemsWithDetails"
            :key="item.examId"
            class="cart-item"
          >
            <div class="item-info">
              <h3 class="item-name">{{ item.exam.name }}</h3>
              <p class="item-category">Category: {{ item.exam.category }}</p>
              <div class="item-badges">
                <span v-if="item.exam.fastingRequired" class="badge"
                  >Fasting Required</span
                >
                <span
                  v-if="item.exam.resultTimeHours <= 24"
                  class="badge badge-success"
                  >24h Results</span
                >
              </div>
            </div>

            <div class="item-controls">
              <div class="quantity-control">
                <label :for="`quantity-${item.examId}`" class="sr-only"
                  >Quantity</label
                >
                <button
                  class="btn btn-secondary quantity-btn"
                  @click="decreaseQuantity(item.examId)"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  :id="`quantity-${item.examId}`"
                  :value="item.quantity"
                  type="number"
                  min="1"
                  class="quantity-input"
                  @change="
                    updateQuantity(
                      item.examId,
                      ($event.target as HTMLInputElement).value
                    )
                  "
                  aria-label="Quantity for {{ item.exam.name }}"
                />
                <button
                  class="btn btn-secondary quantity-btn"
                  @click="increaseQuantity(item.examId)"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div class="item-price">
                <p class="unit-price">${{ item.exam.price.toFixed(2) }} each</p>
                <p class="total-price">
                  ${{ (item.exam.price * item.quantity).toFixed(2) }}
                </p>
              </div>

              <button
                class="btn btn-danger"
                @click="removeItem(item.examId)"
                aria-label="Remove {{ item.exam.name }} from cart"
              >
                Remove
              </button>
            </div>
          </article>
        </div>
      </main>

      <aside class="checkout-summary">
        <h2>Checkout Summary</h2>

        <div class="summary-section">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${{ cartStore.subtotal.toFixed(2) }}</span>
          </div>

          <div
            v-if="cartStore.discountAmount > 0"
            class="summary-row discount-row"
          >
            <div class="discount-info">
              <span>Bundle Discount:</span>
              <span class="discount-details">
                {{ cartStore.discountBreakdown.sets }} set(s) of 3 Basic exams
              </span>
            </div>
            <span class="discount-amount"
              >-${{ cartStore.discountAmount.toFixed(2) }}</span
            >
          </div>

          <div class="summary-row total-row">
            <span>Total:</span>
            <span class="total-amount">${{ cartStore.total.toFixed(2) }}</span>
          </div>
        </div>

        <button
          class="btn btn-primary checkout-btn"
          aria-label="Proceed to checkout"
        >
          Proceed to Checkout
        </button>

        <button
          class="btn btn-secondary clear-cart-btn"
          @click="clearCart"
          aria-label="Clear cart"
        >
          Clear Cart
        </button>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore();

// Load exams data if not already loaded (needed for cart calculations)
await useExams();

// Ensure cart is hydrated
onMounted(() => {
  cartStore.hydrate();
});

const decreaseQuantity = (examId: string) => {
  const item = cartStore.items.find((i) => i.examId === examId);
  if (item) {
    cartStore.updateQuantity(examId, item.quantity - 1);
  }
};

const increaseQuantity = (examId: string) => {
  const item = cartStore.items.find((i) => i.examId === examId);
  if (item) {
    cartStore.updateQuantity(examId, item.quantity + 1);
  }
};

const updateQuantity = (examId: string, value: string) => {
  const quantity = parseInt(value, 10);
  if (!isNaN(quantity) && quantity > 0) {
    cartStore.updateQuantity(examId, quantity);
  }
};

const removeItem = (examId: string) => {
  cartStore.removeFromCart(examId);
};

const clearCart = () => {
  if (confirm("Are you sure you want to clear your cart?")) {
    cartStore.clearCart();
  }
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);

  & h1 {
    font-size: 2rem;
    color: var(--color-text);
  }

  & nav {
    display: flex;
    gap: var(--spacing-md);
    align-items: center;
  }
}

.cart {
  &-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 var(--spacing-xs);
    margin-left: var(--spacing-xs);
    background-color: var(--color-danger);
    color: white;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  &-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--spacing-xl);
  }

  &-item {
    background-color: var(--color-bg);
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }
}

.empty {
  &-cart {
    text-align: center;
    padding: var(--spacing-xl);
    background-color: var(--color-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);

    & h2 {
      margin-bottom: var(--spacing-md);
      color: var(--color-text);
    }

    & p {
      margin-bottom: var(--spacing-lg);
      color: var(--color-text-light);
    }
  }
}

.cart-items h2,
.checkout-summary h2 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.item {
  &-info {
    flex: 1;
  }

  &-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
    color: var(--color-text);
  }

  &-category {
    font-size: 0.875rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-sm);
  }

  &-badges {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  &-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  &-price {
    text-align: right;
    min-width: 120px;
  }
}

.quantity {
  &-control {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  &-btn {
    width: 2rem;
    height: 2rem;
    padding: 0;
    font-size: 1.25rem;
    line-height: 1;
  }

  &-input {
    width: 4rem;
    text-align: center;
    padding: var(--spacing-sm);
  }
}

.unit-price {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.total-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.summary {
  &-section {
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
  }

  &-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-md);
    font-size: 0.875rem;
  }
}

.discount {
  &-row {
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-xs);
  }

  &-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-xs);
  }

  &-details {
    font-size: 0.75rem;
    color: var(--color-text-light);
  }

  &-amount {
    color: var(--color-success);
    font-weight: 600;
  }
}

.total {
  &-row {
    font-size: 1.125rem;
    font-weight: 600;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border);
    margin-top: var(--spacing-md);
    margin-bottom: 0;
  }

  &-amount {
    font-size: 1.5rem;
    color: var(--color-primary);
  }
}

.checkout {
  &-summary {
    background-color: var(--color-bg);
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
    height: fit-content;
    position: sticky;
    top: var(--spacing-lg);
  }

  &-btn {
    width: 100%;
    padding: var(--spacing-md);
    font-size: 1rem;
    margin-bottom: var(--spacing-md);
  }
}

.clear-cart-btn {
  width: 100%;
}

@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .checkout-summary {
    position: static;
  }

  .cart-item {
    flex-direction: column;
  }

  .item-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
