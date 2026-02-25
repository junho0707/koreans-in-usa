Koreans in USA — System Specification v3 (Codex-Ready)
1. Product Overview

Mission:
A public hub for Koreans in the USA to ask questions, share tips, and discover relevant news.

Core Pillars (MVP):

USA-wide social feed

Region-based group feeds

Q&A + Tips + General posts

Threaded comments (Reddit-style)

Upvotes (posts + comments)

Auto-tagging (topics)

Infinite scroll everywhere

News (auto-fetched + tagged)

2. Geographic Structure
2.1 Regions (Fixed)

Northeast (NE)

South (S)

Midwest (MW)

West (W)

Each region has a page:

/groups/northeast
/groups/south
/groups/midwest
/groups/west

3. Post Scope Model

Each post may target:

USA feed

One Region

Both USA + one Region

3.1 Post Scope Fields

scope_usa: boolean
scope_region: boolean
region_id: NE | S | MW | W | null

Constraints:

If scope_region = true, then region_id is required.

A post can appear in both USA and Region feeds (same post ID).

4. USA Feed Logic

USA feed is a unified ranked stream.

4.1 Candidate Pool

Include:

Posts where scope_usa = true

Region posts where:

scope_region = true

Created within last 12 hours

Ranked top 3 in their region in last 12 hours

4.2 Ranking

Sort candidate pool by:

Upvotes on posts created in last 12h (descending)

created_at (descending)

id (descending)

This produces a single continuous ranked stream.

4.3 Infinite Scroll

Endpoint:

GET /api/feed/usa

Query params:

sort=top12h|new

state=optional

region=optional

topic=optional

type=qa|tip|general

cursor=opaque

limit=30

Cursor contains:
(last_score, last_created_at, last_id)

5. Region Feed Logic

Endpoint:

GET /api/feed/region/:regionSlug

Default behavior:

If user.profile_state exists → apply as default state filter

User may clear/change filter

Sort options:

top12h (default)

new

Infinite scroll identical to USA feed.

6. Post Types

Single posts table with:

type = QA | TIP | GENERAL

QA: supports accepted answer

TIP: informational

GENERAL: discussion

7. Comments

Reddit-style threaded comments:

parent_comment_id (nullable)

Unlimited nesting allowed.

Default comment sort:

Best (vote score)
User may switch to:

New

8. Voting

Upvotes only.

Targets:

Posts

Comments

Constraints:

One vote per user per target

No downvotes

9. Q&A Accepted Answer

Only post author may mark a comment as accepted.

Field:
posts.accepted_comment_id (nullable)

10. Tagging System
10.1 Location Tags

Optional:

state_code

metro_area

No auto-assign from profile.

10.2 Topic Tags

Optional by user.

If none provided:

System auto-generates topic tags.

Auto-tagging method:

Keyword-rule based

Admin maintains keyword list per topic

Cap auto-tags at 5

Stored in join table with source flag:

post_topic_tags:

post_id

topic_tag_id

source = USER | AUTO

11. News System

News is included in MVP.

11.1 News Item Fields

id
title
summary
url
source
published_at
tags
status

Auto-fetched from external APIs/RSS.

Tagging:

Rule-based (keyword matching)

Manual override allowed

News appears:

On USA homepage

On relevant region pages (if tagged)

12. Moderation

Report threshold:

Auto-hide at 10 reports

Moderation:

Admin-only

Rate limiting:

Enabled (basic anti-spam)

Content policy:

Politics: NOT allowed

Jobs: allowed

Housing: allowed

Legal/Medical advice: allowed

Fundraising: allowed

13. Authentication

Login required to:

Post

Comment

Vote

Authentication method:

Email OR Phone (either sufficient)

Display name:

Pseudonym

Profile fields:

Country

State

City

Interests

Korean-X identity

14. Database Core Tables
posts

id
author_id
type
title
body
scope_usa
scope_region
region_id
state_code
metro_area
accepted_comment_id
created_at
updated_at

comments

id
post_id
author_id
parent_comment_id
body
created_at

votes

id
user_id
target_type = POST | COMMENT
target_id
created_at
UNIQUE(user_id, target_type, target_id)

post_topic_tags

post_id
topic_tag_id
source = USER | AUTO

regions

id (NE|S|MW|W)
name
slug

15. Appearance Rules Summary

A post appears in USA feed if:

scope_usa = true
OR

scope_region = true AND it is top 3 in its region in last 12h

A post appears in region feed if:

scope_region = true AND region_id matches

16. Cloning Template for Other Countries

For Koreans in UK / Canada / Australia etc:

Same schema

Replace region definitions

Replace geo tags (Province, Territory, etc.)

Replace news sources

Core logic remains identical.
