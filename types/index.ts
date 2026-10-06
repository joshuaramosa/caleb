export type UserRole = "ADMIN" | "ATENCION" | "COCINA" | "REPARTIDOR";

export type PaymentMethod = "YAPE" | "CONTRA_ENTREGA";

export type PaymentStatus = "PENDIENTE" | "VERIFICADO" | "RECHAZADO";

export type OrderStatus =
  | "NUEVO"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "LISTO"
  | "ASIGNADO"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export type DeliveryStatus = "PENDIENTE" | "ASIGNADO" | "EN_CAMINO" | "ENTREGADO";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  category?: Category;
};

export type BusinessSettings = {
  id: number;
  business_name: string;
  whatsapp: string | null;
  yape_number: string | null;
  yape_holder: string | null;
  delivery_fee: number;
  open_time: string; // "HH:mm"
  close_time: string; // "HH:mm"
  is_open: boolean;
  logo_url: string | null;
  qr_url: string | null;
  store_lat: number | null;
  store_lng: number | null;
};

export type Customer = {
  id: string;
  full_name: string;
  phone: string;
  is_blocked: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
  blocked_debt: number;
  created_at: string;
};

export type Address = {
  id: string;
  customer_id: string;
  label: string;
  address: string;
  reference: string | null;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  notes: string | null;
};

export type Payment = {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  proof_url: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
};

export type DeliveryAssignment = {
  id: string;
  order_id: string;
  delivery_user_id: string;
  status: DeliveryStatus;
  assigned_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  created_at: string;
  last_lat: number | null;
  last_lng: number | null;
  location_updated_at: string | null;
  delivery_user?: StaffUser;
};

export type Promotion = {
  id: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type StaffUser = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

export type OrderWithDetails = {
  id: string;
  order_number: number;
  customer_id: string;
  address_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  tracking_token: string;
  created_at: string;
  updated_at: string;
  customer: Customer;
  address: Address;
  items: OrderItem[];
  payment?: Payment;
  delivery_assignment?: DeliveryAssignment;
};
