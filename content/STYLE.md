# Giọng viết của trang này

Áp dụng cho **mọi collection**, không riêng tiếng Anh. Viết bài mới thì bám theo file này.

## Nguyên tắc gốc

Đây là **ghi chép cá nhân**, không phải giáo trình. Người đọc tin bạn vì bạn đã tự đi qua đoạn đường
đó, chứ không phải vì bạn tổng hợp được nhiều thông tin.

## Xưng hô

- Xưng **"mình"**. Không dùng "tôi", "chúng ta", "chúng tôi".
- Gọi người đọc là **"bạn"**.
- Không viết kiểu vô nhân xưng ("người học nên...", "cần phải..."). Viết "mình đã...", "mình khuyên...".

## Cấu trúc một bài

Bài nào cũng nên có ít nhất một trong ba thứ sau, nếu không nó chỉ là bài tổng hợp như mọi nơi khác:

1. **Một chỗ mình từng mắc kẹt** — càng cụ thể càng tốt.
2. **Thứ mình đã thử mà không hiệu quả** — và vì sao.
3. **Thứ cuối cùng đã hiệu quả** — kèm con số hoặc mốc thời gian thật nếu nhớ được.

Thứ tự hay dùng: *mình đã sai thế nào → vì sao sai → mình đổi sang cách gì → cách làm cụ thể.*

## Mở bài bằng `takeaways`

Mỗi bài nên có **ba tới bốn** dòng `takeaways` trong frontmatter — bài này nói gì, gọn tới mức đọc
xong bốn dòng là biết có nên đọc tiếp hay không.

```mdx
---
title: 30 ngày đầu tiên
takeaways:
  - Mục tiêu tháng đầu không phải giỏi lên, mà là dựng được thói quen.
  - Chọn một nguồn nghe và một nguồn đọc rồi thôi không tìm nữa.
---
```

- **Mỗi dòng phải đứng một mình được.** Người đọc chỉ đọc bốn dòng này vẫn hiểu; máy trả lời chỉ
  trích một dòng vẫn không sai nghĩa.
- **Viết như kết luận, không như tiêu đề.** "Nghe 30 phút mỗi ngày ăn 3 tiếng cuối tuần" tốt hơn
  "Về tần suất nghe".
- **Không hứa hẹn.** Đây là chỗ dễ trượt sang giọng quảng cáo nhất trong cả bài.
- Bản dịch có `takeaways` riêng; chưa dịch thì bài tiếng Anh dùng lại bản tiếng Việt.

Bốn dòng này hiện thành hộp **Ý chính** ở đầu bài, và đi vào `abstract` + `speakable` trong JSON-LD —
tức là đúng đoạn mà ChatGPT, Perplexity hay AI Overviews sẽ trích khi trả lời câu hỏi của người ta.

## Khai `level:`

Mỗi bài khai `level: beginner | intermediate | advanced`. Tiêu chí là **bài này giả định người đọc đã
biết gì**, không phải bài khó hay dễ:

- `beginner` — không giả định gì ngoài việc người đọc quan tâm chủ đề.
- `intermediate` — giả định người đọc đã làm theo mấy bài `beginner` và đang mắc ở tầng sau.
- `advanced` — giả định người đọc đã đi được một đoạn dài và đang tinh chỉnh.

## Đặt tiêu đề `##` thành câu hỏi

Chỗ nào một mục thật sự trả lời một câu hỏi thì viết heading thành câu hỏi đó, đúng cách người ta gõ
vào ô tìm kiếm.

- Nên: `## Mình cần biết bao nhiêu từ thì đọc được sách?`
- Tránh: `## Về số lượng từ vựng`

Không phải mọi heading — bài toàn câu hỏi đọc rất mệt. Nhưng mỗi bài nên có vài cái, và bài nào là
danh sách câu hỏi thì khai `schema: faq` trong frontmatter để nó thành `FAQPage`.

## Callout `story`

Dùng `<Callout type="story">` cho những đoạn kể lại một chuyện cụ thể đã xảy ra. Nó hiện ra như một
lời tâm sự bên lề, không phải khung cảnh báo.

