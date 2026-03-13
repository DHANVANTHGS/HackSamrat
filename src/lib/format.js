export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (value, options) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", options || {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (value) => formatDate(value, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const fullName = (entity = {}) => [entity.firstName, entity.lastName].filter(Boolean).join(" ") || entity.email || "Unknown";
