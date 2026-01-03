import { getBlogPostBySlug } from "@/lib/db"
import { Calendar, User, ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Default blog content
const defaultContent: Record<string, any> = {
  "boost-instagram-followers-2024": {
    title: "10 Proven Strategies to Boost Your Instagram Followers in 2024",
    content: `
      <h2>Introduction</h2>
      <p>Growing your Instagram following in 2024 requires a strategic approach that combines authentic engagement with smart growth tactics. In this comprehensive guide, we'll explore the most effective methods to increase your Instagram presence.</p>
      
      <h2>1. Optimize Your Profile</h2>
      <p>Your Instagram profile is your digital storefront. Ensure your username is searchable, your bio clearly communicates who you are, and your profile picture is high-quality and recognizable.</p>
      
      <h2>2. Post Consistently</h2>
      <p>Consistency is key on Instagram. Aim to post at least once per day, and use Instagram Insights to determine when your audience is most active.</p>
      
      <h2>3. Use Relevant Hashtags</h2>
      <p>Research and use a mix of popular and niche hashtags. Aim for 20-30 relevant hashtags per post to maximize discoverability.</p>
      
      <h2>4. Engage With Your Audience</h2>
      <p>Reply to comments, engage with your followers' content, and participate in conversations within your niche. Authentic engagement builds loyal followers.</p>
      
      <h2>5. Leverage Instagram Reels</h2>
      <p>Reels are currently favored by the Instagram algorithm. Create entertaining, valuable short-form content to reach new audiences.</p>
      
      <h2>6. Collaborate With Others</h2>
      <p>Partner with other creators in your niche for shoutouts, collaborations, or takeovers to tap into new audiences.</p>
      
      <h2>7. Use Instagram Stories</h2>
      <p>Stories keep you visible to your followers. Use polls, questions, and interactive stickers to boost engagement.</p>
      
      <h2>8. Create Shareable Content</h2>
      <p>Design content that people want to share - infographics, quotes, tutorials, and entertaining posts perform well.</p>
      
      <h2>9. Analyze and Adapt</h2>
      <p>Regularly review your Instagram Insights to understand what content performs best and adjust your strategy accordingly.</p>
      
      <h2>10. Use STABOOST Services</h2>
      <p>Accelerate your growth with STABOOST's premium Instagram services. Get real followers, likes, and engagement to boost your social proof and attract organic growth.</p>
      
      <h2>Conclusion</h2>
      <p>Growing your Instagram following takes time and consistent effort. By implementing these strategies and leveraging STABOOST's services, you can build a thriving Instagram presence that attracts your ideal audience.</p>
    `,
    excerpt:
      "Learn the most effective techniques to grow your Instagram following organically and through strategic engagement.",
    author: "STABOOST",
    featured_image: "/blog-instagram-growth.jpg",
    created_at: new Date().toISOString(),
  },
  "viral-tiktok-guide": {
    title: "How to Go Viral on TikTok: A Complete Guide",
    content: `
      <h2>The TikTok Algorithm Explained</h2>
      <p>Understanding how TikTok's algorithm works is the first step to going viral. The platform prioritizes watch time, engagement, and content relevance.</p>
      
      <h2>Create Hook-First Content</h2>
      <p>The first 1-3 seconds of your video are crucial. Start with a compelling hook that makes viewers want to watch until the end.</p>
      
      <h2>Ride Trending Sounds and Hashtags</h2>
      <p>Incorporate trending sounds and relevant hashtags to increase your content's discoverability on the For You Page.</p>
      
      <h2>Post at Optimal Times</h2>
      <p>Analyze your TikTok analytics to find when your audience is most active and schedule your posts accordingly.</p>
      
      <h2>Encourage Engagement</h2>
      <p>Ask questions, create duets, respond to comments with videos, and encourage users to share your content.</p>
      
      <h2>Boost Your TikTok with STABOOST</h2>
      <p>Get more views, followers, and engagement with STABOOST's TikTok growth services. Jumpstart your viral potential today!</p>
    `,
    excerpt:
      "Discover the secrets behind viral TikTok content and learn how to create videos that explode in popularity.",
    author: "STABOOST",
    featured_image: "/blog-tiktok-viral.jpg",
    created_at: new Date().toISOString(),
  },
  "youtube-subscribers-fast": {
    title: "YouTube Growth Hacks: Get More Subscribers Fast",
    content: `
      <h2>Optimize Your Channel</h2>
      <p>Create a compelling channel banner, write an SEO-optimized about section, and organize your content into playlists.</p>
      
      <h2>Master YouTube SEO</h2>
      <p>Research keywords, optimize your titles and descriptions, and use relevant tags to help YouTube understand and recommend your content.</p>
      
      <h2>Create Click-Worthy Thumbnails</h2>
      <p>Thumbnails are crucial for click-through rates. Use bright colors, clear text, and emotional expressions to stand out.</p>
      
      <h2>Deliver Value Consistently</h2>
      <p>Upload regularly and ensure every video provides value to your audience, whether it's entertainment, education, or inspiration.</p>
      
      <h2>Engage Your Community</h2>
      <p>Reply to comments, create community posts, and build relationships with your subscribers to foster loyalty.</p>
      
      <h2>Accelerate with STABOOST</h2>
      <p>Get more YouTube subscribers, views, and watch time with STABOOST's premium services. Build social proof and attract organic growth!</p>
    `,
    excerpt:
      "Master the art of YouTube growth with actionable tips to optimize your channel and build a loyal subscriber base.",
    author: "STABOOST",
    featured_image: "/blog-youtube-subs.jpg",
    created_at: new Date().toISOString(),
  },
  "facebook-marketing-engagement": {
    title: "Facebook Marketing: Maximize Your Engagement",
    content: `
      <h2>Understanding Facebook's Algorithm</h2>
      <p>Facebook prioritizes meaningful interactions. Focus on creating content that sparks conversations and encourages shares.</p>
      
      <h2>Mix Up Your Content Types</h2>
      <p>Use a variety of formats - images, videos, live streams, and stories - to keep your audience engaged and reach different segments.</p>
      
      <h2>Leverage Facebook Groups</h2>
      <p>Create or participate in relevant groups to build community and establish yourself as an authority in your niche.</p>
      
      <h2>Use Facebook Ads Strategically</h2>
      <p>Target your ideal audience with Facebook's powerful advertising platform to accelerate your growth and reach.</p>
      
      <h2>Boost Your Facebook Presence</h2>
      <p>STABOOST offers comprehensive Facebook growth services including page likes, post engagement, and video views to amplify your presence.</p>
    `,
    excerpt: "Unlock the full potential of Facebook marketing with strategies that drive meaningful engagement.",
    author: "STABOOST",
    featured_image: "/blog-facebook-ads.jpg",
    created_at: new Date().toISOString(),
  },
  "twitter-x-brand-growth": {
    title: "Twitter/X Growth: Building Your Brand Presence",
    content: `
      <h2>Craft Your Twitter Voice</h2>
      <p>Develop a consistent, authentic voice that resonates with your target audience and sets you apart from the crowd.</p>
      
      <h2>Tweet Strategically</h2>
      <p>Post during peak hours, use threads for longer content, and engage with trending topics relevant to your niche.</p>
      
      <h2>Build Relationships</h2>
      <p>Reply to others, quote tweet thoughtfully, and participate in Twitter chats to grow your network organically.</p>
      
      <h2>Use Visuals and Video</h2>
      <p>Tweets with images and videos get significantly more engagement. Incorporate multimedia into your content strategy.</p>
      
      <h2>Grow Faster with STABOOST</h2>
      <p>Get more Twitter/X followers, retweets, and likes with STABOOST's services to boost your credibility and reach.</p>
    `,
    excerpt: "Build a powerful presence on Twitter/X with expert strategies for engagement and thought leadership.",
    author: "STABOOST",
    featured_image: "/blog-twitter-growth.jpg",
    created_at: new Date().toISOString(),
  },
  "social-media-playbook-2024": {
    title: "Social Media Marketing: The Complete 2024 Playbook",
    content: `
      <h2>Cross-Platform Strategy</h2>
      <p>Learn how to maintain a cohesive brand presence across multiple social platforms while tailoring content for each.</p>
      
      <h2>Content Repurposing</h2>
      <p>Maximize your content by adapting it for different platforms - turn a YouTube video into Reels, tweets, and blog posts.</p>
      
      <h2>Analytics and Optimization</h2>
      <p>Track your performance across platforms and use data to continuously improve your social media strategy.</p>
      
      <h2>Building a Content Calendar</h2>
      <p>Plan your content in advance with a comprehensive calendar that ensures consistent posting and strategic campaigns.</p>
      
      <h2>Supercharge Your Growth</h2>
      <p>STABOOST offers services for all major social platforms. Grow your presence everywhere with our comprehensive social media marketing solutions.</p>
    `,
    excerpt: "Your comprehensive guide to social media marketing success across all major platforms.",
    author: "STABOOST",
    featured_image: "/blog-social-media.jpg",
    created_at: new Date().toISOString(),
  },
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post = await getBlogPostBySlug(slug)

  // Use default content if post not found in database
  if (!post && defaultContent[slug]) {
    post = defaultContent[slug]
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-80 md:h-96 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        <img
          src={post.featured_image || "/placeholder.svg?height=400&width=800&query=social media marketing blog"}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <span className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full">Growth Tips</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>

          <div className="flex flex-wrap gap-6 mb-8 text-muted-foreground border-b pb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />5 min read
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-primary/5 rounded-2xl border-2 border-primary/20 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Social Media?</h3>
            <p className="text-muted-foreground mb-6">
              STABOOST offers premium social media growth services to help you reach your goals faster.
            </p>
            <Link href="/register">
              <Button size="lg" className="px-8">
                Get Started Now
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
