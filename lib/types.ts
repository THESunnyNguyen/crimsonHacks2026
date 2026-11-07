export type StockGroupId = "raised" | "cake" | "specialty" | "filled_bars";
export type Level = "plenty" | "low" | "sold_out";
export type MenuItem = {
  id: string;
  name: string;
  category: StockGroupId | "deli";
  stockGroup: StockGroupId | null;
  price: number | null;
  options?: string[];
};
export type Inventory = {
  updatedAt: string;
  source: "photo" | "manual" | "casecam";
  groups: {
    groupId: StockGroupId;
    count: number;
    held: number;
    available: number;
    level: Level;
  }[];
  total: { available: number; level: Level };
  shopSoldOut: boolean;
  soldOutToggle: boolean;
};
export type Order = {
  id: string;
  customerName: string;
  phone?: string;
  pickupDate: string;
  pickupTime: string;
  items: { menuItemId: string; qty: number; option?: string }[];
  notes?: string;
  status: "new" | "ready" | "picked_up" | "cancelled";
  source: "staff_form" | "notes" | "web";
  createdAt: string;
  payment?: {
    method: "pay_at_pickup" | "stripe_sandbox";
    status: "unpaid" | "paid";
    amountTotal: number; // integer USD cents; demo subtotal, excludes tax
    currency: "usd";
    sessionId?: string;
  };
};
export type CountResult = {
  groups: { groupId: StockGroupId; count: number; confidence: number }[];
  total: number;
  notes: string;
  secondOpinion?: {
    model: string;
    groups: { groupId: StockGroupId; count: number }[];
    agrees: boolean;
  };
};
