# Tôi Tự Học

Trang tổng hợp các **bộ nội dung tự học** (tiếng Anh, lập trình, và bất cứ chủ đề nào bạn thêm sau
này). Next.js App Router + Tailwind CSS v4, xuất tĩnh, tự động deploy lên GitHub Pages.

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000
```

## Kiến trúc: mọi thứ là "collection"

Một collection = **một thư mục trong `content/`**. Không có file đăng ký tập trung, không phải sửa
code khi thêm chủ đề mới.

```
content/
  tieng-anh/
    collection.json      ← tên, mô tả, emoji, màu, thứ tự các section
    gioi-thieu.mdx
    faq.mdx
  lap-trinh/
    collection.json
    ...
```

Từ đó tự sinh ra: route `/tieng-anh/`, `/tieng-anh/faq/`, sidebar, mục lục, prev/next, breadcrumb,
thẻ trên trang chủ, dropdown chuyển chủ đề, và chỉ mục tìm kiếm.

### Thêm một chủ đề mới

```bash
npm run new -- tieng-nhat              # tạo thư mục + collection.json
npm run new -- tieng-nhat kana         # tạo bài đầu tiên
npm run new -- tieng-nhat kanji "Ngữ pháp"
```

Rồi sửa nội dung. Hết. Không đụng vào `app/` hay `components/`.

### `collection.json`

```json
{
  "title": "Tiếng Anh",
  "shortTitle": "Tiếng Anh",
  "description": "Mô tả hiện trên trang chủ và trang giới thiệu bộ.",
  "emoji": "🇬🇧",
  "accent": "indigo",
  "order": 1,
  "status": "active",
  "sections": [
    { "title": "Bắt đầu", "emoji": "🚀" },
    { "title": "Kỹ năng", "emoji": "🎯" }
  ]
}
```

| Trường | Ý nghĩa |
| --- | --- |
| `accent` | Màu nhấn riêng cho cả bộ: `indigo`, `violet`, `sky`, `emerald`, `amber`, `rose` |
| `order` | Thứ tự hiển thị giữa các bộ |
| `status` | `active` · `wip` (gắn nhãn "đang viết") · `hidden` (ẩn khỏi mọi danh sách, link trực tiếp vẫn vào được) |
| `sections` | Thứ tự các nhóm trong sidebar. Section nào dùng trong bài mà quên khai báo vẫn được render ở cuối. |

File này **không bắt buộc** — một thư mục chỉ có `.mdx` vẫn chạy, chỉ là dùng giá trị mặc định.

### Frontmatter của một bài

```mdx
---
title: Câu hỏi thường gặp
description: Mô tả ngắn, hiện dưới tiêu đề và trong kết quả tìm kiếm.
section: Tài nguyên
order: 3
---
```

`section` quyết định bài nằm nhóm nào trong sidebar, `order` quyết định thứ tự trong nhóm đó.

### Giọng viết

Toàn bộ nội dung viết theo giọng kể chuyện ngôi thứ nhất — xưng "mình", kể lại chỗ từng mắc kẹt và
thứ đã hiệu quả. Quy ước đầy đủ ở [`content/STYLE.md`](content/STYLE.md); đọc file đó trước khi viết
bài mới.

### Component dùng được trong MDX

```mdx
<Callout type="tip" title="Mẹo">Nội dung nhấn mạnh. type: tip | info | warning | danger</Callout>

<Callout type="story">Đoạn kể chuyện cá nhân — hiện ra như lời tâm sự bên lề.</Callout>

<Cards>
  <Card title="Tiêu đề" href="/tieng-anh/faq/" emoji="🧭">Mô tả ngắn.</Card>
</Cards>

<Steps>
### 1. Bước một
### 2. Bước hai
</Steps>
```

## Màu nhấn hoạt động thế nào

Tailwind biên dịch `bg-brand-600` thành `var(--color-brand-600)`. Layout của mỗi collection đặt
`data-accent="<accent>"` lên phần tử bọc, và CSS trong [`app/globals.css`](app/globals.css) ghi đè
đúng bộ biến đó. Nên đổi màu cả một bộ nội dung = sửa **một dòng JSON**, không đụng tới class nào.

Thêm bảng màu mới: thêm một block `[data-accent='ten-mau']` trong `globals.css` và thêm tên vào
`ACCENTS` trong [`lib/content.ts`](lib/content.ts).

## Đổi tên / mô tả trang

Sửa [`lib/site.ts`](lib/site.ts) — tên site, tagline, mô tả, link repo.

## Deploy lên GitHub Pages

1. Push repo lên GitHub, nhánh `main`.
2. **Settings → Pages → Build and deployment → Source** → chọn **GitHub Actions**.
3. Push một commit. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) sẽ build và deploy.

`basePath` lấy tự động từ `actions/configure-pages` qua `NEXT_PUBLIC_BASE_PATH`, nên project page
(`user.github.io/<repo>`) lẫn user page (`user.github.io`) đều chạy đúng, không cần sửa config.

Thử local với basePath:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo> npm run build && npx serve out
```

## Cấu trúc code

| Đường dẫn | Vai trò |
| --- | --- |
| `content/<collection>/` | Toàn bộ nội dung — chỗ duy nhất bạn cần đụng tới khi viết bài |
| `content/STYLE.md` | Quy ước giọng viết cho mọi bài |
| `lib/site.ts` | Tên site, tagline, link repo |
| `lib/content.ts` | Khám phá collection, đọc MDX, dựng sidebar/TOC/pager |
| `app/page.tsx` | Trang chủ — danh sách collection |
| `app/[collection]/` | Trang giới thiệu bộ + layout đặt màu nhấn |
| `app/[collection]/[slug]/` | Trang bài viết |
| `components/` | Header, sidebar, tìm kiếm, mục lục, MDX components |
| `scripts/new.mjs` | Scaffold collection / bài viết |
| `scripts/build-search-index.mjs` | Sinh `public/search-index.json` (chạy tự động trước dev/build) |
