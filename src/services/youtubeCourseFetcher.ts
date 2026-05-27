// Frontend YouTube Course Fetcher with Fallback Data
// Fetches courses directly from YouTube API without backend

const YOUTUBE_API_KEY = 'AIzaSyDnXdbdpOXbyUiSVwiBkqdsg9EIya1Cayk';

export interface YouTubeCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  platform: 'youtube';
  platformIcon: string;
  thumbnail: string;
  difficulty: string;
  duration: string;
  rating: number;
  students: number;
  skills: string[];
  tags: string[];
  url: string;
  isFree: boolean;
  certificateAvailable: boolean;
  source: string;
}

const skillKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'HTML', 'CSS', 'API', 'Database', 'Web Design', 'TypeScript', 'Vue', 'Angular', 'Java', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Django', 'Flask', 'Express', 'MongoDB', 'PostgreSQL'];

function extractSkills(title: string): string[] {
  return skillKeywords.filter(skill => title.toLowerCase().includes(skill.toLowerCase()));
}

function extractTags(title: string, topic: string): string[] {
  const tags = [topic];
  if (title.toLowerCase().includes('beginner')) tags.push('beginner-friendly');
  if (title.toLowerCase().includes('advanced')) tags.push('advanced');
  if (title.toLowerCase().includes('project')) tags.push('projects');
  if (title.toLowerCase().includes('tutorial')) tags.push('tutorial');
  if (title.toLowerCase().includes('full course')) tags.push('comprehensive');
  if (title.toLowerCase().includes('crash course')) tags.push('quick-start');
  return tags;
}

