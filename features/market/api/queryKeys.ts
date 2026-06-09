// Query key factory (plain objects for zero extra deps; easy to scale with @lukemorales/query-key-factory later if desired)

export const marketKeys = {
  all: ["market"] as const,
  global: () => [...marketKeys.all, "global"] as const,
  lists: () => [...marketKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...marketKeys.lists(), params] as const,
  detail: (id: string) => [...marketKeys.all, "detail", id] as const,
  ohlc: (id: string, days: string | number) => [...marketKeys.detail(id), "ohlc", days] as const,
};
