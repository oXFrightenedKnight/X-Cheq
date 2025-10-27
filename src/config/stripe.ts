export const PLANS = [
  {
    name: "Free",
    slug: "free",
    quota: 10,
    maxFiles: 2,
    pagesPerPdf: 10,
    standardCredits: 300,
    premCredits: 0,
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
    quota: 25,
    maxFiles: 10,
    pagesPerPdf: 100,
    standardCredits: 1000,
    premCredits: 100,
    pricing: {
      amount: 7.99,
      priceIds: {
        test: "prod_TJKU8QZ5SRR1j4",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 75,
    maxFiles: 50,
    pagesPerPdf: 1000,
    standardCredits: 3000,
    premCredits: 350,
    pricing: {
      amount: 29.99,
      priceIds: {
        test: "prod_TJL40E4l80Gl3L",
        production: "",
      },
    },
  },
];
