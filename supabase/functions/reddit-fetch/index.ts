import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RedditPost {
  data: {
    id: string;
    title: string;
    author: string;
    ups: number;
    permalink: string;
    subreddit: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subreddits } = await req.json();
    
    if (!subreddits || !Array.isArray(subreddits)) {
      throw new Error('subreddits array is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const redditClientId = Deno.env.get('REDDIT_CLIENT_ID')!;
    const redditClientSecret = Deno.env.get('REDDIT_CLIENT_SECRET')!;
    const redditUserAgent = Deno.env.get('REDDIT_USER_AGENT')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get Reddit access token
    const authString = btoa(`${redditClientId}:${redditClientSecret}`);
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': redditUserAgent,
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to get Reddit access token');
    }
    
    const { access_token } = await tokenResponse.json();
    
    console.log(`Fetching posts from ${subreddits.length} subreddits...`);
    
    const allPosts: any[] = [];
    
    // Fetch posts from each subreddit
    for (const subreddit of subreddits) {
      try {
        const response = await fetch(
          `https://oauth.reddit.com/r/${subreddit}/hot?limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'User-Agent': redditUserAgent,
            },
          }
        );
        
        if (!response.ok) {
          console.error(`Failed to fetch posts from r/${subreddit}: ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        const posts: RedditPost[] = data.data.children;
        
        for (const post of posts) {
          allPosts.push({
            subreddit: subreddit,
            post_id: post.data.id,
            title: post.data.title,
            author: post.data.author,
            upvotes: post.data.ups,
            url: `https://reddit.com${post.data.permalink}`,
          });
        }
        
        console.log(`Fetched posts from r/${subreddit}`);
      } catch (error) {
        console.error(`Error fetching posts from r/${subreddit}:`, error);
      }
    }
    
    // Insert or update posts in database
    if (allPosts.length > 0) {
      const { error: upsertError } = await supabase
        .from('reddit_posts')
        .upsert(allPosts, {
          onConflict: 'post_id',
        });
      
      if (upsertError) {
        throw upsertError;
      }
    }
    
    // Update metadata
    await supabase
      .from('analytics_metadata')
      .upsert({
        source: 'reddit',
        last_fetch: new Date().toISOString(),
        status: 'success',
      }, {
        onConflict: 'source',
      });
    
    console.log(`Successfully stored ${allPosts.length} Reddit posts`);
    
    return new Response(
      JSON.stringify({
        success: true,
        posts_fetched: allPosts.length,
        subreddits: subreddits.length,
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