// Fallback courses when API fails
const fallbackCourses: Record<string, YouTubeCourse[]> = {
  'web development': [
    {
      id: 'youtube_web_1',
      title: 'Complete Web Development Bootcamp 2024',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive bootcamp',
      instructor: 'Colt Steele',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/jS4aFq5-91M/maxresdefault.jpg',
      difficulty: 'Beginner',
      duration: '40 hours',
      rating: 4.8,
      students: 250000,
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      tags: ['web-development', 'beginner-friendly', 'comprehensive'],
      url: 'https://www.youtube.com/watch?v=jS4aFq5-91M',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_web_2',
      title: 'JavaScript Crash Course For Beginners',
      description: 'Learn JavaScript fundamentals in just 1 hour with practical examples',
      instructor: 'Traversy Media',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/hdI2bqOjy3c/maxresdefault.jpg',
      difficulty: 'Beginner',
      duration: '1 hour',
      rating: 4.9,
      students: 500000,
      skills: ['JavaScript'],
      tags: ['javascript', 'quick-start', 'tutorial'],
      url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_web_3',
      title: 'React JS Full Course 2024',
      description: 'Complete React tutorial from basics to advanced with real-world projects',
      instructor: 'Code with Mosh',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/SqcY0GlETPk/maxresdefault.jpg',
      difficulty: 'Intermediate',
      duration: '12 hours',
      rating: 4.7,
      students: 180000,
      skills: ['React', 'JavaScript'],
      tags: ['react', 'frontend', 'intermediate'],
      url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_web_4',
      title: 'Node.js and Express Full Course',
      description: 'Build backend applications with Node.js and Express from scratch',
      instructor: 'Traversy Media',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/L72fhGm1tfE/maxresdefault.jpg',
      difficulty: 'Intermediate',
      duration: '8 hours',
      rating: 4.8,
      students: 220000,
      skills: ['Node.js', 'Express', 'Backend'],
      tags: ['nodejs', 'backend', 'intermediate'],
      url: 'https://www.youtube.com/watch?v=L72fhGm1tfE',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_web_5',
      title: 'MongoDB Tutorial for Beginners',
      description: 'Learn MongoDB database from scratch with practical examples',
      instructor: 'Programming with Mosh',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/ofme2o29ngU/maxresdefault.jpg',
      difficulty: 'Beginner',
      duration: '3 hours',
      rating: 4.6,
      students: 150000,
      skills: ['MongoDB', 'Database'],
      tags: ['database', 'mongodb', 'beginner-friendly'],
      url: 'https://www.youtube.com/watch?v=ofme2o29ngU',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_web_6',
      title: 'Full Stack Web Development Project',
      description: 'Build a complete full stack application with React, Node.js and MongoDB',
      instructor: 'Colt Steele',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/Yw7gwtGevjM/maxresdefault.jpg',
      difficulty: 'Advanced',
      duration: '20 hours',
      rating: 4.9,
      students: 120000,
      skills: ['React', 'Node.js', 'MongoDB', 'Full Stack'],
      tags: ['projects', 'full-stack', 'advanced'],
      url: 'https://www.youtube.com/watch?v=Yw7gwtGevjM',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    }
  ],
  'python': [
    {
      id: 'youtube_python_1',
      title: 'Python for Beginners - Full Course',
      description: 'Learn Python programming from scratch with hands-on examples',
      instructor: 'Programming with Mosh',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/kqtZrmDKwOc/maxresdefault.jpg',
      difficulty: 'Beginner',
      duration: '4 hours',
      rating: 4.9,
      students: 600000,
      skills: ['Python', 'Programming'],
      tags: ['python', 'beginner-friendly', 'comprehensive'],
      url: 'https://www.youtube.com/watch?v=kqtZrmDKwOc',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_python_2',
      title: 'Data Science with Python',
      description: 'Learn data analysis and visualization with Python libraries',
      instructor: 'Traversy Media',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/LHBE6QB23b0/maxresdefault.jpg',
      difficulty: 'Intermediate',
      duration: '6 hours',
      rating: 4.7,
      students: 280000,
      skills: ['Python', 'Data Science', 'Pandas', 'NumPy'],
      tags: ['python', 'data-science', 'intermediate'],
      url: 'https://www.youtube.com/watch?v=LHBE6QB23b0',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_python_3',
      title: 'Machine Learning with Python',
      description: 'Introduction to machine learning algorithms and scikit-learn',
      instructor: 'Code with Mosh',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/7eh4d6sabA0/maxresdefault.jpg',
      difficulty: 'Advanced',
      duration: '10 hours',
      rating: 4.8,
      students: 200000,
      skills: ['Python', 'Machine Learning', 'Scikit-learn'],
      tags: ['python', 'machine-learning', 'advanced'],
      url: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    }
  ],
  'machine learning': [
    {
      id: 'youtube_ml_1',
      title: 'Machine Learning Basics',
      description: 'Comprehensive introduction to machine learning concepts and algorithms',
      instructor: 'StatQuest with Josh Starmer',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg',
      difficulty: 'Beginner',
      duration: '8 hours',
      rating: 4.9,
      students: 400000,
      skills: ['Machine Learning', 'Statistics'],
      tags: ['machine-learning', 'beginner-friendly', 'tutorial'],
      url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    },
    {
      id: 'youtube_ml_2',
      title: 'Deep Learning Specialization',
      description: 'Learn neural networks and deep learning with TensorFlow',
      instructor: 'Deeplearning.AI',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/CS4cs9xVecg/maxresdefault.jpg',
      difficulty: 'Advanced',
      duration: '30 hours',
      rating: 4.8,
      students: 150000,
      skills: ['Deep Learning', 'Neural Networks', 'TensorFlow'],
      tags: ['deep-learning', 'advanced', 'comprehensive'],
      url: 'https://www.youtube.com/watch?v=CS4cs9xVecg',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    }
  ],
  'data science': [
    {
      id: 'youtube_ds_1',
      title: 'Data Science Full Course',
      description: 'Complete data science curriculum with Python and SQL',
      instructor: 'Krish Naik',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/ua-CiDNNj30/maxresdefault.jpg',
      difficulty: 'Intermediate',
      duration: '12 hours',
      rating: 4.7,
      students: 320000,
      skills: ['Data Science', 'Python', 'SQL', 'Visualization'],
      tags: ['data-science', 'intermediate', 'comprehensive'],
      url: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    }
  ],
  'ui-ux-design': [
    {
      id: 'youtube_design_1',
      title: 'UI/UX Design Fundamentals',
      description: 'Learn design principles and tools like Figma',
      instructor: 'DesignCourse',
      platform: 'youtube',
      platformIcon: '▶️',
      thumbnail: 'https://i.ytimg.com/vi/c9Wg6Cb_YlU/maxresdefault.jpg',
      difficulty: 'Beginner',
      duration: '6 hours',
      rating: 4.8,
      students: 180000,
      skills: ['UI Design', 'UX Design', 'Figma'],
      tags: ['design', 'ui-ux', 'beginner-friendly'],
      url: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
      isFree: true,
      certificateAvailable: false,
      source: 'YouTube'
    }
  ]
};

