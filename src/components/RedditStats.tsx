import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, User, ArrowBigUp } from "lucide-react";

interface RedditStatsProps {
  topPosts: any[];
  topAuthor: { name: string; totalUpvotes: number } | null;
}

export const RedditStats = ({ topPosts, topAuthor }: RedditStatsProps) => {
  return (
    <div className="space-y-6">
      {topAuthor && (
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20 backdrop-blur">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Top Reddit Author</h3>
          </div>
          <p className="text-2xl font-bold text-accent">u/{topAuthor.name}</p>
          <p className="text-sm text-muted-foreground">{topAuthor.totalUpvotes.toLocaleString()} total upvotes</p>
        </Card>
      )}

      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border backdrop-blur">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Top 5 Most Upvoted Posts
        </h3>
        <div className="space-y-3">
          {topPosts.map((post, index) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all border border-border hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-accent">#{index + 1}</span>
                    <Badge variant="outline" className="border-accent/50">
                      r/{post.subreddit}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                  <p className="text-xs text-muted-foreground">by u/{post.author}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <ArrowBigUp className="h-4 w-4 text-accent" />
                    <span className="text-2xl font-bold text-accent">{post.upvotes.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">upvotes</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
};
