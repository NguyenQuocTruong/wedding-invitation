# Đề xuất UI/UX — Phase 2.1

Ngày: 02/11/2026 · Trạng thái: đã chốt hướng Mẫu thiệp 01 theo mục 15; chưa triển khai Phase 2.2.

Mục 15 là quyết định mới nhất. Các concept và cổng chọn ở mục trước được giữ làm lịch sử khám phá.

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

**Đề xuất ban đầu, trước phản hồi mới: A — Thư Hồng Đương Đại.** Phù hợp nhất với mục tiêu một thiệp cá nhân,
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

Theo phản hồi mới, ưu tiên hướng “Lời Mời Dịu Dàng” ở mục 13. Cần duyệt màu và màn hình đại diện trước Phase 2.2; ba concept ban đầu được giữ để đối chiếu.
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

## 13. Điều chỉnh theo phản hồi — Lời Mời Dịu Dàng

**Brief mới từ người dùng:** trẻ trung, đơn giản, màu sắc nhẹ nhàng, sang trọng
và lịch thiệp; tiếp tục tham khảo các mẫu tại https://ngaychungdoi.com/.

Hướng này thay đề xuất ưu tiên A ban đầu. Đây là phương án do người thực hiện
đề xuất dựa trên brief mới, chưa phải concept người dùng đã duyệt.
Không chuyển sang triển khai Phase 2.2.

### 13.1. Ngôn ngữ thị giác

Một lời mời sáng, thoáng và gần gũi: nền ngọc trai, điểm màu sage, nhịp chữ nhẹ,
ảnh chân thực và rất ít trang trí. Sự trang trọng đến từ khoảng cách đều, thứ bậc
chữ và cách viết lời mời. Ưu tiên bố cục mở, không biến mọi section thành thẻ có viền.

| Vai trò       | Màu đề xuất | Cách dùng                           |
| ------------- | ----------- | ----------------------------------- |
| Nền ngọc trai | #FAF9F6     | Nền chính                           |
| Bề mặt trắng  | #FFFFFF     | Form, vùng QR                       |
| Sage nhạt     | #E6EDE6     | Mảng chuyển section, nền phong bì   |
| Sage đậm      | #465C50     | Nút chính, heading phụ              |
| Hồng phấn     | #F2E5E3     | Điểm nhấn nhỏ, không phủ toàn trang |
| Chữ than ấm   | #303733     | Nội dung trên nền sáng              |

Màu pastel dùng cho nền và trang trí; chữ/nút dùng màu đậm để giữ độ rõ.
Không dùng chữ hồng nhạt trên trắng. Kiểm tra WCAG AA khi dựng màn hình thật.

Typography: **Lora 500** cho tên và heading, **Be Vietnam Pro 400/500/600** cho
nội dung, form và nút; cần kiểm chứng font Vietnamese thực tế. Tên khoảng
40–48px ở 390px, tự xuống dòng theo tên đầy đủ; body 17px/1.65.
Có thể dùng chữ nghiêng cho một dòng lời mời ngắn. Không dùng font script dày đặc.

### 13.2. Bố cục và tương tác

- **Phong bì:** nền sage rất nhạt, một đường gấp tinh tế, tên cặp đôi và nút
  “Mở lời mời”. Mở bằng tap, chuyển opacity/translate nhẹ trong khoảng 450ms.
  Không có con dấu vàng lớn hoặc hoa rơi; có đường bỏ qua.
- **Hero:** lời mời ngắn, hai tên serif thoáng, ảnh 4:5 có vùng an toàn cho khuôn mặt,
  ngày cưới bên dưới và CTA “Thông tin lễ cưới”. Không đặt chữ trên khuôn mặt.
  Ảnh là điểm nhấn cảm xúc chính, không cần khung trang trí cầu kỳ.
- **Thông tin lễ cưới:** thời gian và địa điểm có label dễ quét; link bản đồ rõ.
  Nền sáng, dùng khoảng trắng thay cho nhiều đường viền.
