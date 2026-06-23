import { Metadata } from "next";
import { fetchBlogById } from "@/lib/api";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const response = await fetchBlogById(id);
    if (response.status === "success" && response.data?.blog) {
      const blog = response.data.blog;
      const title = `${blog.title} | DevBits`;
      
      // Extract a simple description from the first 150 chars of content, stripping obvious markdown
      const description = blog.content
        .replace(/#+\s+/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .substring(0, 150)
        .trim() + "...";

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: "article",
          images: [
            {
              url: "/devbits-logo.png",
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: ["/devbits-logo.png"],
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch blog for metadata:", error);
  }

  return {
    title: "Blog Dispatch | DevBits",
  };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
