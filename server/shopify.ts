const SHOPIFY_STORE = process.env.SHOPIFY_STORE_URL || "comic-crafter.myshopify.com";
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "";

const BASE_URL = `https://${SHOPIFY_STORE}/admin/api/2024-10`;

async function shopifyFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getProducts(limit = 50) {
  const data = await shopifyFetch(`/products.json?limit=${limit}&status=active`);
  return data.products;
}

export async function getProduct(id: number) {
  const data = await shopifyFetch(`/products/${id}.json`);
  return data.product;
}

export async function createProduct(product: {
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  variants?: Array<{
    price: string;
    sku?: string;
    inventory_management?: string;
    requires_shipping?: boolean;
  }>;
  images?: Array<{ src: string }>;
}) {
  const data = await shopifyFetch("/products.json", {
    method: "POST",
    body: JSON.stringify({ product }),
  });
  return data.product;
}

export async function updateProduct(id: number, updates: Record<string, any>) {
  const data = await shopifyFetch(`/products/${id}.json`, {
    method: "PUT",
    body: JSON.stringify({ product: { id, ...updates } }),
  });
  return data.product;
}

export async function deleteProduct(id: number) {
  await shopifyFetch(`/products/${id}.json`, { method: "DELETE" });
  return { success: true };
}

export async function getCollections() {
  const [custom, smart] = await Promise.all([
    shopifyFetch("/custom_collections.json"),
    shopifyFetch("/smart_collections.json"),
  ]);
  return [...(custom.custom_collections || []), ...(smart.smart_collections || [])];
}

export async function getOrders(limit = 50, status = "any") {
  const data = await shopifyFetch(`/orders.json?limit=${limit}&status=${status}`);
  return data.orders;
}

export async function getOrder(id: number) {
  const data = await shopifyFetch(`/orders/${id}.json`);
  return data.order;
}

export async function getCustomers(limit = 50) {
  const data = await shopifyFetch(`/customers.json?limit=${limit}`);
  return data.customers;
}

export async function getShopInfo() {
  const data = await shopifyFetch("/shop.json");
  return data.shop;
}

export async function createDraftOrder(order: {
  line_items: Array<{
    title: string;
    price: string;
    quantity: number;
  }>;
  customer?: { id: number };
  note?: string;
  tags?: string;
}) {
  const data = await shopifyFetch("/draft_orders.json", {
    method: "POST",
    body: JSON.stringify({ draft_order: order }),
  });
  return data.draft_order;
}

export async function getInventoryLevels(inventoryItemIds: number[]) {
  const ids = inventoryItemIds.join(",");
  const data = await shopifyFetch(`/inventory_levels.json?inventory_item_ids=${ids}`);
  return data.inventory_levels;
}

export async function createCustomer(customer: {
  first_name: string;
  last_name?: string;
  email: string;
  tags?: string;
  note?: string;
}) {
  const data = await shopifyFetch("/customers.json", {
    method: "POST",
    body: JSON.stringify({ customer }),
  });
  return data.customer;
}

export async function findCustomerByEmail(email: string) {
  try {
    const data = await shopifyFetch(`/customers/search.json?query=email:${encodeURIComponent(email)}`);
    return data.customers?.[0] || null;
  } catch {
    return null;
  }
}

export async function syncUserToShopify(email: string, name: string): Promise<string | null> {
  if (!isConfigured()) return null;
  try {
    let customer = await findCustomerByEmail(email);
    if (!customer) {
      const [firstName, ...rest] = name.split(" ");
      customer = await createCustomer({
        first_name: firstName || email.split("@")[0],
        last_name: rest.join(" ") || "",
        email,
        tags: "comic-crafter-app",
        note: "Registrado desde Comic Crafter App",
      });
    }
    return customer?.id?.toString() || null;
  } catch (err: any) {
    console.error("Shopify customer sync error:", err.message);
    return null;
  }
}

export function isConfigured(): boolean {
  return !!SHOPIFY_TOKEN && !!SHOPIFY_STORE;
}
