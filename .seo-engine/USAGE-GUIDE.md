━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 SEO ENGINE — USAGE GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This guide explains all the commands and workflows for the SEO Content Engine.

Type these prompts into Claude Code. Or describe what you want naturally—Claude Code reads the engine data first.

---

## BASIC COMMANDS

### Write a Blog

```
"Write the next blog"
```
→ Picks the next high-priority unblocked blog from content-queue.yaml
→ Checks SERP data (if available) or asks you to provide it
→ Drafts full blog with frontmatter
→ Saves as draft (requires your review)
→ Updates all tracking files automatically

### Write a Specific Blog Topic

```
"Write a blog about [topic]"
```
Example: "Write a blog about college event payment processing"

→ Searches content-queue.yaml for matching topic
→ Checks for cannibalization (overlapping keywords)
→ Drafts blog with your angle
→ Saves as draft

### Write Based on Competitor

```
"Write a comparison: MyFestivo vs [Competitor]"
```
Example: "Write a comparison: MyFestivo vs Eventbrite"

→ Uses competitor data from competitors.yaml
→ Pulls feature matrix (what they support vs us)
→ Writes honest comparison (strengths first)
→ Saves as draft

### Write the Pillar Page for a Cluster

```
"Write the pillar page for [cluster]"
```
Example: "Write the pillar page for college event management"

→ Looks up cluster from topic-clusters.yaml
→ ASKS for SERP data before proceeding (required to get it right)
→ Writes comprehensive 2500-3500 word guide
→ Saves as draft with all cluster pages noted for linking

---

## REVIEW & PUBLISH

### Review Before Publishing

```
"Review blog [slug] before publishing"
```
Example: "Review blog college-event-management-guide before publishing"

→ Reads the blog from filesystem
→ Checks against quality criteria (SEO, E-E-A-T, linking, tone)
→ Provides structured feedback with score
→ Tells you if it's ready to publish or needs changes

### Approve a Blog (Publish)

```
"Approve blog [slug]"
```
Example: "Approve blog college-event-management-guide"

→ Marks blog status as "published" in content-queue.yaml
→ Updates content-map.yaml to register it
→ Updates topic-clusters.yaml to mark cluster page published
→ Backlinks to features.yaml and competitors.yaml
→ Updates changelog
→ Blog is now published (you move it to live blog directory)

### Request Changes Before Publishing

```
"Blog [slug] needs changes: [your feedback]"
```
Example: "Blog college-event-management-guide needs changes: make the payment example more specific with actual pricing"

→ Updates blog file with your feedback
→ Re-drafts section based on your input
→ Saves as draft again (needs re-review)
→ Logs change in changelog

---

## RESEARCH & DATA GATHERING

### Provide SERP Data for a Blocked Blog

Format: Copy-paste your Google search results

```
SERP Research Results for: "college event management"

Top Results:
1. Title: "How to Organize a College Event (2024 Guide)" | URL: example.com/college-event-guide
2. Title: "Best College Event Planning Tools" | URL: example.com/best-tools
3. ...

People Also Ask:
- How do you plan a college event?
- What is the best event management software?
- ...

Related Searches:
- college event planning budget
- college event ideas
- free college event management
```

→ Claude Code uses this data to set SERP intent
→ Designs blog structure to match what ranks
→ Writes optimized content
→ Unblocks blog in queue

### Import Keywords

```
"Import keywords: [paste data]"
```
Or attach a CSV file with columns: keyword, search_volume, keyword_difficulty, intent

→ Merges into seo-keywords.csv
→ Assigns to existing clusters where applicable
→ Creates new cluster ideas if needed
→ Maps to features in features.yaml
→ Recalculates queue priorities

### Update Competitor Data

```
"[Competitor] now supports [feature]"
```
Example: "iCommunify now supports payment processing"

→ Updates competitors.yaml feature matrix
→ Changes confidence level from "unverified" to "verified"
→ Logs update in changelog
→ Flags any affected blog ideas that might need updates

---

## PROJECT UPDATES

### Add a New Feature

```
"New feature: [feature name] at [doc_path]"
```
Example: "New feature: AI event summary generator at src/components/event/EventSummary.tsx"

→ Adds to features.yaml
→ Identifies which clusters it fits
→ Checks if existing blogs need updates
→ Generates blog ideas to cover the new feature
→ Adds to content-queue.yaml as lower-priority supporting content

### Scan New Documentation

```
"Scan new docs at [path]"
```
Example: "Scan new docs at docs/api-reference"

→ Finds all new features/endpoints
→ Adds to features.yaml
→ Checks for blog opportunities
→ Updates queue

### Update Blog (Post-Publication)

```
"Update blog [slug]: [changes needed]"
```
Example: "Update blog college-event-management-guide: add new task automation feature to task management section"

→ Reads live blog from filesystem
→ Updates specific sections
→ Re-publishes with updated date
→ Logs change in changelog

---

## AUDITS & ANALYSIS

### Content Audit

```
"Run a content audit"
```

→ Scans all published blogs in content-map.yaml
→ Checks: keyword coverage, cannibalization, freshness, linking
→ Produces report with: gaps to fill, redundant content, opportunities
→ Suggests blogs to update or remove

### Cannibalization Check

```
"Check keyword cannibalization"
```

→ Scans seo-keywords.csv and mapped target keywords
→ Identifies blogs competing for same keywords
→ Recommends: consolidating blogs, adjusting angles, or changing targets
→ Prevents waste (two blogs targeting same keyword)

### What Should I Write Next?

```
"What should I write next?"
```

