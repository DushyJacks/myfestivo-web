# SEO Content Engine — MyFestivo

This project includes a comprehensive **SEO Content Engine** for generating SEO-optimized blog content backed by feature data, competitor intelligence, keyword research, and topical authority mapping.

---

## ✅ CRITICAL RULE — READ BEFORE EVERY TASK

**For ANY task involving blogs, content, SEO, keywords, competitors, documentation, or feature discovery:**

**→ ALWAYS read `.seo-engine/config.yaml` and the relevant data files FIRST.**

This includes: writing, evaluating, reviewing, editing, auditing, planning, or answering questions about content.

**Never rely on default behavior — always check the engine data.**

---

## 📂 ENGINE STRUCTURE

```
.seo-engine/
├── config.yaml                    ← Project settings, author, competitors, SEO setup
├── data/
│   ├── features.yaml              ← Feature registry (70+ items)
│   ├── competitors.yaml           ← Competitor matrix + strategies
│   ├── seo-keywords.csv           ← Seed keywords + mapping
│   ├── content-map.yaml           ← Published blogs register here
│   ├── content-queue.yaml         ← 20 prioritized blog ideas
│   └── topic-clusters.yaml        ← 12 pillar pages + 58 cluster pages
├── templates/
│   ├── blog-frontmatter.yaml      ← MDX frontmatter template
│   ├── blog-structures.yaml       ← 7 blog type structures
│   └── tone-guide.md              ← Voice, style, E-E-A-T rules
├── logs/
│   └── changelog.md               ← Activity log
└── USAGE-GUIDE.md                 ← Complete command reference
```

---

## 🚀 QUICK START

### Type ONE of these:

```
"Write the next blog"                              → Picks top priority
"Write a blog about [topic]"                       → Specific topic
"Write a comparison: MyFestivo vs [Competitor]"    → Competitor vs
"What should I write next?"                        → Recommendations
"Review blog [slug]"                               → Quality check
"Approve blog [slug]"                              → Publish
"Show SEO engine config"                           → View settings
```

→ See `.seo-engine/USAGE-GUIDE.md` for full command reference.

---

## 📋 UNIVERSAL WORKFLOW

**Before writing any blog:**

1. Read `.seo-engine/config.yaml` → Project context
2. Read `.seo-engine/data/content-queue.yaml` → Blog ideas + priorities
3. Read `.seo-engine/templates/tone-guide.md` → Voice rules
4. Check `.seo-engine/data/seo-keywords.csv` → Target keywords
5. Check `.seo-engine/data/topic-clusters.yaml` → Pillar/cluster mapping
6. Check `.seo-engine/data/competitors.yaml` → Competitor intelligence

**For competitor blogs:**
- Read competitors.yaml feature matrix first
- Lead with competitor strengths
- Use honest trade-off language ("MyFestivo is better at X, they're better at Y")

**For pillar pages:**
- BLOCKED if SERP data not provided
- Ask user: "Please Google '[keyword]' and provide top 5 results + People Also Ask"
- Do NOT write pillar without real SERP data

**For cluster pages:**
- Link to pillar page
- Link to 2-4 other related content
- Include at least 1 E-E-A-T signal
- One soft CTA at end only

**For all blogs:**
- No superlatives without proof ("best" = must have earned it)
- Never fabricate features or customer claims
- Cite competitors.yaml confidence level ("verified" vs "unverified" vs "from_blog")
- Check cannibalization (two blogs targeting same keyword = problem)
- Save as draft (status: "review") until human approves

---

## 🔍 FILE REFERENCE

| File | Purpose | When Read |
|------|---------|-----------|
| `config.yaml` | Settings, author, trust signals, SEO setup | Before EVERY task |
| `features.yaml` | Feature registry with categories | Before writing any blog |
| `competitors.yaml` | Competitor matrix + strategies | Before competitor blogs |
| `seo-keywords.csv` | Keywords + SERP data | Before choosing blog topic |
| `content-map.yaml` | Published blogs register here | Checking what's published |
| `content-queue.yaml` | 20 prioritized blog ideas | When deciding what to write |
| `topic-clusters.yaml` | Pillar + cluster architecture | Before writing cluster page |
| `blog-frontmatter.yaml` | Frontmatter format rules | Before generating blog |
| `blog-structures.yaml` | Outlines by blog type | When structuring blog |
| `tone-guide.md` | Voice, style, E-E-A-T rules | Before WRITING |
| `changelog.md` | Activity audit trail | After every action |
| `USAGE-GUIDE.md` | All commands explained | For command reference |

---

## 🎯 CORE RULES

### 1. Never Fabricate Data
- ✗ Don't claim feature support without checking features.yaml
- ✗ Don't make competitor claims without competitors.yaml verification
- ✓ Always cite source if confidence < "verified"

### 2. SERP Intent Matching
**Before writing, match content format to SERP intent:**

| If SERP shows… | Write a… | NOT a… |
|---|---|---|
| All product pages | comparison/review | pure guide |
| All how-to guides | how-to/tutorial | comparison |
| Mix of guides + tools | how-to with tools | pure guide |
| All listicles | listicle/comparison | deep-dive |

