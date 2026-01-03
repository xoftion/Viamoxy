import { getBlogPosts } from "@/lib/db"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, ArrowRight, Sparkles } from "lucide-react"

export default async function BlogPage() {
  const posts = await getBlogPosts(true)

  const blogImages = [
    "/blog-instagram-growth.jpg",
    "/blog-tiktok-viral.jpg",
    "/blog-youtube-subs.jpg",
    "/blog-facebook-ads.jpg",
    "/blog-twitter-growth.jpg",
    "/blog-social-media.jpg",
  ]

  // Default posts if database is empty
  const defaultPosts = [
    {
      id: 1,
      title: "10 Proven Strategies to Boost Your Instagram Followers in 2024",
      slug: "boost-instagram-followers-2024",
      excerpt:
        "Learn the most effective techniques to grow your Instagram following organically and through strategic engagement. These proven methods have helped thousands of users increase their reach.",
      author: "STABOOST",
      created_at: new Date().toISOString(),
      featured_image: "/blog-instagram-growth.jpg",
    },
    {
      id: 2,
      title: "How to Go Viral on TikTok: A Complete Guide",
      slug: "viral-tiktok-guide",
      excerpt:
        "Discover the secrets behind viral TikTok content. From timing to trends, learn what makes videos explode in popularity and how you can apply these principles to your content.",
      author: "STABOOST",
      created_at: new Date().toISOString(),
      featured_image: "/blog-tiktok-viral.jpg",
    },
    {
      id: 3,
      title: "YouTube Growth Hacks: Get More Subscribers Fast",
      slug: "youtube-subscribers-fast",
      excerpt:
        "Master the art of YouTube growth with these actionable tips. Learn how to optimize your channel, create engaging thumbnails, and build a loyal subscriber base.",
      author: "STABOOST",
      created_at: new Date().toISOString(),
      featured_image: "/blog-youtube-subs.jpg",
    },
    {
      id: 4,
      title: "Facebook Marketing: Maximize Your Engagement",
      slug: "facebook-marketing-engagement",
      excerpt:
        "Unlock the full potential of Facebook marketing. From posts to ads, learn how to create content that resonates with your audience and drives meaningful engagement.",
      author: "STABOOST",
      created_at: new Date().toISOString(),
      featured_image: "/blog-facebook-ads.jpg",
    },
    {
      id: 5,
      title: "Twitter/X Growth: Building Your Brand Presence",
      slug: "twitter-x-brand-growth",
      excerpt:
        "Build a powerful presence on Twitter/X with these expert strategies. Learn how to craft engaging tweets, grow your following, and establish thought leadership.",
      author: "STABOOST",
      created_at: new Date().toISOString(),
      featured_image: "/blog-twitter-growth.jpg",
    },
    {
      id: 6,
      title: "Social Media Marketing: The Complete 2024 Playbook",
      slug: "social-media-playbook-2024",
      excerpt:
        "Your comprehensive guide to social media marketing success. Cover all platforms, learn cross-promotion strategies, and build a cohesive brand presence online.",
      author: "STABOOST",
      created_at: new Date().toISOString(),
      featured_image: "/blog-social-media.jpg",
    },
  ]

  const displayPosts = posts.length > 0 ? posts : defaultPosts

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Learn & Grow</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">STABOOST Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tips, strategies, and best practices for social media growth
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post: any, index: number) => (
            <Card
              key={post.id}
              className="group h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-primary/20"
            >
              <div className="relative h-52 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                <img
                  src={post.featured_image || blogImages[index % blogImages.length]}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Growth Tips
                  </span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <h2 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3 text-sm">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                </div>
                <Link href={`/blog/${post.slug}`} className="block">
                  <Button className="w-full group/btn">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
