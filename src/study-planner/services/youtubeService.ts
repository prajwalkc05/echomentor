class YouTubeService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL;

  async getRecommendedVideos(topic: string): Promise<any[]> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${this.baseUrl}/api/study-planner/youtube/videos?topic=${encodeURIComponent(topic)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success && data.videos) {
        return data.videos;
      }
      
      return this.getMockVideos(topic);
    } catch (error) {
      console.error('YouTube API error:', error);
      return this.getMockVideos(topic);
    }
  }

  private getMockVideos(topic: string): any[] {
    return [
      {
        id: 'mock1',
        title: `${topic} - Complete Tutorial`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channel: 'Educational Channel',
        publishedAt: new Date().toISOString(),
        description: `Learn ${topic} with this comprehensive tutorial`
      },
      {
        id: 'mock2',
        title: `${topic} Explained Simply`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' explained')}`,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channel: 'Learning Hub',
        publishedAt: new Date().toISOString(),
        description: `Simple explanation of ${topic} concepts`
      },
      {
        id: 'mock3',
        title: `${topic} Practice Problems`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' practice')}`,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channel: 'Study Helper',
        publishedAt: new Date().toISOString(),
        description: `Practice problems and solutions for ${topic}`
      }
    ];
  }
}

export const youtubeService = new YouTubeService();