export const PLANS = [
  {
    name: "Free",
    slug: "free",
    maxFiles: 2,
    standardCredits: 100,
    maxPagesPerFile: 50,
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
    maxPagesPerFile: 300,
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
    maxPagesPerFile: 1500,
    pricing: {
      amount: 29.99,
      priceIds: {
        test: "price_1SMiNyCzZ9GPGXgneBQbAmgl",
        production: "",
      },
    },
  },
];
