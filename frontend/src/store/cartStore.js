import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  totalCount: 0,
  totalPrice: 0,

  // 加载购物车
  loadCart: (items) => {
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ items, totalCount: total, totalPrice });
  },

  // 添加商品
  addItem: (product) => {
    const { items } = get();
    const existing = items.find((item) => item.productId === product.id);

    if (existing) {
      set({
        items: items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        totalCount: get().totalCount + 1,
      });
    } else {
      set({
        items: [...items, { productId: product.id, productName: product.name, price: product.price, quantity: 1 }],
        totalCount: get().totalCount + 1,
      });
    }
  },

  // 更新数量
  updateQuantity: (productId, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      set({
        items: items.filter((item) => item.productId !== productId),
        totalCount: get().totalCount - items.find((i) => i.productId === productId)?.quantity || 0,
      });
    } else {
      set({
        items: items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      });
    }
  },

  // 清空购物车
  clear: () => {
    set({ items: [], totalCount: 0, totalPrice: 0 });
  },
}));

export default useCartStore;
