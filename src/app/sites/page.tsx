import Link from 'next/link';
import { prisma } from '@/lib/db';
import { CreateSiteButton, CreateFirstSiteButton } from '@/components/SiteActions';

export default async function SitesPage() {
  // Fetch all sites from the database
  let sites: any[] = [];
  
  try {
    sites = await prisma.site.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
  }

  // Calculate stats for each site (simplified for now)
  const sitesWithStats = sites.map(site => ({
    ...site,
    posts: 0, // TODO: Calculate from related content
    products: 0, // TODO: Calculate from related products
    revenue: 0, // TODO: Calculate from affiliate clicks
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="admin-header">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in-left">
              <h1 className="text-3xl font-bold text-apple-gray-900">Sites</h1>
              <p className="text-apple-gray-600 mt-1">Manage your affiliate websites</p>
            </div>
            <div className="animate-fade-in-right">
              <CreateSiteButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Sites Grid */}
          <div className="grid grid-cols-1 gap-6">
            {sitesWithStats.length > 0 ? (
              sitesWithStats.map((site, index) => (
                <div
                  key={site.id}
                  className={`admin-stat-card hover:shadow-apple-lg transition-all duration-300 animate-fade-in-up animation-delay-${(index + 1) * 100}`}
                >
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-xl font-bold text-apple-gray-900">{site.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          site.status === 'active' 
                            ? 'bg-apple-green/10 text-apple-green' 
                            : 'bg-apple-gray-100 text-apple-gray-600'
                        }`}>
                          {site.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-apple-gray-600 mb-4">{site.domain || 'No domain set'}</p>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-apple-gray-500">Theme</p>
                          <p className="font-semibold text-apple-gray-900">{site.theme || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-apple-gray-500">Posts</p>
                          <p className="font-semibold text-apple-gray-900">{site.posts}</p>
                        </div>
                        <div>
                          <p className="text-sm text-apple-gray-500">Products</p>
                          <p className="font-semibold text-apple-gray-900">{site.products}</p>
                        </div>
                        <div>
                          <p className="text-sm text-apple-gray-500">Last Updated</p>
                          <p className="font-semibold text-apple-gray-900">
                            {new Date(site.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-6">
                      <Link
                        href={`/sites/${site.id}/edit`}
                        className="admin-button admin-button-secondary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button className="admin-button admin-button-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-stat-card text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-apple-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-bold text-apple-gray-900 mb-2">No sites yet</h3>
                <p className="text-apple-gray-600 mb-4">Create your first affiliate site to get started</p>
                <CreateFirstSiteButton />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}