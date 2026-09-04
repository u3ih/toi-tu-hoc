# Tôi Tự Học

Trang tổng hợp các **bộ nội dung tự học** (tiếng Anh, lập trình, và bất cứ chủ đề nào bạn thêm sau
này). Next.js App Router + Tailwind CSS v4, xuất tĩnh, song ngữ, tự động deploy lên GitHub Pages.

## Chạy local

```bash
pnpm install
pnpm dev           # http://localhost:3000
```

| Lệnh | Làm gì |
| --- | --- |
| `pnpm dev` | Chạy dev server |
| `pnpm build` | Build tĩnh ra `out/` (kèm ảnh social, RSS, `llms.txt`) |
| `pnpm lint` | Biome: format + lint, chỉ báo lỗi |
| `pnpm lint:fix` | Biome: sửa được gì thì sửa |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check:i18n` | So bộ key giữa các `messages/<locale>.json` |
| `pnpm new` | Tạo collection / bài mới (xem [Thêm một chủ đề mới](#thêm-một-chủ-đề-mới)) |

Lint và typecheck chạy trong CI trước khi build, nên một lỗi format không lọt lên production chỉ vì
build vẫn thành công.

### Biome

Một công cụ làm cả format và lint, nên repo này **không** có Prettier hay ESLint. Cấu hình:
[`biome.jsonc`](biome.jsonc) — file `.jsonc` để giải thích được từng lựa chọn ngay tại chỗ.

Hai điểm cần biết:

- **`app/globals.css` bị loại khỏi Biome.** Các at-rule của Tailwind v4 (`@theme`, `@utility`,
  `@custom-variant`, `@plugin`) chưa có trong parser CSS của Biome, nên nó đọc file thành lỗi cú pháp.
- **`biome check --write --unsafe` có thể làm sai logic.** Nó từng xoá `[pathname]` khỏi một
  `useEffect` (drawer thôi không tự đóng khi chuyển trang), xoá `[query, scope]` khỏi một cái khác
  (con trỏ kết quả tìm kiếm trỏ vào dòng cũ), và xoá `autoFocus` khỏi ô lọc chủ đề. Những chỗ đó giờ
  có `biome-ignore` kèm lý do. Đọc diff trước khi commit `--unsafe`.

Suppression phải nằm **ngay dòng trên** dòng bị báo — với thuộc tính JSX là bên trong danh sách
thuộc tính, không phải trên thẻ.

## Kiến trúc: mọi thứ là "collection"

Một collection = **một thư mục trong `content/`**. Không có file đăng ký tập trung, không phải sửa
code khi thêm chủ đề mới.

```
content/
  categories.json           ← nhóm chủ đề (Kỹ năng, Sức khỏe, Cuộc sống…) — tuỳ chọn
  tags.json                 ← nhãn hiển thị cho thẻ — tuỳ chọn
  english/
    collection.json         ← tên, mô tả, emoji, màu, nhóm, các section (mỗi thứ một bản/ngôn ngữ)
    introduction.mdx        ← bản tiếng Việt (locale mặc định)
    introduction.en.mdx     ← bản tiếng Anh
    faq.mdx
  programming/
    collection.json
    ...
