import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubIssue {
  number: number;
  title: string;
  user: { login: string };
  comments: number;
  state: string;
  html_url: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repositories } = await req.json();
    
    if (!repositories || !Array.isArray(repositories)) {
      throw new Error('repositories array is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const githubToken = Deno.env.get('GITHUB_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Fetching issues from ${repositories.length} repositories...`);
    
    const allIssues: any[] = [];
    
    // Fetch issues from each repository
    for (const repo of repositories) {
      try {
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await fetch(
            `https://api.github.com/repos/${repo}/issues?state=all&per_page=100&page=${page}`,
            {
              headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );
          
          if (!response.ok) {
            console.error(`Failed to fetch issues from ${repo}: ${response.statusText}`);
            break;
          }
          
          const issues: GitHubIssue[] = await response.json();
          
          if (issues.length === 0) {
            hasMore = false;
            break;
          }
          
          // Filter out pull requests (they appear as issues in the API)
          const actualIssues = issues.filter(issue => !issue.html_url.includes('/pull/'));
          
          for (const issue of actualIssues) {
            allIssues.push({
              repository: repo,
              issue_number: issue.number,
              title: issue.title,
              author: issue.user.login,
              comment_count: issue.comments,
              state: issue.state,
              url: issue.html_url,
            });
          }
          
          page++;
        }
        
        console.log(`Fetched issues from ${repo}`);
      } catch (error) {
        console.error(`Error fetching issues from ${repo}:`, error);
      }
    }
    
    // Insert or update issues in database
    if (allIssues.length > 0) {
      const { error: upsertError } = await supabase
        .from('github_issues')
        .upsert(allIssues, {
          onConflict: 'repository,issue_number',
        });
      
      if (upsertError) {
        throw upsertError;
      }
    }
    
    // Update metadata
    await supabase
      .from('analytics_metadata')
      .upsert({
        source: 'github',
        last_fetch: new Date().toISOString(),
        status: 'success',
      }, {
        onConflict: 'source',
      });
    
    console.log(`Successfully stored ${allIssues.length} GitHub issues`);
    
    return new Response(
      JSON.stringify({
        success: true,
        issues_fetched: allIssues.length,
        repositories: repositories.length,
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
