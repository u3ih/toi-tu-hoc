/** Site-wide settings. Everything topic-specific lives in content/<collection>/collection.json. */
export const site = {
  name: 'Tôi Tự Học',
  tagline: 'Tự học đến nơi đến chốn',
  description:
    'Tập hợp các bộ hướng dẫn tự học — ngôn ngữ, lập trình và những chủ đề khác — viết để dùng được, không phải để đọc cho vui.',
  /** Shown in the footer; set to '' to hide the link. */
  repoUrl: 'https://github.com',
  locale: 'vi',
} as const
