import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import type { Exam } from "~/composables/useExams";
import { stateStorage } from "../../vitest.setup";

// Mock #app which provides useState via auto-imports
vi.mock("#app", () => ({
  useState: <T>(key: string, init?: () => T) => {
    if (!stateStorage.has(key)) {
      stateStorage.set(key, { value: init ? init() : null });
    }
    return stateStorage.get(key);
  },
}));

// Import store after mocks are set up
import { useCartStore } from "../cart";

// Mock exam data
const mockExams: Exam[] = [
  {
    id: "exam-001",
    name: "Complete Blood Count",
    category: "Basic",
    price: 45.0,
    fastingRequired: false,
    resultTimeHours: 24,
    popularity: 95,
    tags: ["blood"],
  },
  {
    id: "exam-002",
    name: "Basic Metabolic Panel",
    category: "Basic",
    price: 55.0,
    fastingRequired: true,
    resultTimeHours: 24,
    popularity: 90,
    tags: ["metabolic"],
  },
  {
    id: "exam-003",
    name: "Lipid Panel",
    category: "Basic",
    price: 60.0,
    fastingRequired: true,
    resultTimeHours: 48,
    popularity: 85,
    tags: ["cholesterol"],
  },
  {
    id: "exam-004",
    name: "Advanced Thyroid Panel",
    category: "Advanced",
    price: 120.0,
    fastingRequired: false,
    resultTimeHours: 48,
    popularity: 70,
    tags: ["thyroid", "hormone"],
  },
  {
    id: "exam-005",
    name: "Comprehensive Metabolic Panel",
    category: "Advanced",
    price: 150.0,
    fastingRequired: true,
    resultTimeHours: 72,
    popularity: 65,
    tags: ["metabolic", "comprehensive"],
  },
];

// Declare useState type for TypeScript (it's mocked from #app)
declare function useState<T>(key: string, init?: () => T): { value: T };

describe("Cart Store - Bundle Discount Calculation", () => {
  beforeEach(() => {
    // Clear state storage before each test
    stateStorage.clear();
    setActivePinia(createPinia());
    // Set up mock exams in state using useState (which is mocked from #app)
    const examsState = useState<Exam[]>("exams", () => []);
    examsState.value = [...mockExams];
  });

  it("should apply 10% discount to exactly 3 Basic category exams", () => {
    const store = useCartStore();

    // Add 3 Basic exams
    store.addToCart("exam-001", 1); // $45
    store.addToCart("exam-002", 1); // $55
    store.addToCart("exam-003", 1); // $60

    // Subtotal: $45 + $55 + $60 = $160
    // Discount: 10% of $160 = $16
    // Total: $160 - $16 = $144

    expect(store.subtotal).toBe(160.0);
    expect(store.discountAmount).toBe(16.0);
    expect(store.total).toBe(144.0);
  });

  it("should apply discount to only complete sets of 3 (5 exams = 1 discount on 3, 2 at full price)", () => {
    const store = useCartStore();

    // Add 5 Basic exams
    store.addToCart("exam-001", 2); // 2 × $45 = $90
    store.addToCart("exam-002", 2); // 2 × $55 = $110
    store.addToCart("exam-003", 1); // 1 × $60 = $60

    // Subtotal: $90 + $110 + $60 = $260
    // Discount: 1 set of 3 gets 10% discount
    // Prices array: [$45, $45, $55, $55, $60]
    // Set 1 (first 3): ($45 + $45 + $55) × 10% = $14.50
    // Remaining 2 exams at full price (no discount)
    // Total discount: $14.50
    // Total: $260 - $14.50 = $245.50

    expect(store.subtotal).toBe(260.0);
    expect(store.discountAmount).toBe(14.5);
    expect(store.total).toBe(245.5);
  });

  it("should apply discount to 3 Basic exams and ignore 2 non-Basic exams", () => {
    const store = useCartStore();

    // Add 3 Basic exams
    store.addToCart("exam-001", 1); // $45
    store.addToCart("exam-002", 1); // $55
    store.addToCart("exam-003", 1); // $60
    // Add 2 non-Basic exams
    store.addToCart("exam-004", 1); // $120 (Advanced)
    store.addToCart("exam-005", 1); // $150 (Advanced)

    // Subtotal: $45 + $55 + $60 + $120 + $150 = $430
    // Discount: 10% on the 3 Basic exams = ($45 + $55 + $60) × 10% = $16
    // Total: $430 - $16 = $414

    expect(store.subtotal).toBe(430.0);
    expect(store.discountAmount).toBe(16.0);
    expect(store.total).toBe(414.0);
  });

  it("should apply discount to 5 Basic exams and ignore 2 non-Basic exams", () => {
    const store = useCartStore();

    // Add 5 Basic exams
    store.addToCart("exam-001", 2); // 2 × $45 = $90
    store.addToCart("exam-002", 2); // 2 × $55 = $110
    store.addToCart("exam-003", 1); // 1 × $60 = $60
    // Add 2 non-Basic exams
    store.addToCart("exam-004", 1); // $120 (Advanced)
    store.addToCart("exam-005", 1); // $150 (Advanced)

    // Subtotal: $90 + $110 + $60 + $120 + $150 = $530
    // Discount: 1 set of 3 Basic exams gets 10% discount
    // Prices array: [$45, $45, $55, $55, $60]
    // Set 1 (first 3): ($45 + $45 + $55) × 10% = $14.50
    // Remaining 2 Basic exams at full price (no discount)
    // Non-Basic exams don't get discount
    // Total discount: $14.50
    // Total: $530 - $14.50 = $515.50

    expect(store.subtotal).toBe(530.0);
    expect(store.discountAmount).toBe(14.5);
    expect(store.total).toBe(515.5);
  });
});