→ Analyzes content-queue.yaml priorities
→ Checks what SERP data you've provided
→ Recommends top unblocked blogs
→ If all blocked: suggests workarounds (skip research or request SERP)
→ Outputs clear next action

### Cluster Status

```
"Show topic cluster status"
```

→ Lists all clusters
→ Shows: pillar status, # cluster pages published, # planned
→ Identifies under-covered clusters
→ Recommends where to write next

---

## CONFIGURATION

### View Current Settings

```
"Show SEO engine config"
```

→ Displays config.yaml in readable format
→ Shows: project info, author, competitors, keywords, content settings
→ Points you to where changes can be made

### Update Configuration

```
"Update config: [setting] = [new value]"
```
Example: "Update config: CTA text = 'Start your free event now'"

→ Modifies .seo-engine/config.yaml
→ Updates all related blogs with new CTA (if flagged)
→ Logs change in changelog

Examples of editable config:
- Author info (name, title, bio, website)
- Trust signals (review links, testimonials, metrics)
- Content settings (word count limits, tone, CTA)
- Competitors (add/remove/update)
- Primary topics (expand keyword list)

---

## WORKFLOW EXAMPLES

### Scenario 1: Start Writing (No SERP Data Yet)

1. User: "What should I write next?"
   → Claude suggests: MyFestivo vs Eventbrite (high priority, unblocked)
   
2. User: "Write a comparison: MyFestivo vs Eventbrite"
   → Claude Code writes blog, saves as draft
   
3. User: "Review blog myfestivo-vs-eventbrite"
   → Claude provides feedback
   
4. User: "Approve blog myfestivo-vs-eventbrite"
   → Published, registered in content-map, updates clusters

### Scenario 2: Provide SERP Data & Write Pillar

1. User can't write pillar yet (blocked):
   ```
   "Provide SERP data for college event management"
   
   Top Results:
   1. "How to Organize College Events" | example.com/...
   2. "Best Event Management Platforms" | example.com/...
   ...
   ```
   → Unblocks q_001

2. User: "Write the pillar page for college event management"
   → Claude writes comprehensive 3000-word guide
   → Saves with all cluster pages linked
   
3. User: "Approve blog college-event-management-guide"
   → Published, becomes foundation for cluster pages

### Scenario 3: New Feature Release → Content Opportunities

1. User: "New feature: AI event summary, saves at src/components/event/EventSummary.tsx"
   → Feature added to features.yaml
   → Blog ideas generated
   
2. User: "What blogs should cover the new AI feature?"
   → Claude lists opportunities for existing pillars + new cluster pages
   
3. User: "Write a cluster page: AI summaries for event organizers"
   → Claude mentions new feature in context of analytics/insights pillar

### Scenario 4: Competitive Intelligence → Content Updates

1. User: "Eventbrite released event templates"
   → Updates competitors.yaml
   
2. User: "Run a content audit"
   → Audit finds: "Comparison blog myfestivo-vs-eventbrite may need update"
   
3. User: "Update blog myfestivo-vs-eventbrite: add section on templates feature"
   → Blog updated and re-published with new info

---

## AUTOMATION & SUB-AGENTS

Claude Code uses sub-agents aggressively for parallel work:

- **Doc scanning**: One sub-agent per batch of 15-20 files
- **Blog writing**: Subagent for research, drafting, updates simultaneously
- **Data generation**: Parallel subagents for different data files
- **Audits**: Subagent scans all blogs in parallel

**You don't need to do anything special**—just ask normally. Claude Code automatically:
- Uses subagents for independent tasks
- Merges results without duplication
- Logs all actions in changelog

---

## ERROR RECOVERY

### Blog Doesn't Exist

```
"Blog [slug] not found. Did you mean [suggestion]?"
```

→ Claude searches content-map.yaml and content-queue for similar slugs
→ Suggests corrections

### Keyword Cannibalization Conflict

```
"Database shows blogs [slug1] and [slug2] target the same keyword"
```

→ Claude suggests: consolidate, update angle, or change target keyword
→ Allows you to approve merge/update

### SERP Data Blocked All Pillars

```
"All pillar pages blocked on SERP data. Options:
1. Provide SERP results (I'll use them)
2. Skip pillars, write clusters first
3. Ask me to research (I'll ask YOU to provide results)"
```

→ You choose path forward

---

## BEST PRACTICES CHECKLIST

Before asking for a blog to be published:

- [ ] Blog includes primary keyword in title, first paragraph, one H2, description, slug
- [ ] Blog has 4+ internal links to relevant content
- [ ] Blog includes at least ONE E-E-A-T signal (experience, expertise, metric, quote)
- [ ] Blog links to pillar (if cluster page) or links to all cluster pages (if pillar)
- [ ] Blog has a soft CTA at the end (not throughout)
- [ ] Blog tone matches voice guide (professional-helpful, not salesy)
- [ ] If comparison blog: mentions competitor strengths honestly
- [ ] FAQ section addresses real questions (from SERP data if available)
- [ ] Word count meets minimum (1200+ words)
- [ ] No fabricated data or competitor claims without sources
- [ ] Images include descriptive alt text

---

## QUESTIONS?

All questions about topics, blogging strategy, SEO, or the engine itself →

Ask Claude Code naturally. It will:
1. Read all .seo-engine/ files
2. Answer based on config and data
3. Suggest actionable next steps

Example questions that work:
- "Should I write MyFestivo vs iCommunify or MyFestivo vs Eventbrite first?"
- "What keywords should I target to rank fastest?"
- "Why is college event management marked as high priority?"
- "How long should the comparison blog be?"
- "Can I write about a topic not in the queue?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
