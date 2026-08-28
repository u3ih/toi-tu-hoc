/** Site-wide settings. Everything topic-specific lives in content/<collection>/collection.json. */
export const site = {
  name: 'Tôi Tự Học',
  tagline: 'Ghi lại những gì mình đã tự học',
  description:
    'Mình tự học tiếng Anh, rồi tự học lập trình — sai rất nhiều trước khi tìm được cách hợp với mình. Đây là ghi chép của mình: đã mắc kẹt ở đâu, đã làm gì để thoát ra, và dùng công cụ nào.',
  /** Shown in the footer; set to '' to hide the link. */
  repoUrl: 'https://github.com',
  locale: 'vi',
} as const
