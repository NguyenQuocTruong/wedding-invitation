# Đề xuất UI/UX — Phase 2.1

Ngày: 02/11/2026 · Trạng thái: chờ chọn concept, chưa phê duyệt triển khai.

## 1. Phạm vi và nguồn quyết định

Đã đọc toàn bộ AGENTS.md và các tài liệu hiện có trong docs/: PROJECT_BLUEPRINT.md,
CODEX_SETUP_PROMPT.md, CODEX_CLOUD_HANDOFF.md và kế hoạch Phase 1 trong
superpowers/plans/2026-11-02-phase-1.md.

Blueprint là chuẩn nghiệp vụ. Các mô tả “documentation-only”, “Vercel chưa kết nối”
là bối cảnh lịch sử; người dùng xác nhận Phase 1 đã hoàn tất và đã deploy Vercel.
Chỉ dẫn mới nhất cho phép làm trên main, không cần PR. Phase này chỉ tạo đề xuất;
không thay đổi ứng dụng, API, dependency dự án hoặc cấu hình deploy.

Mục tiêu: chọn một ngôn ngữ thị giác cho thiệp cưới thân mật, dễ đọc với cả người
lớn tuổi, ưu tiên iPhone Safari. Chưa có tên thật, ngày cưới, album, nhạc hoặc QR;
mọi ví dụ dùng nhãn “Cô dâu”, “Chú rể”, không bịa thông tin chuyển khoản.

## 2. Khảo sát tham khảo: bằng chứng và giới hạn

| Nguồn                                              | Vai trò trong brief                                          | Kết quả truy cập tại môi trường                              |
| -------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| https://ngaychungdoi.com/                          | Tham khảo nền tảng thiệp cưới và thư viện mẫu theo blueprint | HTTPS bị proxy chặn: Tunnel connection failed: 403 Forbidden |
| https://www.lamiwedding.com/trungducngocanhwedding | Tham khảo một thiệp cụ thể do người dùng cung cấp            | HTTPS bị proxy chặn: Tunnel connection failed: 403 Forbidden |

**Chưa xem được hình render, DOM, animation hay hành vi tương tác của hai nguồn.**
Không có căn cứ để nhận xét màu sắc, font, tốc độ, chất lượng Safari, RSVP hay QR
cụ thể của chúng. Không coi lỗi proxy là lỗi của website. Không dùng các nguồn
này làm bằng chứng cho một tính năng chưa quan sát.

Phân tích có thể thực hiện hiện tại là xác định vai trò tham khảo và tiêu chí
cần khảo sát, rồi xây dựng ba phương án độc lập từ blueprint. Phần khảo sát
trực tiếp vẫn chưa hoàn tất; cần truy cập lại khi mạng được cho phép.

### Khung khảo sát khi mở được nguồn

| Hạng mục                  | Cần quan sát                                                 | Quyết định cần rút ra cho dự án                                           |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Trang giới thiệu/thư viện | Cách phân nhóm mẫu, thứ bậc thông tin, CTA dẫn đến thiệp     | Chỉ lấy nguyên lý ưu tiên thông tin; không đưa menu bán dịch vụ vào thiệp |
| Phong bì                  | Tap hay kéo, thời gian mở, khả năng bỏ qua, focus sau khi mở | Giữ nghi thức mở nhưng không cản khách xem địa điểm hoặc RSVP             |
| Hero/album                | Tỉ lệ ảnh, cắt ảnh ở màn hình hẹp, độ rõ của tên và ngày     | Chọn vùng an toàn cho khuôn mặt, giới hạn ảnh tải đầu                     |
| Địa điểm/countdown        | Ngày giờ và múi giờ, link bản đồ, trạng thái sau ngày cưới   | Thông tin tĩnh luôn rõ; countdown chỉ bổ trợ                              |
| RSVP/quà mừng             | Trường nhập, lỗi, điều hướng, cách hiện QR và lưu ảnh        | Áp dụng hợp đồng đã chốt; không mang nghiệp vụ khác từ mẫu sang           |
| Motion/audio              | Tự phát nhạc, hiệu ứng cuộn, thao tác khi giảm chuyển động   | Chỉ phát sau thao tác, hỗ trợ reduced motion                              |
| iPhone Safari             | Thanh địa chỉ thay đổi, bàn phím, cuộn, zoom, lưu ảnh        | Ưu tiên thao tác native và đường dự phòng                                 |

