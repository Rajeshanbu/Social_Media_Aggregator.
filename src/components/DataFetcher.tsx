import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

export const DataFetcher = () => {
  const [repositories, setRepositories] = useState("facebook/react,microsoft/vscode");
  const [subreddits, setSubreddits] = useState("reactjs,programming");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const repoArray = repositories.split(',').map(r => r.trim()).filter(Boolean);
      const subredditArray = subreddits.split(',').map(s => s.trim()).filter(Boolean);

      // Fetch GitHub data
      const { error: githubError } = await supabase.functions.invoke('github-fetch', {
        body: { repositories: repoArray },
      });

      if (githubError) throw githubError;

      // Fetch Reddit data
      const { error: redditError } = await supabase.functions.invoke('reddit-fetch', {
        body: { subreddits: subredditArray },
      });

      if (redditError) throw redditError;

      toast({
        title: "Success!",
        description: "Data fetched and stored successfully.",
      });

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border backdrop-blur">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-primary" />
        Fetch Data
      </h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="repositories">GitHub Repositories (comma-separated)</Label>
          <Input
            id="repositories"
            value={repositories}
            onChange={(e) => setRepositories(e.target.value)}
            placeholder="owner/repo, owner/repo"
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">Example: facebook/react,microsoft/vscode</p>
        </div>
        <div>
          <Label htmlFor="subreddits">Reddit Subreddits (comma-separated)</Label>
          <Input
            id="subreddits"
            value={subreddits}
            onChange={(e) => setSubreddits(e.target.value)}
            placeholder="subreddit, subreddit"
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">Example: reactjs,programming</p>
        </div>
        <Button 
          onClick={fetchData} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Fetch Data
        </Button>
      </div>
    </Card>
  );
};
