# Koreans in USA - Final System Design (MVP)

## Overview

A community platform for Korean diaspora in the USA. The platform centers around **Q&A**, **Tips**, and **Communities** — no news aggregation (removed for legal reasons).

---

## 1. Content Types

### Q&A Posts
- Users ask questions, community answers
- Best answer can be accepted by the question author
- Upvotes on answers reward the answerer with XP
- Scoped: USA-wide or region-specific

### Tips
- Users share tips (visa, housing, food, jobs, legal, etc.)
- Upvotes reward the author with XP
- Scoped: USA-wide or region-specific

### General Posts (within Communities only)
- Free-form posts created inside a Community
- Privacy follows the Community's privacy setting (public/private)
- Upvotes reward the author with XP

---

## 2. Communities

### What is a Community?
A community is a group created around a shared interest, location, or topic. Think subreddit-style groups but for Korean diaspora.

### Scope
- **USA-wide** — visible/joinable by anyone in the US
- **Region-specific** — tied to a specific region (e.g., "NYC Koreans", "Bay Area K-Food")

### Privacy
- **Public** — anyone can view posts, anyone can join
- **Private** — only members can view posts, must request to join (leader approves)

### Creation Rules
- Must be **Level 5 (active badge, 50+ XP)** to create a community
- Creator becomes the **Community Leader**
- Each user can create up to 3 communities (prevent spam)

### Community Structure
```
Community
├── name (unique, 3-50 chars)
├── slug (URL-friendly, unique)
├── description (max 500 chars)
├── scope: 'USA' | 'REGION'
├── region_id (nullable, for region-scoped)
├── privacy: 'PUBLIC' | 'PRIVATE'
├── leader_id (FK → users)
├── kakao_link (optional KakaoTalk group chat URL)
├── member_count (denormalized)
├── created_at
└── is_active (soft delete)
```

### Membership
```
CommunityMember
├── community_id
├── user_id
├── role: 'LEADER' | 'MODERATOR' | 'MEMBER'
├── status: 'ACTIVE' | 'PENDING' (for private communities)
├── joined_at
```

- Leaders can promote members to Moderator
- Leaders can remove members
- Leaders can approve/reject join requests (private communities)
- Users can leave a community at any time

### Community Posts
- Any member can create a post within a community
- Posts inherit the community's privacy setting:
  - **Public community** → posts visible to everyone
  - **Private community** → posts visible only to members
- Community posts can be upvoted (earning XP for author)
- Community posts appear in the community feed, NOT in the main Q&A/Tips feeds

### Community Events
```
CommunityEvent
├── id
├── community_id
├── creator_id (FK → users)
├── title (max 100 chars)
├── description (max 2000 chars)
├── location (text, e.g., "Koreatown, LA" or "Online")
├── event_date (timestamp)
├── event_end_date (nullable)
├── is_online (boolean)
├── max_attendees (nullable, 0 = unlimited)
├── created_at
```

```
EventRSVP
├── event_id
├── user_id
├── status: 'GOING' | 'MAYBE' | 'NOT_GOING'
├── created_at
```

- Only community members can create events
- Only community members can RSVP
- Events show on the community page

### Communication
- **No in-app group messaging** for communities
- Community leaders are encouraged to create a **KakaoTalk group chat** and share the link
- The `kakao_link` field on the community stores this URL
- Displayed prominently on the community page: "Join our KakaoTalk group"

---

## 3. XP & Level System

### XP (replaces "reputation")

XP is earned by receiving engagement on your content:

| Action | XP Earned |
|--------|-----------|
| Your Q&A/Tip/Post gets upvoted | +10 |
| Your comment gets upvoted | +2 |
| Your answer is accepted (Q&A) | +15 |
| You create a post | +1 |

### Levels

| Level | Name | XP Required | Unlocks |
|-------|------|-------------|---------|
| 1 | Newcomer | 0 | Can post Q&A, Tips, comment, upvote |
| 2 | Contributor | 10 | — |
| 3 | Active | 50 | — |
| 4 | Expert | 200 | — |
| 5 | Leader | 500 | Can **create communities** |

> Note: XP thresholds are the same as existing reputation thresholds. "Reputation" column in DB is simply renamed conceptually to "XP". The `badge` column maps to the level name.

### Display
- User profile shows: Level badge + XP count + progress bar to next level
- Posts/comments show author's level badge next to their name

---

## 4. Landing Page

### Layout (logged out)
```
┌──────────────────────────────────────────────┐
│  Hero: "Your Korean Community in the USA"     │
│  [Sign Up] [Log In]                           │
├──────────────────────────────────────────────┤
│  Latest Q&A (3-5 items)  │  Latest Tips (3-5) │
├──────────────────────────────────────────────┤
│  Popular Communities (6 cards)                │
├──────────────────────────────────────────────┤
│  How It Works / Join CTA                      │
└──────────────────────────────────────────────┘
```

### Layout (logged in) → redirects to /feed

---

## 5. Main Feed (/feed)