- **Gallery:** một ảnh lớn mở đầu, tiếp theo lưới hai cột đều; khoảng cách 8–12px,
  bo góc nhỏ 4–8px. Không xếp ảnh kiểu scrapbook, không carousel tự chạy.
  Nhấn ảnh mở lightbox theo tiêu chuẩn tiếp cận ở mục 8.
- **Countdown:** một hàng bốn số trên nền sage nhạt, nhãn tiếng Việt nhỏ nhưng rõ;
  không đóng từng số trong hộp dày. Dùng số tabular, không animation lật.
- **RSVP:** một cột, input cao tối thiểu 48px, label luôn hiện; radio có nhãn
  “Nhà gái / Nhà trai” và “Có / Không”. Nút sage đậm trên nền trắng.
  Giữ nguyên toàn bộ hợp đồng, trạng thái lỗi và quyền riêng tư ở mục 3.
- **Hai QR:** hai thẻ trắng tách biệt, tiêu đề cô dâu/chú rể, cùng cấp bậc và cùng
  kích thước; mobile xếp dọc, mỗi mã có nút lưu riêng. Không thu gọn bên nào theo RSVP.
  Chưa có mã thật thì ghi “Chưa cập nhật”.
- **Motion:** reveal tối đa 8px, 250–350ms, chỉ một lần; không cần parallax mobile.
  Reduced motion hiển thị trực tiếp. Nhạc mặc định tắt, nút điều khiển riêng.
- **Mobile:** lề 20–24px ở 390px, khoảng section 48–64px; CTA trong luồng nội dung.
  Không để thanh nổi hoặc trang trí chiếm vùng thao tác của Safari.

### 13.3. Ba biến thể màu để duyệt nhanh

Giữ nguyên bố cục và typography, chỉ lựa chọn một sắc thái chủ đạo:

| Biến thể               | Cảm giác                  | Phù hợp                                   |
| ---------------------- | ------------------------- | ----------------------------------------- |
| Pearl + Sage — đề xuất | Trẻ, tự nhiên, thanh lịch | Nhiều loại ảnh; ít cảm giác ngọt          |
| Ivory + Blush          | Dịu dàng, lãng mạn        | Ảnh sáng, tông da và hoa nhẹ              |
| White + Mist Blue      | Trong trẻo, hiện đại      | Ảnh biển, studio sáng hoặc ảnh trung tính |

Không trộn cả ba bảng màu trong cùng trang. Đề xuất bắt đầu với Pearl + Sage,
chỉ dùng blush như một điểm nhỏ. Cần duyệt cùng ảnh thật để tránh lệch tông.

### 13.4. Ưu, nhược điểm và điều kiện duyệt

**Ưu:** sát brief mới; bề mặt sáng, dễ đọc; ít hiệu ứng nên nhẹ trên Safari;
không cần nhiều tài nguyên trang trí; giữ sự lịch thiệp với khách gia đình.

**Nhược:** pastel dễ nhạt nếu thiếu ảnh và typography tốt; cần kiểm soát tương
phản; sự khác biệt dựa nhiều vào crop ảnh, nhịp khoảng trắng và nội dung.

Bước duyệt tiếp theo là ảnh concept/màn hình đại diện, không phải viết toàn bộ
frontend. Chỉ khi được phê duyệt mới dựng envelope và hero cho Phase 2.2.

### 13.5. Trạng thái tham khảo Ngày Chung Đôi

Đã thử lại HTTPS theo phản hồi mới: proxy tiếp tục trả
“Tunnel connection failed: 403 Forbidden”. Chưa quan sát được mẫu thực tế,
không gán các lựa chọn sage, pastel, font hoặc bố cục trên cho website đó.

Yêu cầu domain đã nằm trong draft môi trường nhưng runtime hiện chưa cho truy cập.
Cần review/lưu và publish cấu hình mạng đã chuẩn bị, rồi khảo sát lại thư viện.
Nếu chưa mở được mạng, người dùng có thể gửi ảnh chụp 2–3 mẫu yêu thích để đối chiếu
cảm giác thị giác; ảnh tham khảo không được sao chép thành tài nguyên của sản phẩm.

