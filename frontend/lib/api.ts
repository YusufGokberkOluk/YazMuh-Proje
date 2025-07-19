const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/sign-in';
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: { username: string; email: string; password: string }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // Workspaces
  async getWorkspaces() {
    return this.request('/workspaces');
  }

  async createWorkspace(workspaceData: { name: string; description?: string }) {
    return this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspaceData),
    });
  }

  async updateWorkspace(workspaceId: string, workspaceData: any) {
    return this.request(`/workspaces/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(workspaceData),
    });
  }

  async deleteWorkspace(workspaceId: string) {
    return this.request(`/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
  }

  // Pages
  async getPages(workspaceId?: string) {
    const params = workspaceId ? `?workspace=${workspaceId}` : '';
    return this.request(`/pages${params}`);
  }

  async getPage(pageId: string) {
    return this.request(`/pages/${pageId}`);
  }

  async createPage(pageData: { title: string; workspace: string; content?: string }) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  async updatePage(pageId: string, pageData: any) {
    return this.request(`/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    });
  }

  async deletePage(pageId: string) {
    return this.request(`/pages/${pageId}`, {
      method: 'DELETE',
    });
  }

  // Blocks
  async getBlocks(pageId: string) {
    return this.request(`/blocks/pages/${pageId}/blocks`);
  }

  async createBlock(pageId: string, blockData: { type: string; content: any; parent?: string; order?: number }) {
    return this.request(`/blocks/pages/${pageId}/blocks`, {
      method: 'POST',
      body: JSON.stringify(blockData),
    });
  }

  async updateBlock(blockId: string, blockData: any) {
    return this.request(`/blocks/blocks/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(blockData),
    });
  }

  async deleteBlock(blockId: string) {
    return this.request(`/blocks/blocks/${blockId}`, {
      method: 'DELETE',
    });
  }

  async reorderBlocks(pageId: string, blocks: any[]) {
    return this.request(`/blocks/pages/${pageId}/blocks/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ blocks }),
    });
  }

  // Comments
  async getComments(pageId: string, blockId?: string) {
    const params = blockId ? `?blockId=${blockId}` : '';
    return this.request(`/comments/pages/${pageId}/comments${params}`);
  }

  async createComment(pageId: string, commentData: { content: string; blockId?: string; parentId?: string }) {
    return this.request(`/comments/pages/${pageId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async updateComment(commentId: string, content: string) {
    return this.request(`/comments/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: string) {
    return this.request(`/comments/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async resolveComment(commentId: string) {
    return this.request(`/comments/comments/${commentId}/resolve`, {
      method: 'PUT',
    });
  }

  // Notifications
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) searchParams.append('unreadOnly', 'true');
    
    const query = searchParams.toString();
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationsAsRead(notificationIds?: string[]) {
    return this.request('/notifications/mark-read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  // Search
  async search(query: string, params?: { type?: string; workspaceId?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.type) searchParams.append('type', params.type);
    if (params?.workspaceId) searchParams.append('workspaceId', params.workspaceId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.request(`/search?${searchParams.toString()}`);
  }

  async advancedSearch(params: {
    q: string;
    type?: string;
    workspaceId?: string;
    tags?: string;
    dateFrom?: string;
    dateTo?: string;
    author?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    return this.request(`/search/advanced?${searchParams.toString()}`);
  }

  async getSearchSuggestions(query: string, type: string = 'pages') {
    const searchParams = new URLSearchParams({ q: query, type });
    return this.request(`/search/suggestions?${searchParams.toString()}`);
  }

  // User features
  async toggleFavorite(pageId: string) {
    return this.request(`/user/favorites/${pageId}`, {
      method: 'POST',
    });
  }

  async getFavorites() {
    return this.request('/user/favorites');
  }

  async getTags() {
    return this.request('/user/tags');
  }

  async createTag(tagData: { name: string; color: string }) {
    return this.request('/user/tags', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  }

  // Sharing
  async sharePage(pageId: string, shareData: { email: string; role: string }) {
    return this.request(`/share/pages/${pageId}`, {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  }

  async getSharedPages() {
    return this.request('/share/pages');
  }

  // AI features
  async completeText(text: string, maxTokens: number = 100) {
    return this.request('/ai/complete', {
      method: 'POST',
      body: JSON.stringify({ text, maxTokens }),
    });
  }

  async checkGrammar(text: string) {
    return this.request('/ai/grammar', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async translateText(text: string, targetLanguage: string) {
    return this.request('/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage }),
    });
  }

  async suggestTitle(content: string) {
    return this.request('/ai/suggest-title', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async extractText(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return this.request('/ai/ocr', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }

  async calendarSync(content: string) {
    return this.request('/ai/calendar-sync', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // File upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.request('/pages/upload-image', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 