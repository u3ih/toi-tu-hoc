# Tôi Tự Học

Trang tổng hợp các **bộ nội dung tự học** (tiếng Anh, lập trình, và bất cứ chủ đề nào bạn thêm sau
này). Next.js App Router + Tailwind CSS v4, xuất tĩnh, song ngữ, tự động deploy lên GitHub Pages.

## Chạy local

```bash
pnpm install
pnpm dev           # http://localhost:3000
```

## Kiến trúc: mọi thứ là "collection"

Một collection = **một thư mục trong `content/`**. Không có file đăng ký tập trung, không phải sửa
code khi thêm chủ đề mới.

```
content/
  english/
    collection.json         ← tên, mô tả, emoji, màu, các section (mỗi thứ một bản/ngôn ngữ)
    introduction.mdx        ← bản tiếng Việt (locale mặc định)
    introduction.en.mdx     ← bản tiếng Anh
    faq.mdx
  programming/
    collection.json
    ...
```

Từ đó tự sinh ra: route `/english/`, `/english/faq/`, `/en/english/faq/`, sidebar, mục lục,
prev/next, breadcrumb, thẻ trên trang chủ, dropdown chuyển chủ đề, chỉ mục tìm kiếm, `sitemap.xml`,
`robots.txt`, canonical + hreflang và JSON-LD.

## Đa ngôn ngữ

**Key luôn là tiếng Anh, chỉ chữ mới dịch.** Tên thư mục collection, slug bài viết và `key` của
section là định danh route — giống hệt nhau ở mọi ngôn ngữ. Nhờ vậy một trang chỉ có một hình dạng
URL, và nút đổi ngôn ngữ chỉ cần đổi tiền tố, không cần bảng ánh xạ.

| Ngôn ngữ | URL | Ghi chú |
| --- | --- | --- |
| `vi` (mặc định) | `/english/reading/` | Không có tiền tố |
| `en` | `/en/english/reading/` | Có tiền tố |

Bài chưa dịch **không 404**: trang hiện nội dung tiếng Việt kèm một dòng báo "bài này chưa có bản
tiếng Anh". Phần khung (menu, sidebar, nút, nhãn callout) vẫn đúng ngôn ngữ đang xem.

### Dịch một bài

```bash
pnpm new english reading --locale en    # tạo reading.en.mdx, chép sẵn nội dung gốc để dịch đè
```

Frontmatter của bản dịch chỉ cần `title` và `description`. `section` và `order` luôn lấy từ file
locale mặc định, nên thứ tự sidebar không bao giờ lệch giữa các ngôn ngữ.

### Chuỗi giao diện

Nằm trong `messages/<locale>.json`, lồng theo nhóm:

```json
{
  "doc": {
    "readingTime": "⏱ Khoảng {minutes} phút đọc",
    "prev": "← Bài trước"
  }
}
```

Dùng trong code: `t(locale, 'doc.readingTime', { minutes: 7 })`. Key được TypeScript kiểm tra từ
`messages/vi.json`, nên gõ sai key là lỗi biên dịch.

`messages/vi.json` là bản gốc của bộ key. `pnpm check:i18n` (tự chạy trước `dev` và `build`) báo lỗi
nếu một ngôn ngữ thiếu key, thừa key, hoặc dùng sai `{placeholder}`.

### Thêm một ngôn ngữ

1. Thêm vào `i18n.config.json`.
2. Mở rộng union `Locale` trong [`lib/i18n.ts`](lib/i18n.ts).
3. Chép `messages/vi.json` sang `messages/<code>.json` rồi dịch.
4. Chép thư mục `app/(en)/` thành `app/(<code>)/`, đổi `'en'` thành mã mới (5 file, mỗi file vài
   dòng).
5. Thêm `title` / `description` / `sections[].title` cho ngôn ngữ đó trong từng `collection.json`.

Mỗi ngôn ngữ có root layout riêng để `<html lang>` đúng ngay trong HTML tĩnh, không phải sửa sau khi
hydrate.