Không sao chép source, ảnh, nhạc, logo, template hoặc bố cục đặc trưng của hai
website. Chỉ dùng media người dùng có quyền sử dụng; không hotlink tài nguyên mẫu.

## 3. Quy tắc chung cho cả ba concept

Luồng: phong bì → hero → thông tin lễ cưới và bản đồ → album → countdown →
RSVP → hai QR → lời cảm ơn. Nút “Xem thông tin” cho phép bỏ qua phong bì.
Trên mobile có thể có thanh “Thông tin / Xác nhận” sau khi mở thiệp, nhưng phải
ẩn khi bàn phím hiện và không che nội dung hay nút Safari.

RSVP thiết kế cùng một hợp đồng ở mọi concept:

- Tên khách: bắt buộc, label luôn hiện.
- Bạn là khách của: “Nhà gái” → BRIDE hoặc “Nhà trai” → GROOM, không chọn sẵn.
- Tham dự: “Có, mình sẽ đến” → YES hoặc “Rất tiếc, mình không thể đến” → NO,
  không chọn sẵn.
- Lời nhắn: tùy chọn. Không có trường số lượng người.
- submissionId và clientId là thông tin kỹ thuật, không phải trường để khách nhập.
  Giữ submissionId khi thử lại; chống trùng chỉ best-effort theo blueprint.
- Trạng thái: chưa gửi, lỗi từng trường, đang gửi, đã ghi nhận, lỗi tạm thời.
  Chỉ hiện thành công sau khi backend xác nhận lưu; giữ dữ liệu khi lỗi và có
  nút thử lại. Không hiển thị tên/lời nhắn của khách khác.
- Trước nút gửi: thông báo ngắn dữ liệu chỉ dùng tổ chức sự kiện, chủ tiệc được xem.
  Không thêm tài khoản khách, dashboard hay guestbook công khai.
- BRIDE/GROOM tiếp tục định tuyến BRIDE_RSVP/GROOM_RSVP. Phase 2.1 không tích hợp
  Google Sheets; Phase 2.2 chỉ trình diễn form với trạng thái mô phỏng có nhãn,
  chưa báo đã ghi nhận RSVP thật.

Hai thẻ QR luôn hiện độc lập, kể cả khi khách chọn bên nào hoặc chọn NO.
Mỗi thẻ có nhãn cô dâu/chú rể, ảnh QR, tên người nhận, ngân hàng và nút lưu riêng.
Không có thông tin thật thì hiển thị “Chưa cập nhật”, không sinh mã giả để quét.
QR nền trắng với khoảng trống quanh mã; không đặt hoa, grain hoặc màu theme lên mã.

## 4. Concept A — Thư Hồng Đương Đại

**Cảm giác:** một bức thư trang trọng, ấm áp; nền giấy sáng, chữ đỏ rượu vang,
ảnh ít nhưng có vị trí nổi bật. Hợp đám cưới gia đình, khách nhiều độ tuổi.

### Bảng màu và typography

| Vai trò              | Màu     |
| -------------------- | ------- |
| Nền giấy             | #FFF8F0 |
| Bề mặt thiệp         | #FFFFFF |
| Chữ chính            | #342826 |
| CTA/điểm nhấn        | #7A263A |
| Trang trí/đường viền | #C5A46D |

Tên và heading: Noto Serif, weight 500–600; nội dung, label và nút: Be Vietnam Pro
400–600. Tên 40–52px, heading 26–32px, body 17px/1.65, label tối thiểu 16px.
Không dùng chữ viết tay cho đoạn nội dung. Màu vàng chỉ trang trí, không dùng
làm chữ nhỏ trên nền sáng; kiểm tra contrast của từng tổ hợp trước triển khai.

### Thiết kế từng phần

- **Phong bì:** phong bì giấy ngà, đường gấp mảnh, dấu niêm hình tròn đỏ có chữ
  viết tắt cấu hình sau. Nút thật “Mở thiệp”; tap mở nắp 450–650ms, tờ thiệp
  trượt nhẹ. Có “Xem ngay” bên dưới, không yêu cầu kéo hoặc vuốt chính xác.
