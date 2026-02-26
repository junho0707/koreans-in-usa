export type Locale = 'en' | 'ko';

const translations = {
  en: {
    // Nav
    'nav.usaFeed': 'USA Feed',
    'nav.northeast': 'Northeast',
    'nav.south': 'South',
    'nav.midwest': 'Midwest',
    'nav.west': 'West',
    'nav.search': 'Search',
    'nav.messages': 'Messages',
    'nav.saved': 'Saved',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',

    // Feed
    'feed.title': 'Feed',
    'feed.usaFeed': 'USA Feed',
    'feed.following': 'Following',
    'feed.trending': 'Trending',
    'feed.newPost': 'New Post',
    'feed.loadMore': 'Load more',
    'feed.noMore': 'No more posts',

    // Post
    'post.votes': 'votes',
    'post.comments': 'comments',
    'post.share': 'Share',
    'post.save': 'Save',
    'post.saved': 'Saved',
    'post.copied': 'Copied!',
    'post.by': 'by',

    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit',
    'profile.posts': 'Posts',
    'profile.comments': 'Comments',
    'profile.followers': 'followers',
    'profile.following': 'following',
    'profile.reputation': 'reputation',
    'profile.joined': 'Joined',
    'profile.noPosts': 'No posts yet.',
    'profile.noComments': 'No comments yet.',

    // Auth
    'auth.login': 'Sign In',
    'auth.loginSubtitle': 'Join the Korean community in the USA',
    'auth.email': 'Email',
    'auth.phone': 'Phone',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Mark all as read',
    'notifications.empty': 'No notifications yet.',
    'notifications.commentOnPost': 'commented on your post',
    'notifications.replyToComment': 'replied to your comment',
    'notifications.acceptedAnswer': 'accepted your answer',
    'notifications.newFollower': 'started following you',
    'notifications.dmReceived': 'sent you a message',

    // Search
    'search.title': 'Search',
    'search.placeholder': 'Search posts...',
    'search.results': 'results',
    'search.noResults': 'No posts found matching your search.',

    // Common
    'common.loading': 'Loading...',
    'common.follow': 'Follow',
    'common.following': 'Following',
    'common.message': 'Message',
  },
  ko: {
    // Nav
    'nav.usaFeed': '미국 피드',
    'nav.northeast': '북동부',
    'nav.south': '남부',
    'nav.midwest': '중서부',
    'nav.west': '서부',
    'nav.search': '검색',
    'nav.messages': '메시지',
    'nav.saved': '저장됨',
    'nav.signIn': '로그인',
    'nav.signOut': '로그아웃',

    // Feed
    'feed.title': '피드',
    'feed.usaFeed': '미국 피드',
    'feed.following': '팔로잉',
    'feed.trending': '인기글',
    'feed.newPost': '글쓰기',
    'feed.loadMore': '더 보기',
    'feed.noMore': '더 이상 게시물이 없습니다',

    // Post
    'post.votes': '추천',
    'post.comments': '댓글',
    'post.share': '공유',
    'post.save': '저장',
    'post.saved': '저장됨',
    'post.copied': '복사됨!',
    'post.by': '작성자',

    // Profile
    'profile.title': '프로필',
    'profile.edit': '수정',
    'profile.posts': '게시물',
    'profile.comments': '댓글',
    'profile.followers': '팔로워',
    'profile.following': '팔로잉',
    'profile.reputation': '평판',
    'profile.joined': '가입일',
    'profile.noPosts': '아직 게시물이 없습니다.',
    'profile.noComments': '아직 댓글이 없습니다.',

    // Auth
    'auth.login': '로그인',
    'auth.loginSubtitle': '미국 한인 커뮤니티에 참여하세요',
    'auth.email': '이메일',
    'auth.phone': '전화번호',

    // Notifications
    'notifications.title': '알림',
    'notifications.markAllRead': '모두 읽음으로 표시',
    'notifications.empty': '알림이 없습니다.',
    'notifications.commentOnPost': '님이 게시물에 댓글을 남겼습니다',
    'notifications.replyToComment': '님이 댓글에 답글을 남겼습니다',
    'notifications.acceptedAnswer': '님이 답변을 채택했습니다',
    'notifications.newFollower': '님이 팔로우했습니다',
    'notifications.dmReceived': '님이 메시지를 보냈습니다',

    // Search
    'search.title': '검색',
    'search.placeholder': '게시물 검색...',
    'search.results': '개 결과',
    'search.noResults': '검색 결과가 없습니다.',

    // Common
    'common.loading': '로딩 중...',
    'common.follow': '팔로우',
    'common.following': '팔로잉',
    'common.message': '메시지',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

export default translations;
