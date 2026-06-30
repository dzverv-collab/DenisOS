export type DealStatus = "Новый" | "Ко мне едет" | "В доставке" | "На руках" | "У мастера" | "Готов" | "Выставлен" | "Продан" | "Возврат";

export type DealPhoto = {
  id: string;
  url: string;
  name: string;
  isMain?: boolean;
};

export type StatusHistoryEntry = {
  id: string;
  // В истории храним не только статусы телефона, но и события доставки.
  // Например: "Доставка: Заказ оформлен", "Доставка: Едет обратно", "Забрал возврат".
  status: string;
  date: string;
};

export type Deal = {
  id: string;
  model: string;
  memory: string;
  color?: string;
  status: DealStatus;
  source: string;
  condition?: string;
  imei?: string;
  serial?: string;
  battery?: number | null;
  sellerName?: string;
  sellerContact?: string;
  salePlatform?: string;
  boughtFor: number;
  delivery: number;
  repair: number;
  otherExpenses: number;
  plannedSale: number;
  soldFor?: number | null;
  purchaseDate: string;
  listedDate?: string | null;
  saleDate?: string | null;
  deliveryMethod?: string;
  trackingNumber?: string;
  repairStatus?: string;
  repairNote?: string;
  note?: string;
  photos?: DealPhoto[];
  statusHistory?: StatusHistoryEntry[];
};

export type ContentStatus = "Идея" | "Снято" | "Монтаж" | "Запланировано" | "Опубликовано";

export type ContentCard = {
  id: string;
  title: string;
  hook: string;
  status: ContentStatus;
  views: number;
};

export type Goal = {
  id: string;
  title: string;
  type: string;
  current: number;
  target: number;
  unit: string;
};

export type HabitLog = {
  date: string;
  sport: boolean;
  content: boolean;
  learning: boolean;
  sleep: boolean;
  plan: boolean;
};

export type LearningEntry = {
  id: string;
  date: string;
  title: string;
  hours: number;
  insight: string;
};
