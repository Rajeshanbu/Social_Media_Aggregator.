-- Create table for GitHub issues
CREATE TABLE public.github_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  comment_count INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repository, issue_number)
);

-- Create table for Reddit posts
CREATE TABLE public.reddit_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subreddit TEXT NOT NULL,
  post_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for analytics metadata
CREATE TABLE public.analytics_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL UNIQUE,
  last_fetch TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.github_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is an analytics dashboard)
CREATE POLICY "Anyone can view GitHub issues" 
ON public.github_issues 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view Reddit posts" 
ON public.reddit_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view analytics metadata" 
ON public.analytics_metadata 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_github_issues_updated_at
BEFORE UPDATE ON public.github_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reddit_posts_updated_at
BEFORE UPDATE ON public.reddit_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_metadata_updated_at
BEFORE UPDATE ON public.analytics_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_github_issues_comment_count ON public.github_issues(comment_count DESC);
CREATE INDEX idx_github_issues_author ON public.github_issues(author);
CREATE INDEX idx_github_issues_repository ON public.github_issues(repository);
CREATE INDEX idx_reddit_posts_upvotes ON public.reddit_posts(upvotes DESC);
CREATE INDEX idx_reddit_posts_author ON public.reddit_posts(author);
CREATE INDEX idx_reddit_posts_subreddit ON public.reddit_posts(subreddit);