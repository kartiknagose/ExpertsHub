// Blog page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

const posts = [
  {
    title: 'How to choose the right service professional',
    summary: 'Practical tips for comparing ratings, experience, and availability.',
  },
  {
    title: 'Top home maintenance checklist',
    summary: 'Seasonal tasks to keep your home safe and efficient all year.',
  },
  {
    title: 'Trust and safety: what verification means',
    summary: 'An overview of our verification and quality monitoring process.',
  },
];

export function BlogPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Blog
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            Insights, tips, and updates from the UrbanPro team.
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.title}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {post.title}
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {post.summary}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
