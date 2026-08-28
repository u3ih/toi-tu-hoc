# Tôi Tự Học Tiếng Anh

Trang hướng dẫn tự học Tiếng Anh theo phương pháp immersion. Next.js (App Router) + Tailwind CSS v4,
xuất tĩnh và tự động deploy lên GitHub Pages.

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000
```

`npm run dev` và `npm run build` đều tự chạy `scripts/build-search-index.mjs` trước để dựng lại
`public/search-index.json` cho ô tìm kiếm.

## Thêm / sửa nội dung

1. Tạo file `content/<slug>.mdx` với frontmatter:

   ```mdx
   ---
   title: Tiêu đề bài
   description: Mô tả ngắn hiện dưới tiêu đề và trong kết quả tìm kiếm.
   ---

   Nội dung bằng Markdown / MDX.
   ```

2. Thêm một dòng vào `lib/nav.ts` với đúng `slug` đó.

Route, sidebar, mục lục, prev/next và chỉ mục tìm kiếm đều tự sinh — không phải sửa gì thêm.

### Component dùng được trong MDX

```mdx
<Callout type="tip" title="Mẹo">Nội dung nhấn mạnh. type: tip | info | warning | danger</Callout>

<Cards>
  <Card title="Tiêu đề" href="/guide/slug/" emoji="🧭">Mô tả ngắn.</Card>
</Cards>

<Steps>
### 1. Bước một
### 2. Bước hai
</Steps>
```

## Deploy lên GitHub Pages

1. Push repo lên GitHub, nhánh `main`.
2. Vào **Settings → Pages → Build and deployment → Source** và chọn **GitHub Actions**.
3. Push tiếp một commit. Workflow `.github/workflows/deploy.yml` sẽ build và deploy.

`basePath` được lấy tự động từ `actions/configure-pages` qua biến `NEXT_PUBLIC_BASE_PATH`, nên cả
project page (`user.github.io/<repo>`) lẫn user page (`user.github.io`) đều chạy đúng mà không cần
sửa config.

Muốn thử local với basePath:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo> npm run build && npx serve out
```

## Cấu trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `content/*.mdx` | Toàn bộ nội dung bài viết |
| `lib/nav.ts` | Cấu trúc sidebar và thứ tự bài |
| `lib/content.ts` | Đọc MDX, tách heading, tính thời gian đọc |
| `app/guide/[[...slug]]/` | Route render một bài |
| `components/` | Header, sidebar, tìm kiếm, mục lục, MDX components |
| `scripts/build-search-index.mjs` | Sinh `public/search-index.json` |
