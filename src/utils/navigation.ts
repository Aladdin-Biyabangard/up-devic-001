// Navigation utilities to replace window.location.href usage
import { NavigateFunction } from 'react-router-dom';

export class NavigationUtils {
  static searchCourses(query: string, navigate: NavigateFunction): void {
    if (query.trim()) {
      navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
    }
  }

  static navigateToCategory(category: string, navigate: NavigateFunction): void {
    navigate(`/courses?category=${encodeURIComponent(category)}`);
  }

  static redirectToPayment(sessionUrl: string): void {
    // Payment redirects still use window.location as they redirect to external payment providers
    window.location.href = sessionUrl;
  }

  static async shareCurrentPage(): Promise<void> {
    try {
      const shareData = {
        title: document.title,
        text: "Check out this page",
        url: window.location.href,
      };
      
      if ('share' in navigator && typeof (navigator as any).share === 'function') {
        await (navigator as any).share(shareData);
      } else if ('clipboard' in navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        // You could use toast here instead of alert
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to share:', error);
      throw error;
    }
  }
}