// AI Service placeholder exports
export const AIService = {
  generateContent: async () => ({ content: 'Mock content' }),
  generateImage: async () => ({ url: 'https://placehold.co/600x400' }),
  testConnection: async () => ({ success: true })
};

export const amazonService = {
  searchProducts: async () => ({ products: [] })
};

export const manualAmazonLinkManager = {
  convertLink: async (url: string) => url
};