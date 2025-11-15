import { defineStore } from "pinia";
import type { Exam } from "~/composables/useExams";

export interface CartItem {
  examId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  _hydrated: boolean;
}

export const useCartStore = defineStore("cart", {
  state: (): CartState => ({
    items: [],
    _hydrated: false,
  }),

  getters: {
    // Get exam details for cart items
    itemsWithDetails(state) {
      const exams = useState<Exam[]>("exams", () => []);
      return state.items
        .map((item) => {
          const exam = exams.value.find((e) => e.id === item.examId);
          return exam ? { ...item, exam } : null;
        })
        .filter(Boolean) as Array<CartItem & { exam: Exam }>;
    },

    // Calculate subtotal before discounts
    subtotal(state): number {
      const exams = useState<Exam[]>("exams", () => []);
      return state.items.reduce((sum, item) => {
        const exam = exams.value.find((e) => e.id === item.examId);
        return sum + (exam ? exam.price * item.quantity : 0);
      }, 0);
    },

    // Calculate discount amount based on bundle rule
    // Rule: Any 3 exams from 'Basic' category get 10% discount
    discountAmount(state): number {
      const exams = useState<Exam[]>("exams", () => []);

      // Collect all Basic exam prices (expanded by quantity)
      const basicExamPrices: number[] = [];

      state.items.forEach((item) => {
        const exam = exams.value.find((e) => e.id === item.examId);
        if (exam && exam.category === "Basic") {
          // Add the exam price for each quantity
          for (let i = 0; i < item.quantity; i++) {
            basicExamPrices.push(exam.price);
          }
        }
      });

      // Calculate how many sets of 3 we have
      const setsOfThree = Math.floor(basicExamPrices.length / 3);

      // Apply 10% discount to each set of 3
      // We'll apply discount to the first sets (order doesn't matter for total discount)
      let discountTotal = 0;
      for (let i = 0; i < setsOfThree; i++) {
        const setStart = i * 3;
        const setPrices = basicExamPrices.slice(setStart, setStart + 3);
        const setTotal = setPrices.reduce((sum, price) => sum + price, 0);
        discountTotal += setTotal * 0.1; // 10% discount on this set of 3
      }

      return discountTotal;
    },

    // Calculate final total after discount
    total(): number {
      return this.subtotal - this.discountAmount;
    },

    // Get discount breakdown for display
    discountBreakdown(state): { sets: number; totalDiscount: number } {
      const exams = useState<Exam[]>("exams", () => []);
      let totalBasicQuantity = 0;

      state.items.forEach((item) => {
        const exam = exams.value.find((e) => e.id === item.examId);
        if (exam && exam.category === "Basic") {
          totalBasicQuantity += item.quantity;
        }
      });

      const sets = Math.floor(totalBasicQuantity / 3);

      return {
        sets,
        totalDiscount: this.discountAmount,
      };
    },
  },

  actions: {
    // Initialize store and load from localStorage (SSR-safe)
    hydrate() {
      if (this._hydrated || typeof window === "undefined") {
        return;
      }

      try {
        const stored = localStorage.getItem("cart");
        if (stored) {
          const parsed = JSON.parse(stored);
          this.items = parsed.items || [];
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }

      this._hydrated = true;
    },

    // Save to localStorage (SSR-safe)
    persist() {
      if (typeof window === "undefined") {
        return;
      }

      try {
        localStorage.setItem("cart", JSON.stringify({ items: this.items }));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    },

    // Add item to cart
    addToCart(examId: string, quantity: number = 1) {
      this.hydrate();

      const existingItem = this.items.find((item) => item.examId === examId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({ examId, quantity });
      }

      this.persist();

      // Announce to screen readers
      if (typeof window !== "undefined") {
        const announcement = document.createElement("div");
        announcement.setAttribute("role", "status");
        announcement.setAttribute("aria-live", "polite");
        announcement.className = "sr-only";
        announcement.textContent = `Added ${quantity} item${
          quantity > 1 ? "s" : ""
        } to cart`;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    },

    // Remove item from cart
    removeFromCart(examId: string) {
      this.hydrate();
      this.items = this.items.filter((item) => item.examId !== examId);
      this.persist();

      // Announce to screen readers
      if (typeof window !== "undefined") {
        const announcement = document.createElement("div");
        announcement.setAttribute("role", "status");
        announcement.setAttribute("aria-live", "polite");
        announcement.className = "sr-only";
        announcement.textContent = "Item removed from cart";
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    },

    // Update item quantity
    updateQuantity(examId: string, quantity: number) {
      this.hydrate();

      if (quantity <= 0) {
        this.removeFromCart(examId);
        return;
      }

      const item = this.items.find((item) => item.examId === examId);
      if (item) {
        item.quantity = quantity;
        this.persist();
      }
    },

    // Clear entire cart
    clearCart() {
      this.items = [];
      this.persist();
    },
  },
});
