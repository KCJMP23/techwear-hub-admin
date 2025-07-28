declare module 'amazon-paapi' {
  export interface ProductAdvertisingAPIConfig {
    accessKey: string;
    secretKey: string;
    partnerTag: string;
    partnerType: string;
    marketplace: string;
  }

  export interface SearchItemsParams {
    Keywords?: string;
    SearchIndex?: string;
    ItemCount?: number;
    SortBy?: string;
    BrowseNode?: string;
    MinimumPrice?: number;
    MaximumPrice?: number;
    ItemIds?: string[];
    Resources?: string[];
  }

  export interface ItemInfo {
    Title?: {
      DisplayValue: string;
    };
    Features?: {
      DisplayValues: string[];
    };
    ProductInfo?: {
      ItemClassification?: {
        ProductGroup: string;
      };
    };
  }

  export interface Offers {
    Listings?: Array<{
      Price?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
      };
      Availability?: {
        Message: string;
      };
    }>;
  }

  export interface Images {
    Primary?: {
      Large?: {
        URL: string;
      };
    };
  }

  export interface CustomerReviews {
    Rating: number;
    Count: number;
  }

  export interface Features {
    DisplayValues: string[];
  }

  export interface Item {
    ASIN: string;
    ItemInfo?: ItemInfo;
    Offers?: Offers;
    Images?: Images;
    CustomerReviews?: CustomerReviews;
    Features?: Features;
    DetailPageURL: string;
  }

  export interface ItemsResult {
    Items?: Item[];
  }

  export interface SearchItemsResponse {
    ItemsResult?: ItemsResult;
  }

  export class ProductAdvertisingAPI {
    constructor(config: ProductAdvertisingAPIConfig);
    searchItems(params: SearchItemsParams): Promise<SearchItemsResponse>;
  }
} 