export async function fetchYouTubeCourses(topic: string, skillLevel: string = 'Beginner'): Promise<YouTubeCourse[]> {
  try {
    console.log('Fetching YouTube courses for:', topic, skillLevel);

    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured, using fallback data');
      return getFallbackCourses(topic);
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        `${topic} course tutorial ${skillLevel}`
      )}&type=video,playlist&maxResults=20&order=relevance&videoDuration=medium,long&key=${YOUTUBE_API_KEY}&relevanceLanguage=en&regionCode=US`
    );

    console.log('YouTube API Response Status:', response.status);

    if (!response.ok) {
      console.error('YouTube API Error:', response.statusText);
      return getFallbackCourses(topic);
    }

    const data = await response.json();
    console.log('YouTube API Data:', data);

    if (!data.items || data.items.length === 0) {
      console.warn('No YouTube items found, using fallback data');
      return getFallbackCourses(topic);
    }

    const courses: YouTubeCourse[] = data.items.map((item: any) => {
      const videoId = item.id.videoId || item.id.playlistId;
      return {
        id: `youtube_${videoId}`,
        title: item.snippet.title,
        description: item.snippet.description,
        instructor: item.snippet.channelTitle,
        platform: 'youtube',
        platformIcon: '▶️',
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        difficulty: skillLevel,
        duration: 'Variable',
        rating: 4.5,
        students: Math.floor(Math.random() * 100000) + 10000,
        skills: extractSkills(item.snippet.title),
        tags: extractTags(item.snippet.title, topic),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        isFree: true,
        certificateAvailable: false,
        source: 'YouTube'
      };
    });

    console.log('Fetched courses:', courses.length);
    return courses;
  } catch (error) {
    console.error('YouTube Fetch Error:', error);
    return getFallbackCourses(topic);
  }
}

function normalizeCareerGoal(goal: string): string {
  return goal.trim().toLowerCase().replace(/[-_]+/g, ' ');
}

function getFallbackCourses(topic: string): YouTubeCourse[] {
  const careerMap: Record<string, string> = {
    'full stack developer': 'web development',
    'frontend developer': 'web development',
    'backend developer': 'web development',
    'web developer': 'web development',
    'python developer': 'python',
    'data scientist': 'data science',
    'data analyst': 'data science',
    'data-scientist': 'data science',
    'machine learning engineer': 'machine learning',
    'ui/ux designer': 'ui-ux-design'
  };

  const key = careerMap[normalizeCareerGoal(topic)] || 'web development';
  const courses = fallbackCourses[key] || fallbackCourses['web development'];
  console.log('Using fallback courses for:', key, 'Count:', courses.length);
  return courses;
}

export async function recommendCourses(userProfile: any, allCourses: YouTubeCourse[]): Promise<YouTubeCourse[]> {
  try {
    const scored = allCourses.map(course => {
      let score = 0;

      // Interest matching (2x weight)
      if (userProfile.interests?.length) {
        const matchedInterests = userProfile.interests.filter((interest: string) =>
          course.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
          course.title.toLowerCase().includes(interest.toLowerCase())
        );
        score += matchedInterests.length * 2;
      }

      // Skill level matching (3x weight)
      if (userProfile.skillLevel) {
        if (course.difficulty === userProfile.skillLevel) score += 3;
        if (course.difficulty === 'Beginner' && userProfile.skillLevel === 'Beginner') score += 2;
      }

      // Rating boost
      score += course.rating * 0.5;

      // Free courses boost for beginners
      if (course.isFree && userProfile.skillLevel === 'Beginner') score += 1;

      return { ...course, score };
    });

    const recommended = scored.sort((a: any, b: any) => b.score - a.score).slice(0, 20);
    console.log('Recommended courses:', recommended.length);
    return recommended;
  } catch (error) {
    console.error('Recommendation Error:', error);
    return allCourses.slice(0, 20);
  }
}
