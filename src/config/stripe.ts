export const PLANS = [
  {
    name: "Free",
    slug: "free",
    maxFiles: 2,
    standardCredits: 100,
    maxPagesPerFile: 10,
    maxFileSize: "2MB",
    pricing: {
      amount: 0,
      priceIds: {
        test: "",
        production: "",
      },
    },
  },
  {
    name: "Advanced",
    slug: "advanced",
    maxFiles: 10,
    standardCredits: 500,
    maxPagesPerFile: 50,
    maxFileSize: "8MB",
    pricing: {
      amount: 7.99,
      priceIds: {
        test: "price_1SMhpCCzZ9GPGXgnHVPyQnYN",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    maxFiles: 50,
    standardCredits: 2000,
    maxPagesPerFile: 300,
    maxFileSize: "32MB",
    pricing: {
      amount: 29.99,
      priceIds: {
        test: "price_1SMiNyCzZ9GPGXgneBQbAmgl",
        production: "",
      },
    },
  },
];
