import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const db = new PrismaClient();

function hashPassword(password: string): string {
  const SECRET_KEY = 'linkguard-default-secret-key-32b!';
  return createHash('sha256').update(password + SECRET_KEY).digest('hex');
}

function generateSlug(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(length);
  return Array.from(bytes, byte => chars[byte % chars.length]).join('');
}

async function seed() {
  console.log('🌱 Seeding database...');

  // Create default admin account
  const admin = await db.adminAccount.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
    },
  });
  console.log('✅ Admin account created (username: admin, password: admin123)');

  // Create default site settings
  const settings = [
    { key: 'siteName', value: 'LinkGuard' },
    { key: 'siteDescription', value: 'Professional Shortlink & Safelink Platform' },
    { key: 'siteUrl', value: 'https://linkguard.app' },
    { key: 'logo', value: '' },
    { key: 'favicon', value: '' },
    { key: 'primaryColor', value: '#6366f1' },
    { key: 'accentColor', value: '#06b6d4' },
    { key: 'footerText', value: '© 2025 LinkGuard. All rights reserved.' },
    { key: 'customDomain', value: '' },
    { key: 'language', value: 'en' },
    { key: 'theme', value: 'auto' },
    { key: 'maintenanceMode', value: 'false' },
    { key: 'adminPath', value: 'admin-panel' },
    { key: 'redirectDelay', value: '10' },
    { key: 'enableAds', value: 'true' },
    { key: 'customHeadScript', value: '' },
    { key: 'customBodyScript', value: '' },
    { key: 'ogDefaultImage', value: '' },
    { key: 'enableCloaking', value: 'true' },
    { key: 'fakeLiveVisitors', value: 'true' },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Site settings created');

  // Create sample articles
  const articles = [
    {
      slug: 'how-to-boost-productivity',
      title: '10 Proven Ways to Boost Your Productivity in 2025',
      content: `<h2>Introduction</h2><p>In today's fast-paced world, productivity is more important than ever. Whether you're working from home or in an office, these 10 proven strategies will help you get more done in less time.</p><h2>1. Time Blocking</h2><p>Allocate specific time blocks for different tasks throughout your day. This technique helps you stay focused and prevents multitasking, which can reduce productivity by up to 40%.</p><h2>2. The Two-Minute Rule</h2><p>If a task takes less than two minutes to complete, do it immediately. This simple rule prevents small tasks from piling up and becoming overwhelming.</p><h2>3. Prioritize with Eisenhower Matrix</h2><p>Categorize tasks into four quadrants based on urgency and importance. Focus on important tasks that aren't urgent to prevent last-minute stress.</p><h2>4. Take Regular Breaks</h2><p>Use the Pomodoro Technique: work for 25 minutes, then take a 5-minute break. After four cycles, take a longer 15-30 minute break.</p><h2>5. Eliminate Distractions</h2><p>Turn off notifications, close unnecessary tabs, and create a dedicated workspace. Studies show it takes an average of 23 minutes to refocus after a distraction.</p><h2>6. Batch Similar Tasks</h2><p>Group similar tasks together and handle them in one session. This reduces context switching and improves efficiency.</p><h2>7. Use the Right Tools</h2><p>Invest in productivity tools that work for you. From project management apps to note-taking software, the right tools can significantly boost your output.</p><h2>8. Set Clear Goals</h2><p>Start each day with a clear list of achievable goals. Use the SMART framework: Specific, Measurable, Achievable, Relevant, Time-bound.</p><h2>9. Learn to Say No</h2><p>Protect your time by politely declining non-essential commitments. Every "yes" to something unimportant is a "no" to something that matters.</p><h2>10. Review and Reflect</h2><p>At the end of each week, review what you accomplished and what could be improved. Continuous reflection leads to continuous improvement.</p><h2>Conclusion</h2><p>Productivity is not about working harder, but working smarter. By implementing these strategies consistently, you'll see a significant improvement in your output and work-life balance.</p>`,
      excerpt: 'Discover 10 proven strategies that will transform your daily workflow and help you accomplish more in less time.',
      thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
      category: 'Productivity',
      tags: '["productivity", "tips", "work", "efficiency"]',
      author: 'Sarah Mitchell',
      readTime: 8,
      trendingScore: 95,
      fakeViews: 15420,
    },
    {
      slug: 'web-development-trends',
      title: 'Web Development Trends That Will Dominate 2025',
      content: `<h2>The Future of Web Development</h2><p>Web development is evolving at breakneck speed. Here are the key trends that every developer should watch in 2025 and beyond.</p><h2>AI-Powered Development</h2><p>AI coding assistants are transforming how we write code. From code completion to bug detection, AI tools are becoming essential for modern development workflows.</p><h2>Edge Computing</h2><p>With frameworks like Next.js and Cloudflare Workers, edge computing is making websites faster than ever by moving computation closer to users.</p><h2>WebAssembly Goes Mainstream</h2><p>WebAssembly enables near-native performance in the browser. Expect more complex applications to run entirely on the client side.</p><h2>Server Components</h2><p>React Server Components and similar patterns are changing how we think about rendering, reducing bundle sizes and improving performance.</p><h2>Progressive Web Apps 2.0</h2><p>PWAs continue to blur the line between web and native apps, with better offline support, push notifications, and device API access.</p><h2>Conclusion</h2><p>Staying updated with these trends is crucial for developers who want to remain competitive in the ever-changing tech landscape.</p>`,
      excerpt: 'Explore the cutting-edge technologies and methodologies shaping the future of web development.',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
      category: 'Technology',
      tags: '["webdev", "trends", "technology", "2025"]',
      author: 'James Chen',
      readTime: 6,
      trendingScore: 88,
      fakeViews: 12350,
    },
    {
      slug: 'digital-marketing-strategies',
      title: 'Digital Marketing Strategies That Actually Work in 2025',
      content: `<h2>Effective Digital Marketing</h2><p>In the ever-changing digital landscape, only the most adaptive marketers succeed. Here are proven strategies that drive real results.</p><h2>Content Marketing Evolution</h2><p>Quality content remains king, but the format is changing. Short-form video, interactive content, and AI-generated personalization are leading the way.</p><h2>Social Media Mastery</h2><p>Platform algorithms constantly change. Focus on building genuine engagement rather than chasing vanity metrics.</p><h2>SEO in the AI Era</h2><p>With AI search becoming mainstream, traditional SEO is evolving. Focus on providing genuine value and answering user intent.</p><h2>Email Marketing Renaissance</h2><p>Despite predictions of its death, email marketing continues to deliver the highest ROI when done right with personalization and automation.</p><h2>Conclusion</h2><p>The key to successful digital marketing is adaptability and a focus on providing genuine value to your audience.</p>`,
      excerpt: 'Learn the most effective digital marketing strategies that drive real results and ROI in the modern landscape.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      category: 'Marketing',
      tags: '["marketing", "digital", "strategy", "SEO"]',
      author: 'Emily Rodriguez',
      readTime: 7,
      trendingScore: 76,
      fakeViews: 9870,
    },
    {
      slug: 'cybersecurity-essentials',
      title: 'Cybersecurity Essentials Every Business Needs in 2025',
      content: `<h2>Protecting Your Digital Assets</h2><p>Cyber threats are more sophisticated than ever. Every business, regardless of size, needs a comprehensive security strategy.</p><h2>Zero Trust Architecture</h2><p>The "never trust, always verify" approach is becoming the standard for enterprise security.</p><h2>Multi-Factor Authentication</h2><p>MFA is no longer optional. Implement it across all systems to prevent unauthorized access.</p><h2>Employee Training</h2><p>Human error is the #1 cause of security breaches. Regular training is your best defense.</p><h2>Incident Response Planning</h2><p>Have a clear plan for when (not if) a breach occurs. Quick response minimizes damage.</p><h2>Conclusion</h2><p>Investing in cybersecurity is not an expense—it's insurance for your business's future.</p>`,
      excerpt: 'Essential cybersecurity measures every business must implement to protect against modern threats.',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop',
      category: 'Security',
      tags: '["cybersecurity", "business", "protection", "safety"]',
      author: 'Michael Park',
      readTime: 6,
      trendingScore: 82,
      fakeViews: 11200,
    },
    {
      slug: 'health-tech-revolution',
      title: 'How Health Technology is Revolutionizing Patient Care',
      content: `<h2>The Digital Health Revolution</h2><p>Technology is transforming healthcare delivery, making it more accessible, efficient, and personalized than ever before.</p><h2>Telemedicine Growth</h2><p>Virtual consultations have become mainstream, with patients enjoying the convenience of remote healthcare access.</p><h2>Wearable Health Devices</h2><p>From smartwatches to biosensors, wearable technology provides continuous health monitoring and early detection of issues.</p><h2>AI in Diagnostics</h2><p>AI algorithms can now detect diseases from medical imaging with accuracy matching or exceeding human specialists.</p><h2>Personalized Medicine</h2><p>Genomic data and AI are enabling treatments tailored to individual patients' genetic profiles.</p><h2>Conclusion</h2><p>The intersection of technology and healthcare promises a future where quality care is accessible to everyone.</p>`,
      excerpt: 'Discover how cutting-edge technology is transforming healthcare delivery and patient outcomes.',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
      category: 'Health',
      tags: '["health", "technology", "innovation", "medical"]',
      author: 'Dr. Lisa Wang',
      readTime: 7,
      trendingScore: 71,
      fakeViews: 8540,
    },
  ];

  for (const article of articles) {
    await db.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }
  console.log('✅ Sample articles created');

  // Create sample links
  const sampleLinks = [
    {
      slug: generateSlug(),
      originalUrl: 'https://example.com/download/file1',
      title: 'Download File 1',
    },
    {
      slug: generateSlug(),
      originalUrl: 'https://example.com/offer/page',
      title: 'Special Offer Page',
    },
    {
      slug: generateSlug(),
      originalUrl: 'https://example.com/video/tutorial',
      title: 'Video Tutorial',
    },
  ];

  for (const link of sampleLinks) {
    await db.link.create({ data: link });
  }
  console.log('✅ Sample links created');

  // Create sample ad slots
  const adSlots = [
    { name: 'Banner Top', position: 'banner_top', isEnabled: true, deviceTarget: 'all' },
    { name: 'In Article', position: 'in_article', isEnabled: true, deviceTarget: 'all' },
    { name: 'Banner Bottom', position: 'banner_bottom', isEnabled: true, deviceTarget: 'all' },
    { name: 'Sticky Bottom', position: 'sticky', isEnabled: false, deviceTarget: 'mobile' },
    { name: 'Floating Button', position: 'floating', isEnabled: false, deviceTarget: 'mobile' },
  ];

  for (const ad of adSlots) {
    await db.adSlot.upsert({
      where: { id: ad.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: ad.name.toLowerCase().replace(/\s+/g, '-'),
        ...ad,
      },
    });
  }
  console.log('✅ Ad slots created');

  console.log('🎉 Seed completed!');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
