'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Community = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  scope: string;
  privacy: string;
  kakao_link: string | null;
  memberCount: number;
  isMember: boolean;
  userRole: string | null;
};

type Post = {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
  vote_count: number;
  comment_count: number;
};

type Event = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  is_online: boolean;
  max_attendees: number | null;
  attendee_count: number;
  isAttending: boolean;
};

type Member = {
  id: number;
  user_id: number;
  username: string;
  role: string;
  joined_at: string;
};

type PendingRequest = {
  id: number;
  user_id: number;
  username: string;
  requested_at: string;
};

type Tab = 'posts' | 'events' | 'members';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function CommunityDetail({ slug }: { slug: string }) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [tab, setTab] = useState<Tab>('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    is_online: false,
    max_attendees: '',
  });
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Join/Leave state
  const [joinLoading, setJoinLoading] = useState(false);

  // Fetch community data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/communities/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Community not found');
        return r.json();
      })
      .then((data) => {
        setCommunity(data.community);
      })
      .catch(() => setError('Community not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch tab data
  useEffect(() => {
    if (!community) return;

    if (tab === 'posts') {
      setPostsLoading(true);
      fetch(`/api/communities/${slug}/posts`)
        .then((r) => r.json())
        .then((data) => setPosts(data.posts ?? []))
        .catch(() => {})
        .finally(() => setPostsLoading(false));
    } else if (tab === 'events') {
      setEventsLoading(true);
      fetch(`/api/communities/${slug}/events`)
        .then((r) => r.json())
        .then((data) => setEvents(data.events ?? []))
        .catch(() => {})
        .finally(() => setEventsLoading(false));
    } else if (tab === 'members') {
      setMembersLoading(true);
      fetch(`/api/communities/${slug}/members`)
        .then((r) => r.json())
        .then((data) => {
          setMembers(data.members ?? []);
          setPendingRequests(data.pendingRequests ?? []);
        })
        .catch(() => {})
        .finally(() => setMembersLoading(false));
    }
  }, [community, tab, slug]);

  async function handleJoinLeave() {
    if (!community) return;
    setJoinLoading(true);
    try {
      const method = community.isMember ? 'DELETE' : 'POST';
      const res = await fetch(`/api/communities/${slug}/membership`, { method });
      const data = await res.json();
      if (res.ok) {
        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                isMember: !prev.isMember,
                memberCount: prev.isMember
                  ? prev.memberCount - 1
                  : prev.memberCount + 1,
                userRole: prev.isMember ? null : 'member',
              }
            : prev
        );
      } else {
        alert(data.error ?? 'Action failed');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setJoinLoading(false);
    }
  }

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPostTitle.trim()) return;
    setPostSubmitting(true);
    try {
      const res = await fetch(`/api/communities/${slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPostTitle.trim(), body: newPostBody.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) => [data.post, ...prev]);
        setNewPostTitle('');
        setNewPostBody('');
        setShowPostForm(false);
      } else {
        alert(data.error ?? 'Failed to create post');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setPostSubmitting(false);
    }
  }

  async function handleEventSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.event_date) return;
    setEventSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || null,
        location: eventForm.location.trim() || null,
        event_date: eventForm.event_date,
        is_online: eventForm.is_online,
      };
      if (eventForm.max_attendees) {
        body.max_attendees = parseInt(eventForm.max_attendees, 10);
      }
      const res = await fetch(`/api/communities/${slug}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) => [data.event, ...prev]);
        setEventForm({ title: '', description: '', location: '', event_date: '', is_online: false, max_attendees: '' });
        setShowEventForm(false);
      } else {
        alert(data.error ?? 'Failed to create event');
      }
    } catch {
      alert('Something went wrong');
    } finally {
      setEventSubmitting(false);
    }
  }

  async function handleRsvp(eventId: number) {
    try {
      const res = await fetch(`/api/communities/${slug}/events/${eventId}/rsvp`, {
        method: 'POST',
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === eventId
              ? {
                  ...ev,
                  isAttending: !ev.isAttending,
                  attendee_count: ev.isAttending
                    ? ev.attendee_count - 1
                    : ev.attendee_count + 1,
                }
              : ev
          )
        );
      }
    } catch {}
  }

  async function handleApproveRequest(userId: number) {
    try {
      const res = await fetch(`/api/communities/${slug}/membership/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.user_id !== userId));
        // Refresh members
        const membersRes = await fetch(`/api/communities/${slug}/members`);
        const membersData = await membersRes.json();
        setMembers(membersData.members ?? []);
      }
    } catch {}
  }

  async function handleRejectRequest(userId: number) {
    try {
      const res = await fetch(`/api/communities/${slug}/membership/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.user_id !== userId));
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-4 w-96 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-64 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Community not found'}</p>
        <Link href="/communities" className="text-blue-600 hover:underline text-sm">
          Browse all communities
        </Link>
      </div>
    );
  }

  const isLeaderOrMod = community.userRole === 'leader' || community.userRole === 'mod';

  return (
    <div>
      {/* Header */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{community.name}</h1>
            {community.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {community.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {community.scope === 'usa' ? 'USA' : 'Region'}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  community.privacy === 'public'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}
              >
                {community.privacy === 'public' ? 'Public' : 'Private'}
              </span>
              <span className="text-sm text-gray-500">
                {community.memberCount}{' '}
                {community.memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {community.kakao_link && (
              <a
                href={community.kakao_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-yellow-500 transition"
              >
                Join KakaoTalk
              </a>
            )}
            <button
              onClick={handleJoinLeave}
              disabled={joinLoading}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                community.isMember
                  ? 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {joinLoading
                ? '...'
                : community.isMember
                  ? 'Leave'
                  : community.privacy === 'private'
                    ? 'Request to Join'
                    : 'Join'}
            </button>
            {isLeaderOrMod && (
              <Link
                href={`/communities/${slug}/manage`}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Manage
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {(['posts', 'events', 'members'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {tab === 'posts' && (
        <div>
          {community.isMember && (
            <div className="mb-4">
              {!showPostForm ? (
                <button
                  onClick={() => setShowPostForm(true)}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  New Post
                </button>
              ) : (
                <form
                  onSubmit={handlePostSubmit}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Post title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Write your post... (optional)"
                    value={newPostBody}
                    onChange={(e) => setNewPostBody(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!newPostTitle.trim() || postSubmitting}
                      className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {postSubmitting ? 'Posting...' : 'Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostForm(false);
                        setNewPostTitle('');
                        setNewPostBody('');
                      }}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {postsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No posts yet. {community.isMember ? 'Be the first to post!' : 'Join to start posting.'}
            </p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="font-medium mb-1">{post.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{post.author_name}</span>
                    <span>{timeAgo(post.created_at)}</span>
                    <span>{post.vote_count} votes</span>
                    <span>{post.comment_count} comments</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {tab === 'events' && (
        <div>
          {community.isMember && (
            <div className="mb-4">
              {!showEventForm ? (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  Create Event
                </button>
              ) : (
                <form
                  onSubmit={handleEventSubmit}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Event title"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={eventForm.location}
                    onChange={(e) =>
                      setEventForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={eventForm.event_date}
                        onChange={(e) =>
                          setEventForm((prev) => ({ ...prev, event_date: e.target.value }))
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Max Attendees (optional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="No limit"
                        value={eventForm.max_attendees}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            max_attendees: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={eventForm.is_online}
                      onChange={(e) =>
                        setEventForm((prev) => ({ ...prev, is_online: e.target.checked }))
                      }
                      className="rounded"
                    />
                    This is an online event
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!eventForm.title.trim() || !eventForm.event_date || eventSubmitting}
                      className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {eventSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventForm(false);
                        setEventForm({ title: '', description: '', location: '', event_date: '', is_online: false, max_attendees: '' });
                      }}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {eventsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No upcoming events. {community.isMember ? 'Create the first one!' : 'Join to create events.'}
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium mb-1">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>
                          {new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        {event.location && <span>{event.location}</span>}
                        {event.is_online && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Online
                          </span>
                        )}
                        <span>
                          {event.attendee_count} attending
                          {event.max_attendees ? ` / ${event.max_attendees} max` : ''}
                        </span>
                      </div>
                    </div>
                    {community.isMember && (
                      <button
                        onClick={() => handleRsvp(event.id)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          event.isAttending
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {event.isAttending ? 'Going' : 'RSVP'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div>
          {/* Pending requests (leader/mod only) */}
          {isLeaderOrMod && pendingRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-orange-600 dark:text-orange-400">
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between border border-orange-200 dark:border-orange-800 rounded-lg p-3"
                  >
                    <div>
                      <Link
                        href={`/users/${req.user_id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {req.username}
                      </Link>
                      <span className="text-xs text-gray-500 ml-2">
                        {timeAgo(req.requested_at)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(req.user_id)}
                        className="bg-green-600 text-white rounded-lg px-3 py-1 text-xs font-medium hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.user_id)}
                        className="border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg px-3 py-1 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {membersLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/users/${member.user_id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {member.username}
                    </Link>
                    {member.role !== 'member' && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          member.role === 'leader'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {member.role === 'leader' ? 'Leader' : 'Mod'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Joined {timeAgo(member.joined_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