**Rule: Never fight the SERP.**

### 3. E-E-A-T is Mandatory
Every blog MUST include ≥1 of:
- **Experience**: "In our work with X college events…"
- **Expertise**: "We've helped 50+ college organizers…"
- **Authoritativeness**: "Analysis of 1000+ events shows…"
- **Trustworthiness**: "One honest limitation: …" + honest weaknesses

### 4. Cannibalization Check Before Writing
- Search `content-map.yaml` for existing blogs targeting same keyword
- If conflict: update the existing blog OR choose different angle
- Prevent waste: one keyword = one blog

### 5. Competitor Mentions = Balanced
- Lead with competitor STRENGTHS
- Then mention trade-offs
- Link to their website (transparent, fair)
- Use data from competitors.yaml
- Cite confidence level (verified/unverified/from_blog)

### 6. Pillar Pages Need SERP Data
- Pillar pages are BLOCKED until you provide real SERP data
- Ask user: "Please Google '[keyword]' and share: top 5 results, PAA, related searches"
- Design pillar structure AFTER seeing SERP intent
- Do NOT write pillar blind

### 7. Cluster Pages Link to Pillar
- Every cluster page → must link to pillar
- Pillar → must link to all published cluster pages
- Non-negotiable for topical authority

### 8. One Soft CTA Per Blog
- CTA appears ONE time, at end of article
- Not forceful: "Try MyFestivo free — no credit card required"
- Never appears in intro, middle, multiple times

### 9. Honest About Limitations
- Don't gloss over where MyFestivo is weaker
- Admit when competitors are better at something
- Transparent about pricing and trade-offs

### 10. Update All Files After Publishing
When a blog is published:
- Register in `content-map.yaml`
- Update `features.yaml` blog_refs
- Update `seo-keywords.csv` mapped_blog_slugs
- Update `content-queue.yaml` status → "published"
- Update `topic-clusters.yaml` if part of cluster
- Log in `changelog.md`

---

## 🛠️ SERP RESEARCH CRITICAL RULE

**NEVER use built-in web search for SERP data. It produces generic results.**

**You MUST do ONE of:**

1. **Preferred:** Ask user to Google keyword and provide real results:
   ```
   Before I write, I need SERP data for: "college event management"
   Please search this on Google and provide:
   - Top 3-5 ranking page titles + URLs
   - People Also Ask questions (4-6)
   - Related searches from bottom of Google
   ```
   Then WAIT for response.

2. **Alternative:** If SEO MCP tool (Semrush, Ahrefs) connected → use that
3. **Not Acceptable:** Your own web search or guessing

**Why?** Your web search gives generic results. Real Google shows:
- Featured snippets (if any)
- People Also Ask layout (not just questions)
- Ad blocks (shows ad intent)
- Related searches (not generic variations)
- Exact SERP format and intent signals

This ensures blogs are written AGAINST real competition, not guesses.

---

## 📝 BLOG WRITING WORKFLOW

### STEP 1: Choose Blog & Check Blockers
- Read `content-queue.yaml`
- Pick next high-priority unblocked blog
- If pillar: Check if SERP data provided. If not: Ask user.

### STEP 2: Pre-Writing Research
- Read `features.yaml` → reference available features
- Read `competitors.yaml` → prepare for honest comparisons
- Read `seo-keywords.csv` → confirm target keyword + mapped features
- Read `topic-clusters.yaml` → identify pillar + other cluster pages
- Read `tone-guide.md` → prepare voice for this blog type

### STEP 3: Cannibalization Check
- Search `content-map.yaml` for existing blogs targeting same keyword
- If conflict: ask user to update existing blog OR change angle
- Only proceed if unique angle confirmed

### STEP 4: Define Unique Angle
- What's missing from what currently ranks?
- "More comprehensive" = NOT an angle
- "College-specific pain point: WhatsApp chaos" = angle
- One sentence description

### STEP 5: Draft Blog
- Use structure from `blog-structures.yaml` for this blog type
- Voice from `tone-guide.md` — match the tone
- Frontmatter from `blog-frontmatter.yaml` template
  - Title ≤ 60 chars, includes primary keyword
  - Description ≤ 160 chars, click-worthy
  - Slug ≤ 5 words, kebab-case
- Primary keyword in: title, first paragraph, one H2, description, slug
- Secondary keywords naturally placed
- Internal links: 4-8 links minimum
  - Prioritize pillar (if cluster page)
  - Varied anchor text
  - Strategic link placement (not all at end)
- External links: 1-2 to authority (not competitors)
- Include FAQ section with real questions (from SERP data)
- Include ≥1 E-E-A-T signal

### STEP 6: Inject E-E-A-T
- Lead with experience: "In working with X college events…"
- Include metric: "Analysis of 1000+ events shows…"
- Add honest limitation: "One trade-off to consider…"
- Quote testimonial: "As a student organizer told us…"