```

Từ đó tự sinh ra: route `/vi/english/`, `/vi/english/faq/`, `/en/english/faq/`, sidebar, mục lục,
prev/next, breadcrumb, thẻ trên trang chủ, dropdown chuyển chủ đề, chỉ mục tìm kiếm, ảnh social,
`sitemap.xml`, `robots.txt`, RSS, `llms.txt`, canonical + hreflang và JSON-LD.

Có ba tầng, để site chịu được vài chục chủ đề chứ không chỉ hai:

| Tầng | Là gì | Khai báo ở |
| --- | --- | --- |
| **Category** | Nhóm các collection lại (`Kỹ năng` gồm `english` + `programming`) | `content/categories.json` |
| **Collection** | Một thư mục nội dung, một route gốc | `content/<slug>/collection.json` |
| **Tag** | Sợi chỉ **xuyên** collection (`habit` có mặt ở cả `english` và `health`) | `tags:` trong frontmatter |

Category quyết định trang chủ và `/topics/` xếp thế nào. Tag sinh ra `/tags/` và `/tags/<tag>/`, và
là thứ tạo ra khối "Đọc tiếp" ở cuối mỗi bài — chỗ duy nhất người đọc nhảy được sang chủ đề khác.

## Đa ngôn ngữ

**Key luôn là tiếng Anh, chỉ chữ mới dịch.** Tên thư mục collection, slug bài viết và `key` của
section là định danh route — giống hệt nhau ở mọi ngôn ngữ. Nhờ vậy một trang chỉ có một hình dạng
URL, và nút đổi ngôn ngữ chỉ cần đổi tiền tố, không cần bảng ánh xạ.

| Ngôn ngữ | URL |
| --- | --- |
| `vi` (mặc định) | `/vi/english/reading/` |
| `en` | `/en/english/reading/` |

**Mọi ngôn ngữ đều có tiền tố**, kể cả ngôn ngữ mặc định. Đó là điều kiện để cả site nằm trong **một**
cây route `app/[locale]/` thay vì một cây chép tay cho mỗi ngôn ngữ — thêm ngôn ngữ mới không tạo ra
một file route nào.

`/` là trang chuyển ngôn ngữ: `canonical` trỏ về `/vi/`, `<meta refresh>` chuyển ngay, và một script
nhỏ ưu tiên ngôn ngữ đã lưu rồi tới `navigator.languages`. Không có JavaScript thì vẫn là một danh
sách link đọc được. Trang này **không** đặt `noindex`: `noindex` trên một trang có `canonical` có thể
lan sang trang đích, tức là làm mất index của chính trang chủ.

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
4. Thêm `title` / `description` / `sections[].title` cho ngôn ngữ đó trong từng `collection.json`.

**Không có bước nào trong `app/`.** `generateStaticParams` của `[locale]` đọc từ `i18n.config.json`,
nên route, ảnh social, RSS và `llms.txt` của ngôn ngữ mới sinh ra ngay.

`<html lang>` lấy từ chính route param trong [`app/(site)/[locale]/layout.tsx`](app/(site)/[locale]/layout.tsx),
nên nó đúng ngay trong HTML tĩnh — không phải sửa sau khi hydrate.

Site có **hai** root layout, chia bằng route group: `(router)` cho `/` và `(site)` cho mọi thứ còn
lại. Đó là cách Next cho phép hai cây có `<html>` riêng, và là lý do trang chuyển ngôn ngữ không bị
nhồi vào một locale mà nó không thuộc về.

### Thêm một chủ đề mới

```bash
pnpm new japanese              # tạo thư mục + collection.json (stub sẵn mọi ngôn ngữ)
pnpm new japanese kana         # tạo bài đầu tiên
pnpm new japanese kanji grammar
```

Rồi sửa nội dung. Hết. Không đụng vào `app/` hay `components/`.

Tên collection, slug và section key phải là **key tiếng Anh viết thường** (`a-z`, `0-9`, `-`);
script từ chối nếu không đúng.

### Nhóm chủ đề — `content/categories.json`

```json
{
  "categories": [
    {
      "key": "health",
      "emoji": "💪",
      "order": 2,
      "title": { "vi": "Sức khỏe", "en": "Health" },
      "description": { "vi": "Mô tả nhóm.", "en": "Group description." }
    }
  ]
}
```

Collection trỏ vào nhóm bằng `"category": "health"`. Nhóm nào chưa có collection nào thì không hiện
ra — file này khai báo được trước hướng đi của site mà trang chủ không bày kệ trống. Collection
không khai `category` rơi vào nhóm "Khác" ở cuối.

File này **không bắt buộc**: bỏ nó đi thì trang chủ về lại một lưới thẻ phẳng.

### `collection.json`

Trường nào hiển thị ra màn hình thì nhận một chuỗi (dùng chung mọi ngôn ngữ) hoặc một object theo
ngôn ngữ.

```json
{
  "emoji": "🇬🇧",
  "accent": "indigo",
  "category": "skills",
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
| `accent` | Màu nhấn riêng cho cả bộ: `indigo`, `violet`, `sky`, `teal`, `emerald`, `lime`, `amber`, `clay`, `rose`, `plum` |
| `hue` | Thay cho `accent` khi mười màu trên đã dùng hết: một số `0`–`359`, ramp tự sinh (xem [Màu nhấn](#màu-nhấn-hoạt-động-thế-nào)) |
| `category` | Key của nhóm trong `content/categories.json` |
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
tags: [habit, mindset]  # tuỳ chọn — sinh ra /tags/<tag>/ và khối "Đọc tiếp"
schema: faq             # tuỳ chọn — faq | howto, xem phần SEO
date: 2026-02-14        # tuỳ chọn — vào JSON-LD và <pubDate> của RSS
updated: 2026-08-01     # tuỳ chọn — vào JSON-LD và <lastmod> của sitemap
---
```

`section` (key tiếng Anh) quyết định bài nằm nhóm nào trong sidebar, `order` quyết định thứ tự trong
nhóm đó.

### Thẻ — `tags:`

Thẻ là **key tiếng Anh viết thường**, giống `section` và slug, vì chúng nằm trong URL. Nhãn hiển thị
là tuỳ chọn, khai trong `content/tags.json`:

```json
{
  "labels": {
    "habit": { "vi": "Thói quen", "en": "Habits" }
  }
}
```

Thẻ chưa có nhãn thì hiện chính key (gạch ngang đổi thành khoảng trắng). Thẻ chỉ khai trong file
locale mặc định (`bai.mdx`) — bản dịch không cần lặp lại, để thứ tự và nhóm không bao giờ lệch nhau
giữa các ngôn ngữ.

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
| Ảnh social 1200×630, sinh sẵn cho **mọi** trang | [`lib/og.tsx`](lib/og.tsx) + các file `opengraph-image.tsx` |
| JSON-LD: `WebSite`, `Person`, `Blog`, `BlogPosting`, `BreadcrumbList`, `ItemList` | [`lib/schema.ts`](lib/schema.ts) |
| JSON-LD `FAQPage` / `HowTo` (bật bằng `schema:` trong frontmatter) | `faqNode()` / `howToNode()` |
| RSS 2.0, mỗi ngôn ngữ một feed | [`lib/feed.ts`](lib/feed.ts) → `/feed.xml`, `/en/feed.xml` |
| `sitemap.xml` (có alternates từng ngôn ngữ + `<lastmod>`) | [`app/sitemap.ts`](app/sitemap.ts) |
| `robots.txt` | [`app/robots.ts`](app/robots.ts) |
| Favicon | [`app/icon.svg`](app/icon.svg) |

### `schema:` — khi một bài không chỉ là bài viết

```mdx
---
title: Câu hỏi thường gặp
schema: faq      # mỗi `##` thành một câu hỏi, phần dưới nó thành câu trả lời
---
```

| Giá trị | Sinh ra | Dùng khi |
| --- | --- | --- |
| `faq` | `FAQPage` + `Question`/`Answer` | Bài thật sự là một danh sách câu hỏi (mỗi `##` là một câu) |
| `howto` | `HowTo` + `HowToStep` | Bài là một chuỗi bước theo thứ tự (mỗi `##`, hoặc `###` nếu không có `##`) |

Đây là điểm khác biệt lớn nhất với **GEO** (tối ưu cho máy trả lời — ChatGPT, Perplexity, AI
Overviews): một câu trả lời nằm trong `acceptedAnswer` là câu trả lời máy trích ra được **nguyên
vẹn**; cùng đoạn văn đó trong một bài viết thường thì máy phải tự đoán câu trả lời dừng ở đâu.

Không khai `schema:` thì bài vẫn là `BlogPosting` như cũ — chỉ là không có phần thêm.

### GEO — tối ưu cho máy trả lời

SEO là để người ta tìm ra trang. GEO là để máy trả lời (ChatGPT, Perplexity, AI Overviews) **trích
đúng** thứ trang này nói. Bốn thứ dưới đây làm việc đó, và ba trong bốn là tự động.

| Thứ | Ở đâu | Cần tay không |
| --- | --- | --- |
| `/llms.txt` — mục lục toàn site, mỗi bài một dòng kèm URL | [`scripts/build-llms.mjs`](scripts/build-llms.mjs) | Không |
| `/llms-full.txt` — toàn bộ nội dung trong một file | cùng script | Không |
| `/<đường-dẫn>/index.md` — bản markdown của **từng** bài | cùng script | Không |
| `citation` trong JSON-LD | lấy từ mục `## Nguồn cho bài này` sẵn có | Không |
| `abstract` + `speakable` | `takeaways:` trong frontmatter | **Có** |
| `about` — nối chủ đề tới Wikipedia/Wikidata | `about:` trong frontmatter | **Có** |

```mdx
---
takeaways:
  - Mục tiêu tháng đầu không phải giỏi lên, mà là dựng được thói quen.
  - Chọn một nguồn nghe và một nguồn đọc rồi thôi không tìm nữa.
about:
  - name: Comprehensible input
    sameAs: https://en.wikipedia.org/wiki/Input_hypothesis
  - name: Stephen Krashen        # chỉ có name cũng được
---
```

`takeaways` hiện thành hộp **Ý chính** ở đầu bài — cùng một thứ vừa giúp người đọc quyết định có đọc
tiếp không, vừa cho máy một đoạn ngắn tự đứng được để trích. Quy ước viết nằm ở
[`content/STYLE.md`](content/STYLE.md).

`citation` **không** cần khai thêm: script tìm mục `## Nguồn cho bài này` (tiếng Anh:
`## Sources for this page`) và lấy link trong đó. Tên mục lấy từ `doc.sourcesHeading` trong
`messages/<locale>.json`, nên đổi cách gọi mục thì sửa ở đó.

Bản mirror `.md` sinh ra sau `next build`, ghi thẳng vào `out/`. Chạy `pnpm build` là có; `pnpm dev`
thì không, vì chúng là thứ dành cho crawler chứ không phải cho người.

### Ảnh social

Mọi trang có một ảnh 1200×630 sinh sẵn lúc build: màu spine lấy theo collection, nên chia sẻ một
bài tiếng Anh trông khác một bài lập trình. Không cần thiết kế gì thủ công.

Font hiển thị tải từ Google Fonts lúc build; **build không có mạng vẫn chạy**, chỉ là card rơi về
font mặc định của `next/og`. Emoji bị loại khỏi card có chủ ý: satori tải một SVG mỗi emoji từ CDN
và lần tải đó không có đường lùi.

URL tuyệt đối lấy từ `NEXT_PUBLIC_SITE_URL` (mặc định `http://localhost:3000`). Workflow deploy set
biến này từ `actions/configure-pages`, nên khi deploy thật canonical sẽ trỏ đúng domain.

## Màu nhấn hoạt động thế nào

Tailwind biên dịch `bg-brand-600` thành `var(--color-brand-600)`. Layout của mỗi collection đặt cả
bộ biến `--color-brand-*` làm inline style lên phần tử bọc, nên mọi class `brand-*` bên dưới đổi màu
theo. Đổi màu cả một bộ nội dung = sửa **một dòng JSON**, không đụng tới class nào.

Ramp được **sinh ra**, không viết tay: [`lib/accent.ts`](lib/accent.ts) giữ cố định đường cong độ
sáng và độ bão hoà — đó là thứ làm mọi collection trông như in cùng một máy — nên một bảng màu chỉ
còn là một góc màu.

```json
{ "accent": "teal" }                      // một trong mười tên có sẵn
{ "hue": 320 }                            // góc màu bất kỳ, 0-359
{ "hue": 82, "hueEnd": 45, "chroma": 0.9 } // ramp trôi màu khi tối dần, như mustard sang cam cháy
```

Nên thêm chủ đề thứ hai mươi tốn **một con số**, không tốn một block CSS.

## Đổi tên / mô tả trang

Tên site, tác giả, link repo (`repoUrl` + `repoBranch`, dùng cho link footer và nút "sửa bài này
trên GitHub"), domain: [`lib/site.ts`](lib/site.ts).
Tagline, mô tả, keywords (dịch được): `site.*` trong `messages/<locale>.json`.

## Đóng góp

Sửa lỗi chính tả, cập nhật số liệu, hay viết thêm bài — cứ mở pull request. Cách nhanh nhất là bấm
**✏️ Sửa bài này trên GitHub** ở cuối mỗi bài: GitHub tự fork repo và đưa bạn thẳng tới form pull
request. Các bước chi tiết (cả cách fork rồi làm ở máy) nằm ở [`CONTRIBUTING.md`](CONTRIBUTING.md).

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
| `CONTRIBUTING.md` | Cách mở pull request để góp bài hoặc sửa lỗi |
| `messages/<locale>.json` | Chuỗi giao diện của từng ngôn ngữ |
| `i18n.config.json` | Danh sách ngôn ngữ + ngôn ngữ mặc định (dùng chung cho code và script) |
| `lib/i18n.ts` | Locale, URL theo locale, tra chuỗi (`t`) |
| `lib/site.ts` | Tên site, tác giả, link repo, domain |
| `biome.jsonc` | Format + lint (thay cho Prettier và ESLint) |
| `lib/content.ts` | Khám phá collection, đọc MDX, gộp bản dịch, dựng sidebar/TOC/pager, category, tag, "Đọc tiếp" |
| `lib/accent.ts` | Sinh ramp `--color-brand-*` từ một góc màu |
| `lib/metadata.ts` | canonical, hreflang, OpenGraph, Twitter |
| `lib/schema.ts` | JSON-LD (kèm `FAQPage`, `HowTo`) |
| `lib/og.tsx` | Ảnh social sinh lúc build |
| `lib/feed.ts` | RSS |
| `scripts/lib/content.mjs` | Bản đọc content tree dùng chung cho mọi build script |
| `scripts/build-llms.mjs` | `llms.txt`, `llms-full.txt`, mirror `.md` từng bài |
| `app/(router)/` | Trang chuyển ngôn ngữ ở `/` + `/feed.xml` — root layout riêng |
| `app/(site)/[locale]/` | Toàn bộ site, một cây cho mọi ngôn ngữ; root layout đặt `<html lang>` |
| `app/(site)/[locale]/topics/`, `.../tags/` | Trang hub: toàn bộ chủ đề, toàn bộ thẻ |
| `lib/route.ts` | Đọc + kiểm tra `locale` từ route param |
| `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg` | Sitemap, robots, favicon |
| `components/pages/` | Thân trang dùng chung cho mọi ngôn ngữ |
| `components/` | Header, sidebar, tìm kiếm, mục lục, đổi ngôn ngữ, MDX components |
| `scripts/new.mjs` | Scaffold collection / bài viết / bản dịch |
| `scripts/check-messages.mjs` | Đối chiếu các file `messages/*.json` (chạy trước dev/build) |
| `scripts/build-search-index.mjs` | Sinh `public/search-index.json` cho mọi ngôn ngữ (chạy trước dev/build) |