- **Hero:** chữ mời nhỏ → hai tên lớn → ảnh chân dung tỉ lệ 4:5 trong khung thẳng
  → ngày và địa điểm → CTA đến thông tin lễ. Không chồng chữ lên mặt người.
- **Gallery:** ảnh đầu toàn chiều rộng, sau đó lưới hai cột; nhấn để xem ảnh lớn,
  có nút đóng, trước/sau. Không autoplay carousel.
- **Countdown:** bốn ô Ngày/Giờ/Phút/Giây, số tabular ổn định; viền mảnh, không
  lật số liên tục.
- **RSVP:** khối giấy trắng, field một cột; lựa chọn BRIDE/GROOM và YES/NO là
  nhóm radio hai hàng chạm lớn; nút đỏ toàn chiều ngang.
- **QR:** hai thẻ xếp dọc trên điện thoại, nhãn “Gửi cô dâu” và “Gửi chú rể”;
  mỗi mã có nút “Lưu mã QR” riêng, không phụ thuộc lựa chọn RSVP.
- **Animation:** fade + translateY tối đa 12px, 250–400ms, chạy một lần;
  không hoa rơi, không parallax bắt buộc. Reduced motion chuyển trực tiếp.
- **Desktop:** cột nội dung tối đa khoảng 960px, album và hai QR có thể hai cột;
  vẫn giữ thứ tự đọc mobile.

**Ưu:** dễ đọc, ít rủi ro hiệu năng; không phụ thuộc bộ ảnh đồng nhất; quen thuộc
với gia đình Việt; triển khai CSS nhẹ.
**Nhược:** cần tiết chế dấu niêm/viền để tránh giống thiệp in phổ thông; ít kịch tính
hơn concept C.

## 5. Concept B — Khu Vườn Trong Nắng

**Cảm giác:** thư thả, tự nhiên; ảnh ngoài trời, khoảng trắng thoáng, màu lá và
kem. Hợp ảnh cưới sân vườn hoặc phong cách đời thường.

### Bảng màu và typography

| Vai trò            | Màu     |
| ------------------ | ------- |
| Nền                | #F5F4EC |
| Bề mặt             | #FFFFFF |
| Chữ chính          | #26392E |
| CTA/mảng lá        | #365C45 |
| Trang trí đất nung | #B9785D |

Heading và tên: Lora 500–600; body/UI: Be Vietnam Pro 400–600. Tên 38–48px,
body 17px/1.7. Chữ nghiêng chỉ dùng một câu mời; không viết hoa toàn đoạn.

### Thiết kế từng phần

- **Phong bì:** bìa giấy kem buộc bằng nét minh họa cành lá gốc do dự án tự tạo;
  nút “Mở lời mời”. Lá dịch tối đa 8px khi mở trong 500ms, không phát tán hạt.
- **Hero:** ảnh ngang 3:2 rồi tên ở nền kem, bố cục căn trái thay vì căn giữa;
  ngày và địa điểm như ghi chú ngắn, CTA xanh lá. Lá nằm ngoài vùng chữ.
- **Gallery:** từng cặp ảnh lớn nhỏ xen kẽ theo CSS grid với tỉ lệ ảnh được giữ
  ổn định; không masonry script; mobile đọc theo thứ tự DOM, có chú thích tùy chọn.
- **Countdown:** một dải sáng, bốn số lớn cách nhau bằng nét ngắn; chi tiết lá
  ở cạnh ngoài, không che nhãn.
- **RSVP:** khối xanh rất nhạt, input trắng rõ ràng, radio có cả chữ và dấu chọn;
  không dùng xanh/đỏ làm tín hiệu duy nhất cho YES/NO.
- **QR:** hai thẻ trắng có nhãn chữ xanh đậm, khoảng trống rộng; lá chỉ ở tiêu đề,
  không quanh vùng quét. Lưu riêng từng ảnh.
- **Animation:** reveal nhẹ theo nhóm; chỉ cân nhắc parallax ảnh nền trên desktop
  ở mức 8–16px, tắt trên mobile và reduced motion. Không cuộn ngang bắt buộc.
- **Desktop:** nhịp ảnh lệch nhẹ hai cột, text tối đa 60–65 ký tự mỗi dòng.

