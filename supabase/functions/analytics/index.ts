import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get top 5 GitHub issues by comment count
    const { data: topIssues } = await supabase
      .from('github_issues')
      .select('*')
      .order('comment_count', { ascending: false })
      .limit(5);
    
    // Get top GitHub author by issue count
    const { data: githubAuthors } = await supabase
      .from('github_issues')
      .select('author');
    
    const authorCounts = githubAuthors?.reduce((acc: any, issue: any) => {
      acc[issue.author] = (acc[issue.author] || 0) + 1;
      return acc;
    }, {});
    
    const topGithubAuthor = authorCounts
      ? Object.entries(authorCounts).sort((a: any, b: any) => b[1] - a[1])[0]
      : null;
    
    // Get repository with most open issues
    const { data: openIssues } = await supabase
      .from('github_issues')
      .select('repository')
      .eq('state', 'open');
    
    const repoCounts = openIssues?.reduce((acc: any, issue: any) => {
      acc[issue.repository] = (acc[issue.repository] || 0) + 1;
      return acc;
    }, {});
    
    const topRepo = repoCounts
      ? Object.entries(repoCounts).sort((a: any, b: any) => b[1] - a[1])[0]
      : null;
    
    // Get top 5 Reddit posts by upvotes
    const { data: topPosts } = await supabase
      .from('reddit_posts')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(5);
    
    // Get Reddit author with highest total upvotes
    const { data: redditPosts } = await supabase
      .from('reddit_posts')
      .select('author, upvotes');
    
    const authorUpvotes = redditPosts?.reduce((acc: any, post: any) => {
      acc[post.author] = (acc[post.author] || 0) + post.upvotes;
      return acc;
    }, {});
    
    const topRedditAuthor = authorUpvotes
      ? Object.entries(authorUpvotes).sort((a: any, b: any) => b[1] - a[1])[0]
      : null;
    
    // Get metadata
    const { data: metadata } = await supabase
      .from('analytics_metadata')
      .select('*');
    
    return new Response(
      JSON.stringify({
        github: {
          topIssues: topIssues || [],
          topAuthor: topGithubAuthor
            ? { name: topGithubAuthor[0], count: topGithubAuthor[1] }
            : null,
          topRepository: topRepo
            ? { name: topRepo[0], openIssues: topRepo[1] }
            : null,
        },
        reddit: {
          topPosts: topPosts || [],
          topAuthor: topRedditAuthor
            ? { name: topRedditAuthor[0], totalUpvotes: topRedditAuthor[1] }
            : null,
        },
        metadata: metadata || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
