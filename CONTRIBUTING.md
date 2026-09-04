# Góp một bài / sửa một lỗi

Trang này là nội dung mở. Thấy sai chính tả, link chết, số liệu lỗi thời, hay muốn viết thêm một
bài — cứ mở pull request. Không cần xin phép trước.

Repo: <https://github.com/u3ih/toi-tu-hoc>

---

## Cách 1 — Sửa ngay trên GitHub (không cần cài gì)

Hợp cho sửa chữ, sửa link, thêm một đoạn. Mất khoảng một phút.

1. Ở cuối mỗi bài trên web, bấm **✏️ Sửa bài này trên GitHub**. (Hoặc mở thẳng file trong
   `content/<collection>/` rồi bấm biểu tượng bút chì.)
2. GitHub báo bạn không có quyền ghi và hỏi có muốn **fork** không → bấm **Fork this repository**.
   Nó tự tạo một bản sao repo trong tài khoản bạn.
3. Sửa nội dung trong ô soạn thảo. Tab **Preview** xem trước Markdown.
4. Bấm **Commit changes…**:
   - *Commit message*: một dòng ngắn, xem [quy ước commit](#quy-ước-commit) bên dưới.
   - Chọn **Create a new branch for this commit and start a pull request**.
5. Bấm **Propose changes** → **Create pull request**. Viết một hai câu nói bạn sửa gì và vì sao.
6. Xong. GitHub Actions sẽ build thử; mình đọc và merge.

## Cách 2 — Fork rồi làm ở máy

Hợp cho viết bài mới, sửa nhiều file, hoặc muốn xem thử giao diện trước khi gửi.

```bash
# 1. Fork repo trên GitHub (nút Fork, góc trên bên phải), rồi clone bản fork của bạn
git clone git@github.com:<tên-github-của-bạn>/toi-tu-hoc.git
cd toi-tu-hoc

# 2. Trỏ về repo gốc để sau này lấy commit mới
git remote add upstream git@github.com:u3ih/toi-tu-hoc.git

# 3. Tạo nhánh riêng — đừng làm thẳng trên main
git checkout -b sua-bai-listening-gap

# 4. Cài và chạy
pnpm install
pnpm dev                  # http://localhost:3000
```

Sửa xong:

```bash
pnpm check:i18n           # các file messages/*.json phải khớp key nhau
pnpm typecheck            # không được có lỗi TypeScript
pnpm build                # build tĩnh phải chạy trót lọt

git add -A
git commit -m "content: sửa số liệu phần listening gap"
git push origin sua-bai-listening-gap
```

Rồi mở link GitHub in ra sau lệnh `push` (hoặc vào repo fork, bấm **Compare & pull request**). Chọn
base là `u3ih/toi-tu-hoc` nhánh `main`, compare là nhánh của bạn → **Create pull request**.

Muốn cập nhật nhánh khi repo gốc có commit mới:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease origin sua-bai-listening-gap
```

---

## Viết nội dung

Toàn bộ nội dung nằm trong `content/<collection>/`. Không cần đụng tới `app/` hay `components/`.

```bash
pnpm new english shadowing              # tạo bài mới: content/english/shadowing.mdx
pnpm new english shadowing --locale en  # tạo bản dịch: shadowing.en.mdx
pnpm new japanese                       # tạo cả một collection mới
```

Quy ước bắt buộc:

- **Đọc [`content/STYLE.md`](content/STYLE.md) trước khi viết.** Giọng văn là ngôi thứ nhất, xưng
  "mình", kể lại chỗ từng mắc kẹt — không phải bài tổng hợp vô nhân xưng.
- **Mọi con số không phải trải nghiệm cá nhân đều phải dẫn nguồn**, và bài phải có mục
  `## Nguồn cho bài này` ở cuối, mỗi dòng ghi rõ nguồn đó cho ra con số nào.
- Tên file, slug, tên collection và `section` key luôn là **tiếng Anh viết thường** (`a-z`, `0-9`,
  `-`). Chỉ phần chữ hiển thị mới dịch.
- Bản tiếng Việt là `<slug>.mdx`, bản tiếng Anh là `<slug>.en.mdx`. Frontmatter bản dịch chỉ cần
  `title` và `description` — `section` và `order` luôn lấy từ file gốc.
- Link nội bộ viết **không kèm tiền tố ngôn ngữ**: `/english/faq/`, không phải `/en/english/faq/`.
- Sửa chữ giao diện thì sửa trong `messages/<locale>.json`, **mọi ngôn ngữ cùng lúc** — thiếu một key
  là build đỏ.

Chi tiết frontmatter, `collection.json`, component dùng được trong MDX: xem [`README.md`](README.md).

## Quy ước commit

[Conventional Commits](https://www.conventionalcommits.org/), tiêu đề ngắn gọn:

| Tiền tố | Dùng khi |
| --- | --- |
| `content:` | Thêm / sửa bài viết |
| `fix:` | Sửa lỗi code, link chết, lỗi chính tả trong giao diện |
| `feat:` | Thêm tính năng |
| `refactor:` | Đổi code mà không đổi hành vi |
| `chore:` | Việc lặt vặt, cấu hình, dependency |

Ví dụ: `content: thêm bài về shadowing`, `fix: sửa link asbplayer chết`.

## Pull request thế nào là dễ merge

- **Một PR một việc.** Sửa chính tả và thêm bài mới thì tách thành hai PR.
- Mô tả nói rõ *sửa gì* và *vì sao*. Nếu sửa số liệu, dán link nguồn vào luôn.
- Đã chạy `pnpm check:i18n`, `pnpm typecheck`, `pnpm build` mà không lỗi (Cách 1 thì CI chạy hộ).
- Không commit `out/`, `.next/`, `node_modules/`.
- PR còn dở cứ mở dạng **Draft**, hỏi được ngay trong đó.

Không chắc ý tưởng có hợp không? Mở [issue](https://github.com/u3ih/toi-tu-hoc/issues/new) hỏi trước
cho đỡ mất công viết.

---

## In English

This site's content is open. To fix a typo or a dead link, click **✏️ Edit this page on GitHub** at
the bottom of any page: GitHub forks the repo for you, and committing on a new branch drops you
straight on the pull-request form.

For anything larger, fork the repo, branch off `main`, then:

```bash
pnpm install && pnpm dev
pnpm check:i18n && pnpm typecheck && pnpm build   # all three must pass
```

Content lives in `content/<collection>/` — `<slug>.mdx` is Vietnamese (the default locale),
`<slug>.en.mdx` is the English translation. Folder names, slugs and section keys are always
lowercase English; only display text is translated. Read [`content/STYLE.md`](content/STYLE.md)
before writing: first-person voice, and every number that isn't personal experience needs a cited
source plus a `## Sources for this page` section at the end (`## Nguồn cho bài này` in Vietnamese).

Commit messages follow Conventional Commits (`content:`, `fix:`, `feat:`, `refactor:`, `chore:`).
One PR per change, and say what you changed and why.
