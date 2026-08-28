export type NavItem = {
  title: string
  /** Slug of an MDX file in /content, or an absolute URL for external links. */
  slug: string
  external?: boolean
}

export type NavSection = {
  title: string
  emoji: string
  items: NavItem[]
}

/**
 * Sidebar structure. Add a section or item here and drop a matching
 * `content/<slug>.mdx` file next to it — nothing else to wire up.
 */
export const nav: NavSection[] = [
  {
    title: 'Bắt đầu',
    emoji: '🚀',
    items: [
      { title: 'Giới thiệu', slug: 'gioi-thieu' },
      { title: 'Hướng dẫn tự học Tiếng Anh', slug: 'huong-dan-tu-hoc' },
      { title: '30 ngày Tiếng Anh', slug: '30-ngay-tieng-anh' },
    ],
  },
  {
    title: 'Kỹ năng',
    emoji: '🎯',
    items: [
      { title: 'Nghe & Immersion', slug: 'nghe-immersion' },
      { title: 'Đọc Tiếng Anh', slug: 'doc-tieng-anh' },
      { title: 'Nói Tiếng Anh', slug: 'noi-tieng-anh' },
      { title: 'Từ vựng & Anki', slug: 'tu-vung-anki' },
    ],
  },
  {
    title: 'Công cụ',
    emoji: '🛠️',
    items: [
      { title: 'Cài đặt Yomitan', slug: 'cai-dat-yomitan' },
      { title: 'Từ điển đơn ngữ', slug: 'tu-dien-don-ngu' },
    ],
  },
  {
    title: 'Tài nguyên',
    emoji: '📚',
    items: [
      { title: 'Tổng hợp tài nguyên', slug: 'tai-nguyen' },
      { title: 'Nội dung dễ hiểu', slug: 'noi-dung-de-hieu' },
      { title: 'Câu hỏi thường gặp', slug: 'faq' },
    ],
  },
]

/** Flattened, in sidebar order — used for prev/next paging. */
export const flatNav: NavItem[] = nav.flatMap((s) => s.items.filter((i) => !i.external))
