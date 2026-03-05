// Blog page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

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
  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            Insights, tips, and updates from the UrbanPro team.
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.title}>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {post.summary}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
