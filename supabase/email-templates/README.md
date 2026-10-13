# Email xác nhận đăng ký

Mẫu này dùng bố cục bảng, CSS inline và chữ logo để không phụ thuộc ảnh tải ngoài.
Nội dung có 19 ngôn ngữ; Arabic dùng RTL. API đăng ký lưu `locale` và
`confirmation_subject` (tiêu đề theo ngôn ngữ đã kiểm tra) trong metadata.
Tài khoản không có metadata ngôn ngữ dùng tiếng Anh; không có
`confirmation_subject` thì Subject dùng tiêu đề tiếng Anh.

Supabase giới hạn **toàn bộ mã template Subject ở 255 ký tự**, trước khi xử lý
điều kiện. Vì vậy Subject lấy tiêu đề từ metadata thay vì chứa 19 nhánh dịch.
Lệnh tạo template kiểm tra giới hạn và không cho tiêu đề chứa xuống dòng.
Thử đăng ký mới qua API local đã cập nhật để nhận Subject theo ngôn ngữ;
website chưa triển khai thay đổi API sẽ dùng Subject tiếng Anh dự phòng.

## Áp dụng trong Supabase

Vào **Authentication → Emails → Templates → Confirm sign up**:

1. Dán toàn bộ `confirm-signup-subject.txt` vào **Subject**.
2. Dán toàn bộ `confirm-signup.html` vào phần HTML của **Body**.
3. Kiểm tra Preview rồi **Save changes**.
4. Đăng ký thử bằng email bạn quản lý chưa có trong project, kiểm tra thư mới và
   bấm nút xác nhận. Thư đã gửi trước đó sẽ giữ mẫu cũ.

Giữ nguyên `{{ .ConfirmationURL }}` trong cả nút chính và liên kết dự phòng.
Đây là liên kết xác nhận Supabase tạo, bao gồm token và redirect tương ứng.
Không thay bằng URL trang chủ. Nếu email sender bật click tracking, tắt tracking
cho thư xác thực để tránh thay đổi liên kết.

Các file ở repo là bản chuẩn bị để dán vào dashboard, không tự cập nhật cấu hình
Supabase. Kiểm tra trình duyệt không thay thế việc thử thư thực tế trong Gmail
hoặc các email client khác.

## Chỉnh nội dung và tạo lại

Chỉnh `confirmation-copy.json` để đổi câu chữ, `build.mjs` để đổi giao diện, rồi chạy:

```powershell
node supabase/email-templates/build.mjs
```

Lệnh tạo lại HTML, Subject và các bản xem trước tiếng Anh, Việt, Arabic tại
`.codex-artifacts/auth-email/`. Link trong bản xem trước không xác nhận tài khoản.

Tài liệu: [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
và [Resend tracking](https://resend.com/docs/dashboard/emails/tracking).