**Ưu:** thân mật, nhiều không gian cho câu chuyện qua ảnh; dễ kết hợp địa điểm
ngoài trời; ít tương phản gắt.
**Nhược:** phụ thuộc ảnh sáng và đồng nhất; ảnh indoor tối dễ lệch mood;
trang trí lá dễ trở thành sáo mòn nếu dùng quá nhiều; album có thể làm trang dài.

## 6. Concept C — Giao Ước Son

**Cảm giác:** bản biên tập nghệ thuật lấy cảm hứng màu son, mực và giấy;
đương đại, mạnh mẽ, thiên về typography. Không sao chép họa tiết nghi lễ hay
ngụ ý phong tục cụ thể khi gia đình chưa chọn.

### Bảng màu và typography

| Vai trò             | Màu     |
| ------------------- | ------- |
| Nền son chủ đạo     | #8C252E |
| Nền giấy phụ        | #FAF1E5 |
| Chữ trên nền son    | #FFF8EF |
| Chữ trên giấy       | #251E1B |
| Điểm nhấn trang trí | #D6B574 |

Tên/heading: Noto Serif Display 600; body/UI: Be Vietnam Pro 400–600.
Tên 44–60px, tự xuống dòng theo cụm từ, không xoay chữ tiếng Việt theo trục dọc.
Body 17–18px; kiểm tra đầy đủ dấu tiếng Việt trong font thực tế.

### Thiết kế từng phần

- **Phong bì:** hai cánh đỏ trượt ngang như mở bìa sách, nút chữ màu kem ở giữa;
  đường tròn đồ họa là hình học gốc, không dùng biểu tượng gia tộc có sẵn.
  Chuyển cảnh 500–700ms, không bắt giữ cuộn.
- **Hero:** nền son, tên serif rất lớn và ngày dạng chữ; ảnh đen trắng hoặc màu
  tự nhiên nằm bên dưới trong khung chữ nhật; trên mobile không tràn tên ra viewport.
- **Gallery:** chuỗi “chương ảnh”: mỗi ảnh lớn kèm số thứ tự nhỏ, xen một dải hai ảnh;
  không dùng scroll-jacking hoặc slide toàn màn hình liên tục.
- **Countdown:** số lớn màu kem trên son, nhãn rõ ràng; không dùng hiệu ứng cuộn số.
- **RSVP:** chuyển sang nền giấy để giảm mỏi mắt; input có viền tối, CTA son.
  Giữ cùng thứ tự field và trạng thái với hai concept còn lại.
- **QR:** nền giấy, hai khối thẳng có tiêu đề son; ảnh QR gốc nền trắng, không
  chuyển mã sang màu son. Mobile xếp dọc; không gộp thành tab ẩn bên còn lại.
- **Animation:** đường phân cách xuất hiện bằng scaleX, chữ fade nhẹ theo khối;
  không tách từng ký tự có dấu để chạy hiệu ứng. Reduced motion bỏ chuyển cảnh.
- **Desktop:** typography lớn và ảnh hai cột; không nhân bản phiên bản trang riêng
  cho desktop/mobile.

**Ưu:** khác biệt rõ ràng, nhận diện mạnh, không cần nhiều trang trí; phù hợp
bộ ảnh có tính biên tập.
**Nhược:** mảng đỏ lớn có thể gây cảm giác nặng; cần kiểm soát độ dài tên,
tương phản và khoảng nghỉ; yêu cầu ảnh/crop kỹ hơn; thử nghiệm mobile cần nhiều hơn.

## 7. Phác thảo cấu trúc để so sánh

Đây là wireframe bằng chữ, **không phải ảnh thiết kế do 12ui tạo**.

| Vị trí    | A — Thư Hồng             | B — Khu Vườn            | C — Giao Ước Son          |
| --------- | ------------------------ | ----------------------- | ------------------------- |
| Mở        | Phong bì giấy, dấu niêm  | Bìa kem, nét lá         | Hai cánh son              |
| Hero      | Tên giữa, ảnh 4:5        | Ảnh ngang, tên căn trái | Tên lớn trên son, ảnh sau |
| Thông tin | Khối thư trang trọng     | Ghi chú thoáng          | Chương chữ rõ nét         |
| Album     | Ảnh lớn + lưới đều       | Cặp ảnh lệch nhịp       | Ảnh chương lớn            |
| RSVP      | Thẻ trắng, nút rượu vang | Khối sáng, nút xanh     | Nền giấy, nút son         |
| QR        | Hai thiệp viền mảnh      | Hai thẻ trắng tối giản  | Hai khối kiểu biên tập    |

