# Google login cho Supabase mới

Project: `pcbxvswjcjdmelwznarp`. Kiểm tra ngày 11/10/2026: public Auth settings
trả về `external.google = false`. Cần bật Google provider trước khi thử đăng nhập.

## 1. Google Cloud Console

Mở https://console.cloud.google.com/auth/clients và chọn đúng Google Cloud project.
Nếu OAuth client cũ còn tồn tại, có thể dùng lại; cập nhật callback cho Supabase mới.
Nếu chưa có client, chọn Create client, loại Web application.

Authorized JavaScript origins cho môi trường local:

```text
http://localhost:3000
```

Authorized redirect URIs:

```text
https://pcbxvswjcjdmelwznarp.supabase.co/auth/v1/callback
```

Đây là callback của Supabase, không phải đường dẫn `/en` của website.
Lưu cấu hình và lấy Client ID cùng Client Secret. Trong Google Auth Platform,
kiểm tra Branding và Audience; nếu ứng dụng còn ở Testing, thêm email dùng thử
vào Test users. Data Access dùng `openid`, email và profile.

## 2. Supabase Authentication

Mở https://supabase.com/dashboard/project/pcbxvswjcjdmelwznarp/auth/providers.
Chọn Google, bật provider, điền Client ID và Client Secret lấy từ cùng OAuth client,
rồi Save. Client Secret được điền trực tiếp vào Supabase; không thêm vào frontend.

Mở https://supabase.com/dashboard/project/pcbxvswjcjdmelwznarp/auth/url-configuration.
Khi chỉ đang phát triển ở localhost:

```text
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/**
```

Nếu project phục vụ production, giữ Site URL là domain production và chỉ bổ sung
localhost vào Redirect URLs. Thêm origin production trong Google và URL trả về
chính xác cho từng locale ở allowlist Supabase khi triển khai.

## 3. Thử trên web

Mở `/en`, bấm Sign In rồi Log in with Google. Kết quả cần kiểm tra:

1. Mở được Google account picker và consent screen.
2. Quay lại `/en` sau khi đồng ý; menu hiển thị tài khoản.
3. Reload vẫn giữ phiên đăng nhập và logout hoạt động.
4. Supabase Authentication → Users có tài khoản Google; `public.users` có hồ sơ
   tương ứng (trigger trong `setup.sql` đã đồng bộ tên, avatar và email).

Ứng dụng hiện dùng Supabase browser client với implicit OAuth flow. SDK nhận session
khi quay lại URL của locale; chưa sử dụng PKCE/cookie-based server authentication.
Server đọc catalog công khai độc lập với session đăng nhập.

Nguồn: [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google),
[Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