12ui vẫn chưa có kết quả trực quan từ lần thử trước; mô tả này là định hướng
bằng chữ, không phải bản render hoặc mẫu được trích từ Ngày Chung Đôi.

## 14. Nguồn tham khảo bổ sung và thư viện mẫu được chỉ định

### 14.1. Đường dẫn ưu tiên mới

Người dùng chỉ định trực tiếp https://ngaychungdoi.com/mau-thiep.
Đã thử GET đúng URL này: kết nối HTTPS bị từ chối tại proxy với thông báo
“Tunnel connection failed: 403 Forbidden”. Đây là lỗi thiết lập tunnel trước
khi nhận HTML; không phải bằng chứng website chặn bot hoặc từ chối người dùng.
Đổi từ trang chủ sang /mau-thiep không thay đổi quyền truy cập hostname.

Phiên công cụ hiện không cung cấp browser/search connector chuyên dụng.
Đã dùng HTTP client để tìm nguồn, đọc HTML và README, tải preview và xem ảnh
thật qua công cụ xem ảnh. Không tuyên bố đã duyệt thư viện Ngày Chung Đôi.

### 14.2. Các nguồn thực sự tìm và đọc được

Đã đọc HTML hai danh sách:
https://github.com/topics/wedding-website và
https://github.com/topics/wedding-invitation.
Từ đó đọc README của bốn mẫu dưới đây và xem hai ảnh preview do tác giả công bố.
Đây là nguồn tham khảo bố cục, không phải mã để đưa vào dự án.