### STEP 7: Draft CTA (One, Soft)
- Appears ONCE at very end
- Format: "Ready to [action]? Try MyFestivo free — [reason]"
- Example: "Ready to organize your first event? Try MyFestivo free — no credit card required."

### STEP 8: Review Against Checklist
- [ ] Title ≤ 60 chars, primary keyword included
- [ ] Description ≤ 160 chars, click-worthy
- [ ] Slug ≤ 5 words, kebab-case
- [ ] H2 headers (one per 500 words approx)
- [ ] Bold key terms (not sentences)
- [ ] 4+ internal links with varied anchor text
- [ ] 1-2 external links to authority
- [ ] ≥1 E-E-A-T signal present
- [ ] Competitor mentions honest (strengths first)
- [ ] Unique angle clear and defensible
- [ ] No superlatives without proof
- [ ] No fabricated claims
- [ ] Tone matches voice guide
- [ ] One soft CTA at end only
- [ ] FAQ section included (from real SERP if available)
- [ ] Images have descriptive alt text (≤125 chars)

### STEP 9: Save as Draft
- Status: `draft: true` in frontmatter
- Filename: `blog/[slug].md` or `blog/[slug].mdx`
- Wait for human review

### STEP 10: Ask User for Review
```
✅ Blog drafted: "[title]"
📄 File: blog/[slug].md | Words: [count]
🏗️ Cluster: [cluster name]

⚠️ REVIEW REQUIRED — say "Approve blog [slug]" or give feedback for changes.
```

---

## 🔄 UPDATING PUBLISHED BLOGS

When user says: "Update blog [slug]: [feedback]"

1. Read the live blog file
2. Identify section(s) to update
3. Rewrite that section based on feedback
4. Update `updated_at` date in frontmatter
5. Re-publish (status: published)
6. Log change in `changelog.md`

Example:
- User: "Update college-event-management: add new AI summarization feature"
- You: Update the "Tools & Solutions" section with new feature
- Update: `updated_at: 2026-04-10`
- Re-publish with notification: "Blog updated: added AI summarization section"

---

## 📊 AUDIT WORKFLOWS

### Content Audit
1. Scan all blogs in `content-map.yaml`
2. Check: keyword freshness, cannibalization, linking, E-E-A-T
3. Report: gaps to fill, redundant content, update opportunities

### Cannibalization Check
1. Scan `seo-keywords.csv` mapped keywords
2. Find blogs targeting same keywords
3. Recommend: consolidate OR update angle OR change targets

### Cluster Status
1. List all clusters from `topic-clusters.yaml`
2. Show: % published, # remaining
3. Identify under-covered clusters

---

## 🎬 SUB-AGENT USAGE

I automatically use sub-agents for parallel work:

- **Doc scanning**: One sub-agent per 15-20 files
- **Blog writing**: Parallel subagents for research, drafting, updates
- **Data merging**: Subagents process data independently
- **Audits**: Parallel blog scanning

**You don't configure this.** It happens automatically when tasks are independent.

---

## 📖 FULL DOCUMENTATION

- **Commands & Workflows**: `.seo-engine/USAGE-GUIDE.md`
- **Writing Guidelines**: `.seo-engine/templates/tone-guide.md`
- **Blog Structures**: `.seo-engine/templates/blog-structures.yaml`
- **Frontmatter Template**: `.seo-engine/templates/blog-frontmatter.yaml`
- **Activity Log**: `.seo-engine/logs/changelog.md`

---

## 🚩 COMMON ISSUES

**Q: "All pillar pages are blocked. What do I do?"**
A: Provide SERP data for the keyword (Google it and paste results), OR start with cluster pages (non-blocked items first).

**Q: "Can I write about a topic not in content-queue?"**
A: Yes. Just tell me the topic and angle. I'll check for cannibalization first, then write.

**Q: "Why is this competitor claim marked 'unverified'?"**
A: Come from competitor_analysis.txt, not verified from actual competitor website. Use caveat in blog: "According to [source], they support X (unverified)."

**Q: "Should I write the pillar first or cluster pages?"**
A: Pillar first (if SERP data available) OR cluster pages first (if pillar blocked). Both are valid starts.

**Q: "How do I change a blog's target keyword?"**
A: Update `content-queue.yaml` target_keywords field, then update blog frontmatter and content. Log change in changelog.

---

## ✅ CHECKLIST: "I'm Ready to Start"

- [ ] I read `.seo-engine/config.yaml` ← project setup confirmed
- [ ] I reviewed `.seo-engine/data/content-queue.yaml` ← 20 blog ideas, priorities clear
- [ ] I scanned `.seo-engine/templates/tone-guide.md` ← voice rules understood
- [ ] I know how to provide SERP data if a blog is blocked
- [ ] I understand that pillar pages need SERP research
- [ ] I understand E-E-A-T is mandatory (≥1 signal per blog)
- [ ] I know cluster pages must link to pillar
- [ ] I understand competitors.yaml confidence levels
- [ ] I'm ready to say "Write the next blog" or "Write a blog about [topic]"

👉 **Say "Write the next blog" to start!**