## 8. Tiêu chuẩn iPhone Safari và khả năng tiếp cận

Các mục dưới đây là yêu cầu thiết kế/acceptance cho Phase 2.2, chưa phải kết quả test.

- Thiết kế gốc 390px; kiểm tra 320, 375, 390, 430px và landscape.
  Không cuộn ngang; thử text zoom 200% và tên dài có đầy đủ dấu.
- Dùng min-height: 100svh cho intro với fallback; nội dung vẫn cuộn được khi thấp.
  Không khóa height: 100vh hoặc giữ body scroll lock khi mở thiệp.
- Input tối thiểu 16px để tránh Safari tự zoom; vùng chạm tối thiểu 44×44px,
  khoảng cách nút rõ, focus-visible và label liên kết đúng.
- Safe area qua env(safe-area-inset-bottom); thanh cố định nếu có phải nhường
  chỗ cho bàn phím và không che nút gửi. Ưu tiên CTA trong luồng trang.
- Tên cặp đôi là h1; các section có h2; radio dùng fieldset/legend.
  Lỗi liên kết aria-describedby; thông báo gửi dùng vùng live, tránh đọc mỗi giây.
- Countdown lấy thời điểm ISO có offset và múi giờ từ cấu hình. Nếu thiếu ngày:
  “Ngày cưới sẽ được cập nhật”; sau thời điểm sự kiện: lời cảm ơn, không số âm.
  VoiceOver không announce giây liên tục.
- Dùng transform/opacity, Intersection Observer; không thêm GSAP chỉ vì trang trí.
  Reduced motion bỏ intro động, parallax và smooth scroll.
- Nhạc mặc định tắt; chỉ play sau nút do khách chạm; hiển thị đang phát/tạm dừng
  và xử lý Promise play() bị Safari từ chối. Mở phong bì không mặc định bật nhạc.
- Gallery lightbox có dialog semantics, focus trap, Escape, nút đóng và trả focus;
  swipe chỉ bổ sung cho nút trước/sau, không thay thế. Tránh filter/blur lớn.
- Nút lưu QR trên Safari có đường dự phòng: mở ảnh riêng để nhấn giữ lưu khi
  download/share không được hỗ trợ. Không hứa lưu thành công nếu trình duyệt từ chối.
- Dùng font có Vietnamese subset và giấy phép phù hợp, self-host WOFF2 sau khi
  xác minh; tối đa hai family, ít weight, font-display: swap.
- Hero dùng AVIF/WebP có fallback, width/height và object-position cấu hình;
  hero không lazy-load, ảnh phía dưới lazy-load, srcset/sizes theo màn hình.
- Ngân sách đề xuất: hero ≤250KB, font tổng ≤160KB, dữ liệu tải đầu mục tiêu ≤700KB.
  Mục tiêu LCP ≤2.5s, CLS ≤0.1 trên thiết bị/mạng đo được; chưa tuyên bố đã đạt.
- Test Safari trên iPhone thật: thanh địa chỉ thu/phóng, bàn phím, VoiceOver,
  reduced motion, audio và lưu ảnh. WebKit giả lập chỉ bổ sung, không thay thế.

## 9. So sánh và đề xuất lựa chọn

Đánh giá dưới đây là nhận định thiết kế, chưa phải nghiên cứu người dùng hay benchmark.

| Tiêu chí                          | A — Thư Hồng | B — Khu Vườn          | C — Giao Ước Son          |
| --------------------------------- | ------------ | --------------------- | ------------------------- |
| Dễ đọc với gia đình nhiều độ tuổi | Rất tốt      | Tốt                   | Tốt nếu tiết chế mảng son |
| Phụ thuộc chất lượng/bộ ảnh       | Thấp–vừa     | Cao                   | Vừa–cao                   |
| Độ khác biệt thị giác             | Vừa          | Vừa–cao               | Cao                       |
| Rủi ro mobile/animation           | Thấp         | Thấp nếu tắt parallax | Vừa                       |
| Công sức tinh chỉnh               | Thấp–vừa     | Vừa                   | Cao hơn                   |
| Hợp khi chưa có nội dung thật     | Cao          | Vừa                   | Vừa                       |

