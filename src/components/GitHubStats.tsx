import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, GitFork } from "lucide-react";

interface GitHubStatsProps {
  topIssues: any[];
  topAuthor: { name: string; count: number } | null;
  topRepository: { name: string; openIssues: number } | null;
}

export const GitHubStats = ({ topIssues, topAuthor, topRepository }: GitHubStatsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {topAuthor && (
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Top Contributor</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{topAuthor.name}</p>
            <p className="text-sm text-muted-foreground">{topAuthor.count} issues created</p>
          </Card>
        )}
        
        {topRepository && (
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-accent/20 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <GitFork className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Most Active Repo</h3>
            </div>
            <p className="text-2xl font-bold text-accent">{topRepository.name}</p>
            <p className="text-sm text-muted-foreground">{topRepository.openIssues} open issues</p>
          </Card>
        )}
      </div>

      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border backdrop-blur">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Top 5 Most Discussed Issues
        </h3>
        <div className="space-y-3">
          {topIssues.map((issue, index) => (
            <a
              key={issue.id}
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all border border-border hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                      {issue.state}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-1 truncate">{issue.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {issue.repository} • by {issue.author}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-primary">{issue.comment_count}</span>
                  <span className="text-xs text-muted-foreground">comments</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
};
