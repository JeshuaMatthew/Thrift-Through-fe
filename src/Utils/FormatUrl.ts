/**
 * Format image URLs from backend to absolute frontend URLs.
 * Strips /api from the VITE_API_URL and handles relative paths.
 */
export const formatImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    
    let targetPath = url;

    // If it's an absolute URL pointing to localhost (stale data), 
    // extract the relative path to force it to use the current base URL
    if (url.startsWith('http') && url.includes('localhost:')) {
        const uploadsIndex = url.indexOf('/uploads/');
        if (uploadsIndex !== -1) {
            targetPath = url.substring(uploadsIndex);
        }
    }

    // If it's still an absolute URL (external image), return as is
    if (targetPath.startsWith('http')) return targetPath;
    
    // Images are served from root (not /api)
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const rootBaseUrl = apiBaseUrl.replace('/api', '');
    
    // Ensure relative paths start with /
    const relativePath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    
    return `${rootBaseUrl}${relativePath}`;
};