```mdx
<Callout type="story">
Tháng đầu mình đặt mục tiêu hai tiếng mỗi ngày. Được bốn ngày thì bỏ.
</Callout>
```

Mỗi bài nên có **một tới hai** cái. Nhiều hơn thì mất tác dụng.

Đừng dùng `story` cho lời khuyên chung — cái đó là `tip`.

## Viết cho dễ hiểu

- **Câu ngắn.** Một ý một câu. Câu dài quá hai dòng thì tách ra.
- **Giải thích thuật ngữ ngay lần đầu dùng.** Ví dụ: "immersion — tạm dịch là *ngâm mình* trong ngôn
  ngữ".
- **Ví dụ cụ thể thay cho khái niệm trừu tượng.** Thay vì "bản dịch làm mất sắc thái", hãy viết
  "mình biết *concern* là 'mối quan tâm', nhưng gặp *To whom it may concern* thì mình chịu".
- **Có con số thì đưa con số.** "sau khoảng 400 giờ nghe" tốt hơn "sau một thời gian dài".
- **Bảng và danh sách** thay cho đoạn văn dài liệt kê nhiều thứ.
- Tránh chữ Hán Việt nặng nề khi có từ thuần Việt tương đương.

## Luôn dẫn nguồn

Con số hoặc khẳng định nào không phải trải nghiệm cá nhân thì **phải có link tới nguồn gốc**.

- **Dẫn ngay tại chỗ** khi con số xuất hiện: `[nghiên cứu của Hu và Nation (2000)](url) cho thấy...`
- **Và gom lại cuối bài** trong mục `## Nguồn cho bài này`, mỗi dòng ghi rõ *nguồn đó cho ra con số
  nào*. Danh sách link suông không có giá trị.
- **Ưu tiên link đọc được miễn phí** — bản PDF của tác giả, kho lưu trữ mở. Đừng dẫn tới trang chỉ
  hiện tóm tắt rồi bắt trả tiền.
- **Nói rõ chỗ nào là của mình.** Nếu một phần trong bài là kinh nghiệm riêng chứ không có nghiên cứu
  nào chống lưng, ghi thẳng ra: *"phần này mình tự tổng kết, không lấy từ nghiên cứu nào"*.
- **Kiểm tra link còn sống** trước khi publish.

Lý do: phần lớn nội dung ở đây là trải nghiệm cá nhân, nên chỗ nào có bằng chứng thật thì phải cho
người đọc kiểm chứng được — và phân biệt được rõ hai loại.

## Những gì cần tránh

- Giọng khẳng định như chân lý ("phương pháp duy nhất đúng là...").
- Hứa hẹn kết quả ("chỉ 30 ngày để thành thạo").
- Nhồi mọi thứ mình biết vào một bài. Thà ngắn mà thật.

## Trước khi publish: thay số liệu thật vào

Các bài hiện có dùng mốc thời gian và con số mang tính minh họa. Trước khi đưa trang cho người khác
đọc, hãy rà lại và thay bằng trải nghiệm thật của bạn — đó chính là thứ làm trang này khác với các
trang tổng hợp khác.

## Bản dịch tiếng Anh

Bản dịch nằm cạnh bản gốc: `reading.mdx` là tiếng Việt, `reading.en.mdx` là tiếng Anh. Tạo bằng
`pnpm new <collection> <slug> --locale en`.

- **Dịch giọng, đừng dịch chữ.** Bản tiếng Anh vẫn phải là "I", vẫn kể chuyện thật, vẫn thừa nhận chỗ
  mình từng sai. Một bản dịch nghe như tài liệu hướng dẫn là dịch hỏng.
- **Giữ nguyên link nội bộ.** Chúng viết không kèm tiền tố ngôn ngữ (`/english/faq/`) và được thêm
  tiền tố lúc render.
- **Frontmatter chỉ cần `title` và `description`.** `section` và `order` luôn lấy từ file tiếng Việt,
  nên thứ tự sidebar không lệch giữa hai ngôn ngữ.
- **Chưa dịch cũng không sao.** Trang tiếng Anh sẽ hiện bản tiếng Việt kèm một dòng báo. Thà để vậy
  còn hơn đăng một bản dịch máy.
