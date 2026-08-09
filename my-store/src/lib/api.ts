// ==================== 🌐 أنواع مشتركة ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== 🛡️ دالة fetch API موحدة وآمنة (مضادة للانهيار) ====================
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // ضروري لإرسال كوكيز المصادقة (NextAuth)
      ...options,
    });

    // 🔍 الخطوة 1: التحقق من نوع المحتوى قبل محاولة تحليله كـ JSON
    const contentType = res.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      // إذا كان الرد HTML (مثل صفحة 404 أو 500 أو إعادة توجيه)، نلتقطه كنص عادي
      const textResponse = await res.text();
      console.error(
        `[API Error] Expected JSON from ${endpoint}, but got: ${contentType || "unknown"}`
      );
      console.error(`[API Response Snippet]:`, textResponse.substring(0, 300));

      return {
        success: false,
        error: `فشل الخادم في إرجاع بيانات صحيحة (خطأ ${res.status}). تأكد من وجود ملف API ومساره صحيح.`,
      };
    }

    // 🔍 الخطوة 2: الآن آمن تماماً لتحليله كـ JSON
    const json = await res.json();

    // 🔍 الخطوة 3: التحقق من حالة الاستجابة (HTTP Status)
    if (!res.ok) {
      return {
        success: false,
        error: json.error || json.message || "حدث خطأ غير متوقع في الخادم",
      };
    }

    return {
      success: true,
      data: json.data as T,
    };
  } catch (error: any) {
    console.error(`[API Fetch Network Error] ${endpoint}:`, error.message);
    return {
      success: false,
      error: "فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت أو أن السيرفر يعمل.",
    };
  }
}

// ==================== 👤 دوال المستخدم (User) ====================
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
}

export const userAPI = {
  getProfile: () => fetchAPI<UserProfile>("/api/users/profile"),
  updateProfile: (data: UpdateProfileData) =>
    fetchAPI<UserProfile>("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    fetchAPI("/api/users/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ==================== 📦 دوال الطلبات (Orders) ====================
export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: number | string;
  createdAt: string;
  items: OrderItem[];
  trackingNumber?: string | null;
}

// نوع خاص لاستجابة الطلبات ليتطابق مع واجهة المستخدم
export interface OrdersResponse {
  orders: Order[];
}

export const ordersAPI = {
  // جلب جميع الطلبات (يدعم الفلترة الاختيارية)
  getOrders: (status?: string) => {
    const params = status ? `?status=${status}` : "";
    return fetchAPI<OrdersResponse>(`/api/orders${params}`);
  },

  // جلب تفاصيل طلب محدد
  getOrder: (id: string) => fetchAPI<Order>(`/api/orders/${id}`),

  // إنشاء طلب جديد
  createOrder: (data: unknown) =>
    fetchAPI<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ==================== ❤️ دوال الأمنيات (Wishlist) ====================
export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export interface WishlistResponse {
  items: WishlistItem[];
}

export const wishlistAPI = {
  getWishlist: () => fetchAPI<WishlistResponse>("/api/wishlist"),
  toggleWishlist: (productId: string) =>
    fetchAPI("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
};

// ==================== 📍 دوال العناوين (Addresses) ====================
export interface Address {
  id: string;
  label: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export const addressesAPI = {
  getAddresses: () => fetchAPI<Address[]>("/api/addresses"),
  addAddress: (data: Partial<Address>) =>
    fetchAPI<Address>("/api/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAddress: (id: string, data: Partial<Address>) =>
    fetchAPI<Address>(`/api/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteAddress: (id: string) =>
    fetchAPI(`/api/addresses/${id}`, {
      method: "DELETE",
    }),
};

// ==================== 🛒 دوال السلة (Cart) ====================
export const cartAPI = {
  getCart: () => fetchAPI("/api/cart"),
  addToCart: (productId: string, quantity: number) =>
    fetchAPI("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCartItem: (itemId: string, quantity: number) =>
    fetchAPI(`/api/cart/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  clearCart: () =>
    fetchAPI("/api/cart", {
      method: "DELETE",
    }),
};