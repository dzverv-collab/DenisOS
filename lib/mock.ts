import { ContentCard, Deal, Goal, HabitLog, LearningEntry } from "./types";

export const initialDeals: Deal[] = [
  { id:"1", model:"iPhone 13 Pro", memory:"256 GB", color:"Graphite", status:"Готов", source:"Ломбард №1", boughtFor:18000, delivery:400, repair:1800, otherExpenses:0, plannedSale:27000, soldFor:null, purchaseDate:"2026-06-18", saleDate:null, note:"Проверить цену перед публикацией" },
  { id:"2", model:"iPhone 12", memory:"128 GB", color:"Black", status:"Продан", source:"Авито", boughtFor:12500, delivery:300, repair:900, otherExpenses:0, plannedSale:18500, soldFor:18500, purchaseDate:"2026-06-12", saleDate:"2026-06-20", note:"Продан быстро" },
  { id:"3", model:"iPhone 14 Pro", memory:"256 GB", color:"Purple", status:"У мастера", source:"Победа", boughtFor:34500, delivery:500, repair:5000, otherExpenses:0, plannedSale:47000, soldFor:null, purchaseDate:"2026-06-15", saleDate:null, note:"Ждём дисплей" },
  { id:"4", model:"iPhone 11", memory:"64 GB", color:"White", status:"Продан", source:"Клиент", boughtFor:9000, delivery:0, repair:900, otherExpenses:0, plannedSale:14500, soldFor:14500, purchaseDate:"2026-06-10", saleDate:"2026-06-15", note:"Хорошая маржа" }
];

export const initialContent: ContentCard[] = [
  { id:"c1", title:"Как я выкупил 150 телефонов обратно дешевле", hook:"История сделки", status:"Идея", views:0 },
  { id:"c2", title:"Ошибка при покупке б/у iPhone", hook:"Не покупай так", status:"Снято", views:0 },
  { id:"c3", title:"Разбор сделки: iPhone 13 Pro", hook:"+7000 ₽ на одном телефоне", status:"Монтаж", views:0 },
  { id:"c4", title:"Почему телефоны лежат больше 10 дней", hook:"Главная ошибка в цене", status:"Опубликовано", views:87000 }
];

export const initialGoals: Goal[] = [
  { id:"g1", title:"Открыть магазин", type:"Главная цель", current:35, target:100, unit:"%" },
  { id:"g2", title:"Капитал", type:"Финансы", current:420000, target:1000000, unit:"₽" },
  { id:"g3", title:"Прибыль месяца", type:"Бизнес", current:145000, target:300000, unit:"₽" },
  { id:"g4", title:"Ролики месяца", type:"Контент", current:12, target:30, unit:"шт" },
  { id:"g5", title:"Подписчики", type:"Аудитория", current:2300, target:10000, unit:"чел" }
];

export const initialHabits: HabitLog[] = [
  { date:"2026-06-24", sport:true, content:true, learning:true, sleep:false, plan:true },
  { date:"2026-06-23", sport:false, content:true, learning:true, sleep:true, plan:true },
  { date:"2026-06-22", sport:true, content:false, learning:true, sleep:true, plan:true }
];

export const initialLearning: LearningEntry[] = [
  { id:"l1", date:"2026-06-24", title:"Разбор юнит-экономики", hours:1.5, insight:"Нужно быстрее выводить телефоны из ремонта." },
  { id:"l2", date:"2026-06-23", title:"Контент и удержание", hours:1, insight:"Первый хук должен сразу показывать конфликт." }
];
