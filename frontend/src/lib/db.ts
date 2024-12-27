import { openDB, IDBPDatabase, deleteDB } from "idb";
import { CartItem } from "@/types/cart";

export interface ECommerceDB {
  auth: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      role: string;
      token: string;
    } | null;
  };
  cart: {
    key: string;
    value: { productId: string; quantity: number; timestamp: number }[];
  };
  wishlist: {
    key: string;
    value: string[];
  };
  products: {
    key: string;
    value: {
      id: string;
      name: string;
      price: number;
      description: string;
      category: string;
      stock: number;
      image: string;
    };
    indexes: { "by-category": string };
  };
}

export const STORES = {
  auth: "auth",
  cart: "cart",
  wishlist: "wishlist",
  products: "products",
} as const;

const DB_NAME = "ecommerce-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ECommerceDB>> | null = null;

export async function initDB(): Promise<IDBPDatabase<ECommerceDB>> {
  if (!dbPromise) {
    try {
      dbPromise = openDB<ECommerceDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create auth store if it doesn't exist
          if (!db.objectStoreNames.contains(STORES.auth)) {
            db.createObjectStore(STORES.auth);
          }

          // Create cart store if it doesn't exist
          if (!db.objectStoreNames.contains(STORES.cart)) {
            const cartStore = db.createObjectStore(STORES.cart);
            cartStore.put([], "items");
          }

          // Create wishlist store if it doesn't exist
          if (!db.objectStoreNames.contains(STORES.wishlist)) {
            const wishlistStore = db.createObjectStore(STORES.wishlist);
            wishlistStore.put([], "items");
          }

          // Create products store if it doesn't exist
          if (!db.objectStoreNames.contains(STORES.products)) {
            const store = db.createObjectStore(STORES.products, {
              keyPath: "id",
            });
            store.createIndex("by-category", "category");
          }
        },
        blocked() {
          console.warn(
            "Database upgrade blocked. Please close other tabs/windows."
          );
        },
        blocking() {
          console.warn(
            "This tab is blocking a database upgrade. Please reload."
          );
        },
        terminated() {
          console.error("Database connection terminated unexpectedly.");
          dbPromise = null;
        },
      });

      const db = await dbPromise;

      // Initialize empty arrays for cart and wishlist if they don't exist
      const tx = db.transaction([STORES.cart, STORES.wishlist], "readwrite");
      const cartStore = tx.objectStore(STORES.cart);
      const wishlistStore = tx.objectStore(STORES.wishlist);

      const [cartItems, wishlistItems] = await Promise.all([
        cartStore.get("items"),
        wishlistStore.get("items"),
      ]);

      if (!cartItems) {
        await cartStore.put([], "items");
      }
      if (!wishlistItems) {
        await wishlistStore.put([], "items");
      }

      await tx.done;
      return db;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      dbPromise = null;

      if (error instanceof Error && error.name === "NotFoundError") {
        console.log("Database not found, attempting to recreate");
        await deleteDB(DB_NAME);
        return initDB();
      }

      throw error;
    }
  }

  return dbPromise;
}

async function ensureDatabase(): Promise<IDBPDatabase<ECommerceDB> | null> {
  try {
    return await initDB();
  } catch (error) {
    console.error("Error ensuring database:", error);
    return null;
  }
}

export async function handleDatabaseError(error: unknown): Promise<boolean> {
  console.error("Database error:", error);

  if (error instanceof Error) {
    if (error.name === "NotFoundError" || error.name === "VersionError") {
      console.log("Attempting to reset database...");
      try {
        await deleteDB(DB_NAME);
        dbPromise = null;
        await initDB();
        return true;
      } catch (resetError) {
        console.error("Failed to reset database:", resetError);
      }
    }
  }
  return false;
}

export async function getCart(): Promise<
  { productId: string; quantity: number; timestamp: number }[]
> {
  const db = await ensureDatabase();
  if (!db) return [];

  try {
    const tx = db.transaction(STORES.cart, "readonly");
    const store = tx.objectStore(STORES.cart);
    const cart = await store.get("items");
    await tx.done;
    return cart || [];
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
}

export async function getWishlist(): Promise<string[]> {
  const db = await ensureDatabase();
  if (!db) return [];

  try {
    const tx = db.transaction(STORES.wishlist, "readonly");
    const store = tx.objectStore(STORES.wishlist);
    const wishlist = await store.get("items");
    await tx.done;
    return wishlist || [];
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return [];
  }
}

export async function getStoredAuth(): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
} | null> {
  const db = await ensureDatabase();
  if (!db) return null;

  try {
    const tx = db.transaction(STORES.auth, "readonly");
    const store = tx.objectStore(STORES.auth);
    const result = await store.get("user");
    await tx.done;
    return result || null;
  } catch (error) {
    console.error("Error getting stored auth:", error);
    return null;
  }
}

export const setCart = async (items: CartItem[]) => {
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

export async function setWishlist(items: string[]): Promise<void> {
  const db = await ensureDatabase();
  if (!db) return;

  try {
    const tx = db.transaction(STORES.wishlist, "readwrite");
    const store = tx.objectStore(STORES.wishlist);
    await store.put(items, "items");
    await tx.done;
  } catch (error) {
    console.error("Error setting wishlist:", error);
  }
}

export async function setStoredAuth(
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  } | null
): Promise<void> {
  const db = await ensureDatabase();
  if (!db) return;

  try {
    const tx = db.transaction(STORES.auth, "readwrite");
    const store = tx.objectStore(STORES.auth);
    if (user) {
      await store.put(user, "user");
      // Set both cookies and localStorage for compatibility
      document.cookie = `token=${user.token}; path=/`;
      document.cookie = `userRole=${user.role}; path=/`;
      localStorage.setItem("token", user.token);
    } else {
      await store.delete("user");
      // Clear both cookies and localStorage
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("token");
    }
    await tx.done;
  } catch (error) {
    console.error("Error setting stored auth:", error);
  }
}
