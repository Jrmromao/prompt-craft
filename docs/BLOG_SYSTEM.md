# CostLens.dev Blog System

## ✅ Features Implemented

### 1. **Medium-Style Minimalist Design**
- Clean, serif typography
- Generous whitespace
- Focus on readability
- Dark mode support
- Responsive layout

### 2. **Blog Functionality**
- `/blog` - Blog listing page
- `/blog/[slug]` - Individual post pages
- View counter
- Reading time estimates
- Tags and categories
- Author attribution

### 3. **Newsletter System**
- Email subscription form
- Database storage for subscribers
- Resubscribe support
- Source tracking
- API endpoint: `/api/newsletter/subscribe`

### 4. **RSS Feed**
- Full RSS 2.0 support
- Available at: `/blog/rss.xml`
- Includes last 20 posts
- Proper metadata and categories

## 📊 Database Schema

### BlogPost
```prisma
- id: String (cuid)
- slug: String (unique)
- title: String
- subtitle: String?
- content: String (HTML)
- excerpt: String?
- coverImage: String?
- authorId: String
- published: Boolean
- publishedAt: DateTime?
- readTime: Int? (minutes)
- views: Int
- tags: String[]
```

### NewsletterSubscriber
```prisma
- id: String (cuid)
- email: String (unique)
- name: String?
- subscribed: Boolean
- confirmedAt: DateTime?
- unsubscribedAt: DateTime?
- source: String?
```

## 🎨 Design Principles

### Typography
- **Headings:** Serif font (font-serif)
- **Body:** Sans-serif (default)
- **Sizes:** 
  - H1: 5xl (48px)
  - H2: 3xl (30px)
  - H3: 2xl (24px)
  - Body: lg (18px)

### Colors
- **Primary:** Sky blue (#0ea5e9)
- **Text:** Gray-900 / White
- **Borders:** Gray-200 / Gray-800
- **Background:** White / Gray-900

### Spacing
- **Section padding:** py-12 to py-16
- **Content max-width:** 3xl (768px)
- **Line height:** Relaxed (1.75)

## 📝 Sample Posts Created

1. **"Why Claude Haiku is 60x Cheaper Than Opus"**
   - Tags: anthropic, pricing, optimization
   - Read time: 4 min

2. **"Caching Strategies for LLM APIs"**
   - Tags: caching, optimization, performance
   - Read time: 5 min

3. **"OpenAI vs Anthropic: Pricing Comparison 2024"**
   - Tags: openai, anthropic, pricing, comparison
   - Read time: 6 min

## 🚀 Usage

### Creating New Posts

```typescript
await prisma.blogPost.create({
  data: {
    slug: 'my-post-slug',
    title: 'My Post Title',
    subtitle: 'Optional subtitle',
    content: '<p>HTML content here</p>',
    excerpt: 'Short description',
    authorId: userId,
    published: true,
    publishedAt: new Date(),
    readTime: 5,
    tags: ['tag1', 'tag2'],
  },
});
```

### Newsletter Subscription

```bash
curl -X POST https://costlens.dev/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

### RSS Feed

Subscribe to: `https://costlens.dev/blog/rss.xml`

## 📧 Email Notifications (Future)

To send email notifications when new posts are published:

1. Query all subscribed users:
```typescript
const subscribers = await prisma.newsletterSubscriber.findMany({
  where: { subscribed: true },
});
```

2. Send email via your email service (Resend, SendGrid, etc.)

3. Track opens/clicks for engagement metrics

## 🎯 SEO Optimization

- ✅ Semantic HTML structure
- ✅ Meta descriptions
- ✅ Open Graph tags
- ✅ RSS feed for discovery
- ✅ Clean URLs (slug-based)
- ✅ Reading time for engagement
- ✅ Tags for categorization

## 📱 Mobile Responsive

- Fluid typography
- Touch-friendly buttons
- Optimized images
- Readable line lengths
- Proper spacing

## 🔧 Admin Features (To Add)

Consider adding:
- Admin dashboard for post management
- Draft/preview functionality
- Scheduled publishing
- Analytics dashboard
- Comment system
- Social sharing buttons

## 🎉 Result

You now have a **professional, Medium-style blog** with:
- Beautiful minimalist design
- Newsletter subscription
- RSS feed
- 3 sample posts
- Full dark mode support
- Mobile responsive
- SEO optimized

Visit: `http://localhost:3000/blog`
