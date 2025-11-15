<template>
  <div class="container">
    <header class="header">
      <h1>Blood Exam Catalog</h1>
      <nav>
        <NuxtLink to="/" class="btn btn-secondary" aria-current="page"
          >Catalog</NuxtLink
        >
        <NuxtLink to="/cart" class="btn btn-primary">
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

    <div class="catalog-layout">
      <aside class="filters-sidebar">
        <h2>Filters</h2>

        <!-- Category Filter -->
        <div class="filter-group">
          <label for="category-filter" class="filter-label">Category</label>
          <select
            id="category-filter"
            v-model="selectedCategories"
            multiple
            class="select"
            aria-label="Filter by category"
          >
            <option value="Basic">Basic</option>
            <option value="Advanced">Advanced</option>
            <option value="Specialized">Specialized</option>
          </select>
          <p class="filter-hint">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-group">
          <label for="price-min" class="filter-label">Price Range</label>
          <div class="price-inputs">
            <input
              id="price-min"
              :value="priceRange.min ?? ''"
              type="number"
              min="0"
              step="1"
              class="input"
              placeholder="Min"
              aria-label="Minimum price"
              @input="
                normalizeNumberInput($event, (val) => (priceRange.min = val))
              "
            />
            <span>to</span>
            <input
              id="price-max"
              :value="priceRange.max ?? ''"
              type="number"
              min="0"
              step="1"
              class="input"
              placeholder="Max"
              aria-label="Maximum price"
              @input="
                normalizeNumberInput($event, (val) => (priceRange.max = val))
              "
            />
          </div>
        </div>

        <!-- Fasting Required Filter -->
        <div class="filter-group">
          <label class="checkbox-label">
            <input
              id="fasting-filter"
              v-model="filters.fastingRequired"
              type="checkbox"
              class="checkbox"
            />
            <span>Fasting Required Only</span>
          </label>
        </div>

        <!-- Result Time Filter -->
        <div class="filter-group">
          <label for="result-time-filter" class="filter-label"
            >Maximum Result Time (hours)</label
          >
          <input
            id="result-time-filter"
            :value="filters.maxResultTime ?? ''"
            type="number"
            min="0"
            step="1"
            class="input"
            placeholder="e.g., 24"
            aria-label="Maximum result time in hours"
            @input="
              normalizeNumberInput(
                $event,
                (val) => (filters.maxResultTime = val)
              )
            "
          />
        </div>

        <button
          class="btn btn-secondary"
          @click="clearFilters"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </aside>

      <main class="catalog-main">
        <div class="catalog-header">
          <p class="results-count">
            Showing {{ filteredExams.length }} of {{ examsState.length }} exams
          </p>

          <div class="sort-controls">
            <label for="sort-select" class="sr-only">Sort by</label>
            <select
              id="sort-select"
              v-model="sortBy"
              class="select"
              aria-label="Sort exams"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popularity">Popularity</option>
              <option value="result-time">Result Time: Fastest First</option>
            </select>
          </div>
        </div>

        <div v-if="filteredExams.length === 0" class="empty-state">
          <p>No exams match your filters. Try adjusting your criteria.</p>
        </div>

        <div v-else class="exam-grid">
          <article v-for="exam in sortedExams" :key="exam.id" class="exam-card">
            <div class="exam-header">
              <h3 class="exam-name">{{ exam.name }}</h3>
              <div class="exam-badges">
                <span
                  v-if="exam.fastingRequired"
                  class="badge"
                  aria-label="Fasting required"
                >
                  Fasting Required
                </span>
                <span
                  v-if="exam.resultTimeHours <= 24"
                  class="badge badge-success"
                  aria-label="24 hour results"
                >
                  24h Results
                </span>
              </div>
            </div>

            <div class="exam-details">
              <p class="exam-category">Category: {{ exam.category }}</p>
              <p class="exam-result-time">
                Result Time: {{ exam.resultTimeHours }} hours
              </p>
              <p class="exam-popularity">
                Popularity: {{ exam.popularity }}/100
              </p>
            </div>

            <div class="exam-footer">
              <p class="exam-price">${{ exam.price.toFixed(2) }}</p>
              <button
                class="btn btn-primary"
                @click="addToCart(exam.id)"
                aria-label="Add {{ exam.name }} to cart"
              >
                Add to Cart
              </button>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Exam } from "~/composables/useExams";

