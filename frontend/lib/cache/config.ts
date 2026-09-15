export const CACHE_REVALIDATE = {
  landing: 900,
  accessibility: 86400,
  publicOverview: 600,
} as const;

export const CACHE_TAGS = {
  landing: "landing-page",
  accessibility: "accessibility-page",
  publicOverview: "public-overview",
  projects: "projects",
  invoices: "invoices",
  payments: "payments",
} as const;

export const CACHE_HEADERS = {
  status: "x-manifestpay-cache-status",
  key: "x-manifestpay-cache-key",
  generatedAt: "x-manifestpay-cache-generated-at",
  age: "x-manifestpay-cache-age",
  revalidateIn: "x-manifestpay-cache-revalidate-in",
  tags: "x-manifestpay-cache-tags",
} as const;

