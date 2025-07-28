export interface AmazonTrackingId {
  id: string;
  category: string;
  description: string;
}

export interface ManualAmazonLink {
  originalUrl: string;
  trackingId: string;
  affiliateUrl: string;
  category: string;
  title?: string;
  description?: string;
}

export class ManualAmazonLinkManager {
  private trackingIds: AmazonTrackingId[] = [
    {
      id: 'weartech00-20',
      category: 'wearable-tech',
      description: 'Wearable and mobile health technology and accessories'
    },
    {
      id: 'jmpkch23-20',
      category: 'general',
      description: 'General merchandise'
    },
    {
      id: 'hothoneyfever00-20',
      category: 'hot-honey',
      description: 'Hot honey products'
    }
  ];

  /**
   * Convert a regular Amazon URL to an affiliate URL
   */
  convertToAffiliateUrl(originalUrl: string, trackingId?: string): string {
    try {
      const url = new URL(originalUrl);
      
      // Validate it's an Amazon URL
      if (!url.hostname.includes('amazon')) {
        throw new Error('URL must be from Amazon');
      }

      // Use provided tracking ID or default to general merchandise
      const selectedTrackingId = trackingId || 'jmpkch23-20';
      
      // Add the tracking ID to the URL
      url.searchParams.set('tag', selectedTrackingId);
      
      return url.toString();
    } catch (error) {
      throw new Error(`Invalid Amazon URL: ${error}`);
    }
  }

  /**
   * Bulk convert multiple URLs to affiliate URLs
   */
  bulkConvertToAffiliateUrls(urls: string[], trackingId?: string): ManualAmazonLink[] {
    return urls.map(url => {
      const affiliateUrl = this.convertToAffiliateUrl(url, trackingId);
      const selectedTrackingId = trackingId || 'jmpkch23-20';
      const trackingIdInfo = this.trackingIds.find(t => t.id === selectedTrackingId);
      
      return {
        originalUrl: url,
        trackingId: selectedTrackingId,
        affiliateUrl,
        category: trackingIdInfo?.category || 'general',
        description: trackingIdInfo?.description
      };
    });
  }

  /**
   * Get all available tracking IDs
   */
  getTrackingIds(): AmazonTrackingId[] {
    return this.trackingIds;
  }

  /**
   * Get tracking ID by category
   */
  getTrackingIdByCategory(category: string): string | null {
    const trackingId = this.trackingIds.find(t => t.category === category);
    return trackingId?.id || null;
  }

  /**
   * Validate if a URL is a valid Amazon URL
   */
  isValidAmazonUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.includes('amazon');
    } catch {
      return false;
    }
  }

  /**
   * Extract product information from Amazon URL
   */
  extractProductInfo(url: string): { asin?: string; title?: string } {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/');
      const asin = pathParts.find(part => part.length === 10 && /^[A-Z0-9]{10}$/.test(part));
      
      return {
        asin,
        title: parsedUrl.searchParams.get('title') || undefined
      };
    } catch {
      return {};
    }
  }
}

// Export singleton instance
export const manualAmazonLinkManager = new ManualAmazonLinkManager(); 