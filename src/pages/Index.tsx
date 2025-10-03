import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GitHubStats } from "@/components/GitHubStats";
import { RedditStats } from "@/components/RedditStats";
import { DataFetcher } from "@/components/DataFetcher";
import { Loader2, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analytics');
      
      if (error) throw error;
      
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Social Media Aggregator
            </h1>
          </div>
          <p className="text-muted-foreground">
            Analytics dashboard for GitHub issues and Reddit posts
          </p>
        </header>

        <div className="mb-8">
          <DataFetcher />
        </div>

        {analytics && (
          <Tabs defaultValue="github" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="github">GitHub</TabsTrigger>
              <TabsTrigger value="reddit">Reddit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="github" className="space-y-4">
              <GitHubStats
                topIssues={analytics.github?.topIssues || []}
                topAuthor={analytics.github?.topAuthor}
                topRepository={analytics.github?.topRepository}
              />
            </TabsContent>
            
            <TabsContent value="reddit" className="space-y-4">
              <RedditStats
                topPosts={analytics.reddit?.topPosts || []}
                topAuthor={analytics.reddit?.topAuthor}
              />
            </TabsContent>
          </Tabs>
        )}

        {analytics && analytics.metadata && analytics.metadata.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Last updated: {new Date(analytics.metadata[0]?.last_fetch).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