| Nguồn                                                                                | Đã xác minh                             | Nhận xét và ứng dụng                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sakeenah](https://github.com/sakeenah-wedding/template)                             | README và ảnh public/preview.png        | Preview nền sáng, chữ serif lớn, điểm hồng/đỏ, nhiều khoảng trắng, các khối ngày giờ và quà mừng rõ. Gần brief nhẹ nhàng hơn mẫu tối; có thể học cách chia cấp chữ và gom thông tin. Hướng dự án sẽ dùng sage dịu hơn và ít hộp hơn. Không lấy họa tiết/ngôn ngữ tôn giáo, cá nhân hóa link, dashboard hay kiến trúc multi-tenant. |
| [Undangan](https://github.com/dewanakl/undangan)                                     | README và ảnh assets/images/banner.webp | Preview ghép màn hình thiệp tối và dashboard, ảnh tròn, chữ script, thanh điều hướng dưới. Tham khảo khả năng đi nhanh đến section; nền tối, script dày và dashboard không phù hợp brief/nghiệp vụ dự án. Ảnh banner không chứng minh trải nghiệm chạy thực tế.                                                                    |
| [Simple Wedding Invitation](https://github.com/daengdoang/simple-wedding-invitation) | README; chưa xem live/render            | Tác giả liệt kê Main Info, Countdown, Time/Place, Calendar, Map; font Rouge Script và Raleway. Tham khảo việc giữ các thông tin cần thiết gọn; chưa có căn cứ nhận xét màu hoặc chất lượng mobile. Không thay RSVP bằng gửi WhatsApp.                                                                                              |
| [Wedding Website — Ram Patra](https://github.com/rampatra/wedding-website)           | README; chưa xem live/render            | Tác giả mô tả responsive, RSVP, calendar, maps. Có invite code, email alert và dịch vụ khác vượt phạm vi dự án: không áp dụng. Chỉ tham khảo thứ tự thông tin thực dụng; chưa đánh giá phong cách thị giác.                                                                                                                        |

Ảnh đã xem:

- https://raw.githubusercontent.com/sakeenah-wedding/template/main/public/preview.png
- https://raw.githubusercontent.com/dewanakl/undangan/main/assets/images/banner.webp

Ảnh chỉ tải tạm để quan sát, không thêm vào source hay dùng làm media cưới.
Không gửi form, tạo tài khoản hoặc thử backend của các mẫu.

### 14.3. Nguồn khác còn bị chặn

Đã thử tìm kiếm Google và đọc các trang dưới đây; tất cả bị cùng lỗi tunnel 403,
chưa nhận HTML. Đây là danh sách để khảo sát tiếp, không phải mẫu đã được đánh giá:

- https://withjoy.com/wedding-website/
- https://blissandbone.com/wedding-websites
- https://www.minted.com/wedding-websites
- https://www.paperlesspost.com/cards/group/wedding-invitations
- https://www.wix.com/website/templates/html/events/weddings

Đã bổ sung hostname của các nguồn này và Google vào draft mạng, giữ mọi domain
đã lưu. Draft cần được review/lưu và publish môi trường trước khi kiểm tra runtime
lại; không chỉnh proxy, TLS hoặc dùng dịch vụ trung gian để vượt chặn.

### 14.4. Kết luận tham khảo hiện tại

Giữ hướng Lời Mời Dịu Dàng, Pearl + Sage. Preview Sakeenah củng cố lựa chọn nền sáng,
thứ bậc serif/sans và khoảng trắng; preview Undangan giúp loại hướng nền tối,
ảnh tròn và script dày khỏi phương án ưu tiên. Chưa chốt mẫu cụ thể từ Ngày Chung
Đôi cho đến khi mở được /mau-thiep. Không coi preview marketing là kiểm thử Safari.

## 15. Mẫu thiệp 01 — Lời Mời Dịu Dàng, đã chốt hướng

### 15.1. Quyết định và phạm vi phê duyệt

Người dùng đồng ý chốt hướng được đề xuất thành **Mẫu thiệp 01**: trẻ trung,
đơn giản, màu nhẹ, thanh thoát, sang trọng và lịch thiệp. Đây là lựa chọn hướng
thị giác; không phải duyệt một bản render đã có hay cho phép deploy production.

Người dùng cung cấp mô tả ba nhóm ảnh:

1. Phông trắng, cô dâu váy trắng và chú rể vest đen.
2. Cùng trang phục, nền trắng có hoa và tường họa tiết trắng.
3. Cổ phục Việt Nam đỏ, nền đỏ.

Chưa nhận hoặc xem tệp ảnh thật. Cách bố trí dưới đây dựa trên mô tả, crop và
độ ấm màu cuối cùng cần đối chiếu ảnh trước khi duyệt màn hình đại diện.

### 15.2. Bảng màu thống nhất

| Vai trò               | Màu     | Quy tắc                                                                           |
| --------------------- | ------- | --------------------------------------------------------------------------------- |
| Nền ngọc trai         | #FAF9F6 | Nền xuyên suốt; không ngả vàng rõ để tránh làm ảnh váy trắng trông lạnh hoặc xanh |
| Bề mặt trắng          | #FFFFFF | Form, QR và khoảng đệm cạnh ảnh                                                   |
| Chữ/nút chính than ấm | #303733 | Liên kết cả vest đen, ảnh trắng và ảnh đỏ; chữ nút màu trắng                      |
| Chữ phụ               | #626760 | Nội dung phụ; kiểm tra contrast theo cỡ chữ                                       |
| Sage rất nhạt         | #E6EDE6 | Điểm nền nhỏ ở intro/countdown, không phủ toàn trang                              |
| Viền trung tính       | #DEDCD5 | Đường phân cách nhẹ, không dùng thay viền focus cần tương phản rõ                 |

Sage được giảm vai trò so với mục 13: nút chính chuyển sang than ấm để không
tạo cặp xanh–đỏ đối chọi với bộ cổ phục. Hồng phấn không còn là màu nhấn mặc định,
vì chưa biết màu hoa trong ảnh. Màu đỏ nổi bật đến từ ảnh cổ phục, chưa thêm
đỏ UI hoặc vàng kim để cạnh tranh với ảnh.

Phần lớn bề mặt là trắng/ngọc trai. Cảm giác sang trọng đến từ font, nhịp khoảng
trắng và ảnh; không từ viền vàng, đổ bóng dày hoặc họa tiết phủ trang.
Mọi màu đều là token cấu hình khi triển khai, không khóa cứng vào từng component.

### 15.3. Phối ba nhóm ảnh

| Nhóm                            | Vị trí ưu tiên                               | Cách trình bày                                                                                                                                     |
| ------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phông trắng, váy trắng/vest đen | Hero                                         | Chọn ảnh thấy rõ cả hai, nền sạch; đặt tên trên vùng nền riêng, không đè lên váy. Tỉ lệ gợi ý 4:5, quyết định sau khi xem khung gốc.               |
| Nền trắng có hoa/tường họa tiết | Album đầu, đoạn chuyển gần thông tin lễ cưới | Giữ mảng sáng và chi tiết hoa; giảm trang trí UI vì bản thân ảnh đã có họa tiết. Dùng nhịp ảnh lớn rồi cặp ảnh nhỏ, không che tường/hoa bằng text. |
| Cổ phục đỏ, nền đỏ              | Cụm album riêng sau hai nhóm sáng            | Đặt trên nền ngọc trai với khoảng nghỉ trước/sau; một ảnh mở đầu lớn rồi ảnh phụ nếu có. Ảnh mang sắc đỏ, section và chữ vẫn trung tính.           |

Thứ tự cảm xúc đề xuất: mở nhẹ → chân dung trắng/đen thanh lịch → hoa và chi tiết
dịu → điểm nhấn cổ phục Việt Nam → trở về nền sáng cho countdown, RSVP và QR.

Không xếp xen kẽ đỏ–trắng–đỏ ở các ô liền nhau. Không để một ảnh đỏ nhỏ chen giữa
cụm ảnh sáng làm mất cân bằng; gom theo nhóm, nhưng giữ một hệ lề và typography
để cả album vẫn là một câu chuyện thống nhất.

Ảnh nền trắng có thể hòa vào bề mặt sáng: ưu tiên khoảng đệm hoặc viền trung tính
rất mảnh khi cần nhận ra khung; không tăng tương phản hay đổ bóng mạnh quanh váy.
Không phủ gradient lên mặt người, không làm nhạt màu đỏ cổ phục, không dùng filter
chung khiến da người/áo trắng đổi màu. Giữ ảnh gốc và xuất bản tối ưu riêng.

### 15.4. Typography, chi tiết và motion

- Lora 500 cho tên/heading, Be Vietnam Pro cho body/form. Tên không quá dày,
  tránh tracking lớn với tiếng Việt; kiểm tra dấu và tên dài trên 320px.
- Lề mobile gợi ý 20–24px; khoảng section 48–64px; nhịp tiêu đề nhất quán.
- Phong bì ngọc trai/sage rất nhạt, một đường gấp; mở bằng tap và chuyển nhẹ.
  Không cần hoa minh họa dày vì album đã có hoa thật.
- Gallery không dùng hiệu ứng kéo ngang bắt buộc hoặc khung giả Polaroid nhiều góc.
- Countdown và RSVP nền sáng, chữ than ấm; QR giữ nền trắng, hai thẻ luôn độc lập.
- Motion ưu tiên opacity và dịch tối đa 8px; bỏ motion khi reduced motion.
  Giữ quy tắc audio, khả năng tiếp cận và Safari tại mục 8.

### 15.5. Điều kiện nghiệm thu thiết kế tiếp theo

Bước tiếp theo của Phase 2.2 là màn hình đại diện dùng ảnh thật: phong bì và hero,
kèm một đoạn chuyển album sáng sang album đỏ để kiểm tra hòa màu.
Không cần tạo lại vòng chọn ba concept; chỉ hiệu chỉnh trong Mẫu thiệp 01.

Cần kiểm tra ảnh gốc trước khi chốt object-position/crop; không cắt đầu, tay hoặc
chi tiết cổ phục quan trọng. Duyệt đồng thời màn hình 390px và 320px, tên đầy đủ,
contrast, reduced motion, các ảnh trắng sát nền và điểm chuyển sang bộ ảnh đỏ.

Chưa có mockup 12ui hoặc render mới trong lần chốt này. Không cần Google credentials,
không thay nghiệp vụ RSVP và không có phê duyệt deploy production.