### Thêm một chủ đề mới

```bash
pnpm new japanese              # tạo thư mục + collection.json (stub sẵn mọi ngôn ngữ)
pnpm new japanese kana         # tạo bài đầu tiên
pnpm new japanese kanji grammar
```

Rồi sửa nội dung. Hết. Không đụng vào `app/` hay `components/`.

Tên collection, slug và section key phải là **key tiếng Anh viết thường** (`a-z`, `0-9`, `-`);
script từ chối nếu không đúng.

### `collection.json`

Trường nào hiển thị ra màn hình thì nhận một chuỗi (dùng chung mọi ngôn ngữ) hoặc một object theo
ngôn ngữ.

```json
{
  "emoji": "🇬🇧",
  "accent": "indigo",
  "order": 1,
  "status": "active",
  "title": { "vi": "Tiếng Anh", "en": "English" },
  "shortTitle": { "vi": "Tiếng Anh", "en": "English" },
  "description": { "vi": "Mô tả hiện trên trang chủ.", "en": "Shown on the home page." },
  "sections": [
    { "key": "start", "emoji": "🚀", "title": { "vi": "Bắt đầu", "en": "Start here" } },
    { "key": "skills", "emoji": "🎯", "title": { "vi": "Kỹ năng", "en": "Skills" } }
  ]
}
```

| Trường | Ý nghĩa |
| --- | --- |
| `accent` | Màu nhấn riêng cho cả bộ: `indigo`, `violet`, `sky`, `emerald`, `amber`, `rose` |
| `order` | Thứ tự hiển thị giữa các bộ |
| `status` | `active` · `wip` (gắn nhãn "đang viết") · `hidden` (ẩn khỏi mọi danh sách và sitemap, link trực tiếp vẫn vào được) |
| `sections[].key` | Định danh dùng trong frontmatter `section:` — tiếng Anh, không đổi theo ngôn ngữ |
| `sections` | Thứ tự các nhóm trong sidebar. Section nào dùng trong bài mà quên khai báo vẫn được render ở cuối. |

File này **không bắt buộc** — một thư mục chỉ có `.mdx` vẫn chạy, chỉ là dùng giá trị mặc định.

### Frontmatter của một bài

```mdx
---
title: Câu hỏi thường gặp
description: Mô tả ngắn, hiện dưới tiêu đề và trong kết quả tìm kiếm.
section: resources
order: 3
date: 2026-02-14        # tuỳ chọn — vào JSON-LD
updated: 2026-08-01     # tuỳ chọn — vào JSON-LD và <lastmod> của sitemap
---
```

`section` (key tiếng Anh) quyết định bài nằm nhóm nào trong sidebar, `order` quyết định thứ tự trong
nhóm đó.

### Giọng viết

Toàn bộ nội dung viết theo giọng kể chuyện ngôi thứ nhất — xưng "mình", kể lại chỗ từng mắc kẹt và
thứ đã hiệu quả. Quy ước đầy đủ ở [`content/STYLE.md`](content/STYLE.md); đọc file đó trước khi viết
bài mới.

### Component dùng được trong MDX

```mdx
<Callout type="tip" title="Mẹo">Nội dung nhấn mạnh. type: tip | info | warning | danger</Callout>

<Callout type="story">Đoạn kể chuyện cá nhân — hiện ra như lời tâm sự bên lề.</Callout>

<Cards>
  <Card title="Tiêu đề" href="/english/faq/" emoji="🧭">Mô tả ngắn.</Card>
</Cards>

<Steps>
### 1. Bước một
### 2. Bước hai
</Steps>
```

Link nội bộ trong MDX viết **không kèm tiền tố ngôn ngữ** (`/english/faq/`). Tiền tố được thêm lúc
render, nên cùng một file dùng lại được cho mọi ngôn ngữ.

## SEO