**Đề xuất A — Thư Hồng Đương Đại.** Phù hợp nhất với mục tiêu một thiệp cá nhân,
dễ dùng trên iPhone, triển khai nhẹ và chưa có bộ ảnh/nội dung chốt. Chữ serif,
nền giấy và dấu niêm tạo cảm xúc mà không cần hiệu ứng nặng. Giữ trọn concept A,
không trộn đồng thời lá của B và typography lớn của C.

Chọn B nếu ảnh ngoài trời là trọng tâm. Chọn C nếu ưu tiên nhận diện mạnh và sẵn
sàng dành thêm thời gian duyệt crop ảnh, độ dài tên và tương phản.

## 10. Trạng thái 12ui và bản trực quan

Đã đọc skill 12ui-design; cài CLI @12ui/design 0.2.131 ngoài repository.
Đã chạy auth status và draft với 4 candidates, portrait. Lệnh dừng trước khi
tạo ảnh vì chưa xác thực 12ui và dịch vụ sign-in không truy cập được từ môi trường.
**Không có candidate PNG, mockup render hoặc prototype 12ui nào được tạo.**
Không mua gói, tạo dịch vụ trả phí hoặc thêm dependency vào dự án.

Đã lưu các domain tham khảo và domain 12ui/sign-in cần thiết vào draft mạng,
giữ api.github.com đã có. Draft không tự áp dụng runtime: người dùng cần review,
save/publish môi trường. Sau đó kiểm tra lại kết nối trước khi yêu cầu xác thực.
Nếu 12ui vẫn yêu cầu đăng nhập, kết nối CLI qua quy trình chính thức
https://12ui.com/connect-cli; không đưa API key vào source hoặc tài liệu.

Brief để tiếp tục tạo hình khi truy cập được:

> Original Vietnamese wedding invitation, mobile 390px portrait. Explore
> contemporary letterpress, airy botanical and bold vermilion editorial directions.
> Names are placeholders “Cô dâu” and “Chú rể”. Show readable hero, event details,
> gallery rhythm, countdown, RSVP and two separate gift cards in subsequent states.
> No copied reference assets, no guest quantity, no actual bank data or scannable
> QR. Accessible contrast, Vietnamese typography, large tap targets, no autoplay.

Đầu tiên tạo các first-viewport candidates và xem ảnh thật; chọn candidate thuộc
ba hướng khác biệt. Sau khi người dùng chọn concept, mới mở rộng phong bì, trang
dài và trạng thái form qua branch. Không convert thành frontend trong Phase 2.1.

## 11. Cổng duyệt trước Phase 2.2

Cần người dùng chọn A, B hoặc C và góp ý mức trang trọng, màu, font, nhịp ảnh.
Không coi lựa chọn mặc định A là đã được phê duyệt.

Phase 2.2 bắt đầu bằng một màn hình đại diện để duyệt: trạng thái phong bì đóng
và hero đã mở ở 390px, kèm biến thể reduced motion. Khi duyệt xong mới mở rộng
trang. Form và QR ở giai đoạn đó thể hiện layout/trạng thái dự kiến; kết nối thật
vẫn theo Phase 3/4. Nội dung, màu, font, media và cường độ hiệu ứng qua cấu hình.

Còn thiếu để chốt thiết kế: tên thật, ngày/giờ/múi giờ, địa điểm, ảnh có quyền dùng,
nhạc và quyền sử dụng, QR thật. Không cần Google credentials cho khám phá UI.

## 12. Bàn giao Phase 2.1

- Tệp thay đổi: docs/UI_UX_PROPOSAL.md.
- Không thay đổi source, API, cấu hình deploy hoặc dependencies của repository.
- Không sửa nghiệp vụ RSVP; không tích hợp Sheets; không chạy lệnh deploy.
- Khảo sát hai website và ảnh 12ui còn bị chặn bởi mạng/xác thực như mục 2 và 10.
- Tài liệu có thể được review để chọn hướng ngay; cần bổ sung quan sát thực tế
  và hình 12ui khi các điều kiện truy cập được giải quyết.