const cartStore = useCartStore();

// Load exams data
await useExams();
const examsState = useState<Exam[]>("exams", () => []);

// Filter state
const selectedCategories = ref<string[]>([]);
const priceRange = ref({
  min: null as number | null,
  max: null as number | null,
});
const filters = ref({
  fastingRequired: false,
  maxResultTime: null as number | null,
});

// Sort state
const sortBy = ref("default");

// Computed: Filtered exams
const filteredExams = computed(() => {
  let result = [...examsState.value];

  // Category filter
  if (selectedCategories.value.length > 0) {
    result = result.filter((exam) =>
      selectedCategories.value.includes(exam.category)
    );
  }

  // Price range filter
  if (
    priceRange.value.min !== null &&
    priceRange.value.min !== undefined &&
    !isNaN(priceRange.value.min)
  ) {
    result = result.filter((exam) => exam.price >= priceRange.value.min!);
  }
  if (
    priceRange.value.max !== null &&
    priceRange.value.max !== undefined &&
    !isNaN(priceRange.value.max)
  ) {
    result = result.filter((exam) => exam.price <= priceRange.value.max!);
  }

  // Fasting required filter
  if (filters.value.fastingRequired) {
    result = result.filter((exam) => exam.fastingRequired);
  }

  // Result time filter
  if (
    filters.value.maxResultTime !== null &&
    filters.value.maxResultTime !== undefined &&
    !isNaN(filters.value.maxResultTime)
  ) {
    result = result.filter(
      (exam) => exam.resultTimeHours <= filters.value.maxResultTime!
    );
  }

  return result;
});

// Computed: Sorted exams
const sortedExams = computed(() => {
  const exams = [...filteredExams.value];

  switch (sortBy.value) {
    case "price-asc":
      return exams.sort((a, b) => a.price - b.price);
    case "price-desc":
      return exams.sort((a, b) => b.price - a.price);
    case "popularity":
      return exams.sort((a, b) => b.popularity - a.popularity);
    case "result-time":
      return exams.sort((a, b) => a.resultTimeHours - b.resultTimeHours);
    default:
      return exams;
  }
});

// Methods
const normalizeNumberInput = (
  event: Event,
  setValue: (value: number | null) => void
) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // If input is empty, set to null
  if (value === "" || value === null || value === undefined) {
    setValue(null);
  } else {
    const numValue = Number(value);
    // If not a valid number, set to null
    if (isNaN(numValue)) {
      setValue(null);
    } else {
      setValue(numValue);
    }
  }
};

const clearFilters = () => {
  selectedCategories.value = [];
  priceRange.value = { min: null, max: null };
  filters.value = {
    fastingRequired: false,
    maxResultTime: null,
  };
};

const addToCart = (examId: string) => {
  cartStore.addToCart(examId, 1);
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

.cart-badge {
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

.filters {
  &-sidebar {
    background-color: var(--color-bg);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
    height: fit-content;
    position: sticky;
    top: var(--spacing-lg);

    & h2 {
      font-size: 1.25rem;
      margin-bottom: var(--spacing-lg);
      color: var(--color-text);
    }
  }
}

.filter {
  &-group {
    margin-bottom: var(--spacing-lg);
  }

  &-label {
    display: block;
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text);
  }

  &-hint {
    font-size: 0.75rem;
    color: var(--color-text-light);
    margin-top: var(--spacing-xs);
  }
}

.price {
  &-inputs {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    & input {
      flex: 1;
    }
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.catalog {
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  &-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--spacing-xl);
  }
}

.results-count {
  color: var(--color-text-light);
}

.sort-controls {
  width: 200px;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
}

.exam {
  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }

  &-card {
    background-color: var(--color-bg);
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: var(--shadow-md);
    }
  }

  &-header {
    margin-bottom: var(--spacing-md);
  }

  &-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text);
  }

  &-badges {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  &-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border);
  }

  &-price {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  & .exam-details {
    flex: 1;
    margin-bottom: var(--spacing-md);
    font-size: 0.875rem;
    color: var(--color-text-light);

    & p {
      margin-bottom: var(--spacing-xs);
    }
  }
}

@media (max-width: 768px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
  }

  .exam-grid {
    grid-template-columns: 1fr;
  }
}
</style>