| Thứ | Ở đâu |
| --- | --- |
| `<title>`, description, keywords, OpenGraph, Twitter card | [`lib/metadata.ts`](lib/metadata.ts) |
| canonical + `hreflang` (kèm `x-default`) | `alternatesFor()` — mọi trang |
| JSON-LD: `WebSite`, `Person`, `Blog`, `BlogPosting`, `BreadcrumbList` | [`lib/schema.ts`](lib/schema.ts) |
| `sitemap.xml` (có alternates từng ngôn ngữ) | [`app/sitemap.ts`](app/sitemap.ts) |
| `robots.txt` | [`app/robots.ts`](app/robots.ts) |
| Favicon | [`app/icon.svg`](app/icon.svg) |

URL tuyệt đối lấy từ `NEXT_PUBLIC_SITE_URL` (mặc định `http://localhost:3000`). Workflow deploy set
biến này từ `actions/configure-pages`, nên khi deploy thật canonical sẽ trỏ đúng domain.

## Màu nhấn hoạt động thế nào

Tailwind biên dịch `bg-brand-600` thành `var(--color-brand-600)`. Layout của mỗi collection đặt
`data-accent="<accent>"` lên phần tử bọc, và CSS trong [`app/globals.css`](app/globals.css) ghi đè
đúng bộ biến đó. Nên đổi màu cả một bộ nội dung = sửa **một dòng JSON**, không đụng tới class nào.

Thêm bảng màu mới: thêm một block `[data-accent='ten-mau']` trong `globals.css` và thêm tên vào
`ACCENTS` trong [`lib/content.ts`](lib/content.ts).

## Đổi tên / mô tả trang

Tên site, tác giả, link repo, domain: [`lib/site.ts`](lib/site.ts).
Tagline, mô tả, keywords (dịch được): `site.*` trong `messages/<locale>.json`.

## Deploy lên GitHub Pages

1. Push repo lên GitHub, nhánh `main`.
2. **Settings → Pages → Build and deployment → Source** → chọn **GitHub Actions**.
3. Push một commit. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) sẽ build và deploy.

`basePath` lấy tự động từ `actions/configure-pages` qua `NEXT_PUBLIC_BASE_PATH`, nên project page
(`user.github.io/<repo>`) lẫn user page (`user.github.io`) đều chạy đúng, không cần sửa config.

Thử local với basePath:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo> pnpm build && npx serve out
```

## Cấu trúc code

| Đường dẫn | Vai trò |
| --- | --- |
| `content/<collection>/` | Toàn bộ nội dung — chỗ duy nhất bạn cần đụng tới khi viết bài |
| `content/STYLE.md` | Quy ước giọng viết cho mọi bài |
| `messages/<locale>.json` | Chuỗi giao diện của từng ngôn ngữ |
| `i18n.config.json` | Danh sách ngôn ngữ + ngôn ngữ mặc định (dùng chung cho code và script) |
| `lib/i18n.ts` | Locale, URL theo locale, tra chuỗi (`t`) |
| `lib/site.ts` | Tên site, tác giả, link repo, domain |
| `lib/content.ts` | Khám phá collection, đọc MDX, gộp bản dịch, dựng sidebar/TOC/pager |
| `lib/metadata.ts` | canonical, hreflang, OpenGraph, Twitter |
| `lib/schema.ts` | JSON-LD |
| `app/(vi)/` | Route tiếng Việt (không tiền tố) + root layout `lang="vi"` |
| `app/(en)/en/` | Route tiếng Anh + root layout `lang="en"` |
| `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg` | Sitemap, robots, favicon |
| `components/pages/` | Thân trang dùng chung cho mọi ngôn ngữ |
| `components/` | Header, sidebar, tìm kiếm, mục lục, đổi ngôn ngữ, MDX components |
| `scripts/new.mjs` | Scaffold collection / bài viết / bản dịch |
| `scripts/check-messages.mjs` | Đối chiếu các file `messages/*.json` (chạy trước dev/build) |
| `scripts/build-search-index.mjs` | Sinh `public/search-index.json` cho mọi ngôn ngữ (chạy trước dev/build) |
