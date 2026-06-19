const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src/app/dashboard/page.tsx');
const newsAddPath = path.join(__dirname, 'src/app/news/add/page.tsx');

const blogsDir = path.join(__dirname, 'src/app/blogs');
const blogsAddDir = path.join(__dirname, 'src/app/blogs/add');

fs.mkdirSync(blogsDir, { recursive: true });
fs.mkdirSync(blogsAddDir, { recursive: true });

let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

dashboardContent = dashboardContent
  .replace(/NewsItem/g, 'BlogItem')
  .replace(/newsList/g, 'blogList')
  .replace(/setNewsList/g, 'setBlogList')
  .replace(/selectedNews/g, 'selectedBlog')
  .replace(/setSelectedNews/g, 'setSelectedBlog')
  .replace(/fetchNews/g, 'fetchBlogs')
  .replace(/\/news\/search/g, '/blogs/search')
  .replace(/\/news/g, '/blogs')
  .replace(/sourceUrl\?: string \| null;/g, 'slug: string;')
  .replace(/editSourceUrl/g, 'editSlug')
  .replace(/setEditSourceUrl/g, 'setEditSlug')
  .replace(/sourceUrl: editSourceUrl \|\| null,/g, 'slug: editSlug,')
  .replace(/item\.sourceUrl/g, 'item.slug')
  .replace(/DashboardPage/g, 'BlogsDashboardPage')
  .replace(/News wire articles/g, 'Blog posts')
  .replace(/WIRE <span className="text-red-800">REPORTS<\/span>/g, 'BLOG <span className="text-red-800">POSTS<\/span>')
  .replace(/newsId/g, 'blogId')
  .replace(/news/g, 'blogs')
  .replace(/News/g, 'Blogs')
  .replace(/priority: string;/g, '')
  .replace(/tags: string\[\];/g, '')
  // remove priority state
  .replace(/const \[selectedPriority, setSelectedPriority\] = useState<string>\("ALL"\);/g, '')
  .replace(/const \[editPriority, setEditPriority\] = useState\(""\);/g, '')
  .replace(/const \[editTags, setEditTags\] = useState\(""\);/g, '')
  .replace(/setEditPriority\(item\.priority\);/g, '')
  .replace(/setEditTags\(item\.tags\.join\(\", \"\)\);/g, '')
  // Note: the above regexes are simple and might need manual tweaking. Let's make it smarter or just write the files directly.

// Wait, doing this via script is very error-prone for JSX.