### Tabs
- **Q&A** — all Q&A posts (USA-wide + user's region)
- **Tips** — all Tip posts (USA-wide + user's region)
- **Following** — posts from followed users
- **My Communities** — aggregated feed from joined communities

### Sorting
- Hot (score-based decay)
- New (chronological)
- Top (most upvotes)

### Sidebar
- Popular Communities (join buttons)
- Trending Tags
- Your Communities (quick links)

---

## 6. Navigation

```
Navbar: [Home] [Q&A] [Tips] [Communities] [Search]   [Bell] [Avatar]
```

### Key Pages
- `/` — Landing (logged out) or redirect to /feed (logged in)
- `/feed` — Main feed with tabs (Q&A / Tips / Following / My Communities)
- `/qa` — Q&A listing (alias for /feed?tab=qa)
- `/tips` — Tips listing (alias for /feed?tab=tips)
- `/communities` — Browse/discover communities
- `/communities/[slug]` — Community page (posts, events, members, KakaoTalk link)
- `/communities/create` — Create a community (Level 5+ only)
- `/posts/[id]` — Post detail (Q&A, Tip, or Community Post)
- `/users/[id]` — User profile
- `/search` — Search across Q&A, Tips, Communities

---

## 7. What Gets Removed / Changed

### Removed
- **News feature** — all news entities, repositories, use cases, API routes, RSS fetcher, news components
- **DM/Messages** — removed in favor of KakaoTalk. Keep the DB tables but remove from UI/navigation
- **Polls** — not MVP, can add later within communities
- **Reactions (emoji)** — not MVP, upvotes are sufficient

### Changed
- "Reputation" → "XP" (same logic, just renamed in UI)
- "Badge" → "Level" (same thresholds, just renamed in UI)
- Landing page → shows Q&A + Tips + Communities instead of news
- Feed → split into Q&A tab and Tips tab instead of mixed post types
- Posts with type GENERAL → only allowed inside communities

### Kept As-Is
- Auth (Supabase magic link + Google OAuth)
- Q&A posts, Tips, comments, upvotes
- Follow system
- Bookmarks
- Notifications (bell icon)
- Search (full-text)
- Tags
- Reports & moderation
- Admin dashboard
- Dark mode, i18n, keyboard shortcuts
- User profiles (with XP/Level instead of reputation/badge)

---

## 8. Database Changes (New Migration)

### New Tables

```sql
-- Communities
CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(60) NOT NULL UNIQUE,
  description VARCHAR(500),
  scope VARCHAR(10) NOT NULL DEFAULT 'USA', -- 'USA' or 'REGION'
  region_id INTEGER REFERENCES regions(id),
  privacy VARCHAR(10) NOT NULL DEFAULT 'PUBLIC', -- 'PUBLIC' or 'PRIVATE'
  leader_id INTEGER NOT NULL REFERENCES users(id),
  kakao_link VARCHAR(500),
  member_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community members
CREATE TABLE community_members (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(15) NOT NULL DEFAULT 'MEMBER', -- 'LEADER', 'MODERATOR', 'MEMBER'
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PENDING'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Link posts to communities (nullable, only for community posts)
ALTER TABLE posts ADD COLUMN community_id INTEGER REFERENCES communities(id);

-- Community events
CREATE TABLE community_events (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  creator_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  description VARCHAR(2000),
  location VARCHAR(200),
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  max_attendees INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(15) NOT NULL DEFAULT 'GOING', -- 'GOING', 'MAYBE', 'NOT_GOING'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_communities_scope ON communities(scope);
CREATE INDEX idx_communities_region ON communities(region_id);
CREATE INDEX idx_communities_leader ON communities(leader_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_posts_community ON posts(community_id);
CREATE INDEX idx_community_events_community ON community_events(community_id);
CREATE INDEX idx_community_events_date ON community_events(event_date);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
```

### Enforce GENERAL posts only in communities
- Application-level check: if `post.type === 'GENERAL'`, require `community_id` to be set
- Q&A and TIP posts: `community_id` must be NULL (they live in the main feed)

---

## 9. MVP Scope (What to Build Now)

### Phase 1: Core Restructure
1. New DB migration (communities, members, events, rsvps, posts.community_id)
2. Remove news from UI (keep DB tables, just remove routes/components)
3. Update landing page: Q&A + Tips + Popular Communities
4. Split feed into tabs: Q&A | Tips | Following | My Communities

### Phase 2: Communities
5. Community CRUD (create, edit, view, list)
6. Community membership (join, leave, request for private)
7. Community posts (create GENERAL posts within community)
8. Community page (posts feed, member list, events, KakaoTalk link)
9. Browse/discover communities page

### Phase 3: Events & Polish
10. Community events (create, view, RSVP)
11. XP/Level display updates (rename reputation→XP in UI)
12. Remove DM UI from navigation (keep backend)
13. Remove polls/reactions UI

---

## 10. API Routes (New/Changed)

### New Routes
```
POST   /api/communities              — Create community (Level 5+)
GET    /api/communities              — List/browse communities
GET    /api/communities/[slug]       — Community detail
PUT    /api/communities/[slug]       — Update community (leader only)
GET    /api/communities/[slug]/posts — Community posts feed
GET    /api/communities/[slug]/members — Community members
GET    /api/communities/[slug]/events — Community events
POST   /api/communities/[slug]/join  — Join / request to join
POST   /api/communities/[slug]/leave — Leave community
POST   /api/communities/[slug]/members/[userId]/approve — Approve join request
POST   /api/communities/[slug]/members/[userId]/remove  — Remove member
POST   /api/communities/[slug]/members/[userId]/role    — Change member role
POST   /api/communities/[slug]/events       — Create event
GET    /api/communities/[slug]/events/[id]  — Event detail
POST   /api/communities/[slug]/events/[id]/rsvp — RSVP to event
GET    /api/communities/my           — My communities
GET    /api/communities/popular      — Popular communities
GET    /api/feed/my-communities      — Aggregated feed from joined communities
```

### Removed Routes
```
GET    /api/news                     — REMOVED
POST   /api/cron/news                — REMOVED
GET    /api/messages/*               — REMOVED from UI (keep backend)
GET    /api/polls/*                  — REMOVED from UI
POST   /api/posts/[id]/reactions     — REMOVED from UI
```

### Changed Routes
```
GET    /api/feed/usa                 — Add ?type=QA|TIP filter (required)
POST   /api/posts                    — Add community_id field (optional)
                                       Enforce: GENERAL type requires community_id
```
