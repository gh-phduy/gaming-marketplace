# Khôi phục Supabase cho mã nguồn hiện tại

## File cần chạy

Mở `setup.sql`, copy **toàn bộ** nội dung vào Supabase **SQL Editor → New query → Run**.
Project hiện tại: `pcbxvswjcjdmelwznarp`.

Script tạo đủ 5 bảng `public.users`, `public.products`, `public.orders`,
`public.conversations`, `public.messages`, cùng khóa ngoại, index, trigger, RLS,
quyền cột hồ sơ và publication Realtime cho `messages`.

Script có thể chạy lại và nâng cấp từ bản `setup-products.sql` đã hướng dẫn trước đó.
Nó không xóa bảng/dữ liệu, không ghi đè giá hoặc trạng thái sản phẩm đã sửa, không
thay thế các hồ sơ đã có. Các policy/trigger do bộ script này quản lý được tạo lại.
File cũ được chuyển vào `tests/fixtures/catalog-only.sql` để kiểm tra nâng cấp;
không dùng fixture làm script cài đặt.

Kết quả cuối trong SQL Editor phải có 5 dòng và `rowsecurity = true` cho cả 5 bảng.
Publish schema trước hoặc cùng lúc triển khai các thay đổi frontend trong nhánh này.

## Kết quả quét mã nguồn

Đã quét 298 file nguồn ngoài dependencies, generated build và unit tests.
Sau các điều chỉnh tương thích schema, có 34 vị trí truy vấn bảng,
12 lời gọi Auth, 0 lời gọi Edge Function, 3 subscription Realtime và 0 RPC.
Danh sách file, số dòng và nguyên văn từng truy vấn được lưu tại `query-inventory.json`.

| Bảng | Vị trí truy vấn | Thao tác của ứng dụng | Dữ liệu chính |
| --- | ---: | --- | --- |
| `users` | 3 | Đọc hồ sơ/người bán, upsert hồ sơ của tài khoản hiện tại | `id`, `display_name`, `avatar_url`, `rating`, `is_verified_seller`; email đồng bộ riêng từ Auth |
| `products` | 14 | Đọc danh mục, tìm kiếm, lọc người bán; tạo, đổi trạng thái, xóa listing | Toàn bộ cột của listing, metadata các mục trang chủ, ảnh/video |
| `orders` | 1 | Server upsert đơn sau khi xác minh Stripe | `buyer_id`, `product_id`, `quantity`, `total_price`, `currency`, `status`, `stripe_payment_intent` |
| `conversations` | 13 | Tìm/tạo hội thoại, đọc inbox, reset số tin chưa đọc | Hai người tham gia, `listing_title`, hai bộ đếm, thời gian cập nhật |
| `messages` | 3 | Đọc lịch sử, insert tin nhắn | `conversation_id`, `sender_id`, `text`, `created_at` |

Các nhóm nguồn liên quan:

- Danh mục/chi tiết/checkout: `components/home/PopularGamesSection.tsx`,
  `UpcomingGamesSection.tsx`, `components/shared/GamesSection.tsx`,
  `components/layout/nav/MainNavSection.tsx`, `components/product/SellerList.tsx`,
  `app/[locale]/(main)/buy-cheap/page.tsx`, các file trong
  `app/[locale]/(checkout)/product/` và `checkout/_components/CheckoutClient.tsx`.
- Người bán: `components/user/seller-profile.data.ts`,
  `components/home/PopularSellersSection.tsx`,
  `components/marketplace/seller-marketplace-store.ts`.
- Chat: `components/chat/useFloatingChat.ts`,
  `components/layout/nav/ChatInboxButton.tsx`, `components/product/ProductOverview.tsx`
  và `seller-marketplace-store.ts`.
- Xác minh/lưu đơn: `lib/payments/server.ts`, API verify/webhook; browser gọi server từ
  `app/[locale]/(checkout)/checkout/success/_components/useSuccessCheckout.ts`.
- Auth: `app/api/auth/signup/route.ts`, `components/auth/EmailLoginForm.tsx`,
  `EmailSignUpForm.tsx`, `OAuthProviders.tsx`, `contexts/AuthContext.tsx`.

## Cột và quan hệ

- `users`: `id` UUID của `auth.users`; `email`, `display_name`, `avatar_url`, `rating`,
  `is_verified_seller`, `created_at`, `updated_at`. Auth tạo và đồng bộ hồ sơ qua trigger.
- `products`: `id`, `seller_id`, `title`, `description`, `price`, `currency`, `category`,
  `platform`, `region`, `stock`, `image_url`, `video_url`, `status`, `views`, `sales`,
  `is_popular`, `is_upcoming`, `is_new`, `is_weekly`, `is_under_price`, `release_date`,
  `sort_order`, `created_at`, `updated_at`. ID là UUID; trạng thái gồm
  `draft`, `published`, `paused`. Giá trống chỉ được phép ở nháp/paused.
- `orders`: `id`, `buyer_id`, `product_id`, `quantity`, `total_price`, `currency`,
  `status`, `stripe_payment_intent`, `created_at`, `updated_at`.
  Mỗi dòng tương ứng một sản phẩm trong giỏ. `product_id` được phép NULL cho direct top-up.
- `conversations`: `id`, `seller_id`, `buyer_id`, `listing_title`, `unread_for_seller`,
  `unread_for_buyer`, `created_at`, `updated_at`. Một hội thoại duy nhất cho bộ
  `(seller_id, buyer_id, listing_title)`; hai người tham gia phải khác nhau.
- `messages`: `id`, `conversation_id`, `sender_id`, `text`, `created_at`.

Quan hệ phục vụ các truy vấn PostgREST:

| Truy vấn join trong code | Khóa ngoại |
| --- | --- |
| `products` → `seller:users (...)` | `products_seller_id_fkey`: `products.seller_id → users.id` |
| `conversations` → `seller:users!conversations_seller_id_fkey (...)` | `conversations_seller_id_fkey` |
| `conversations` → `buyer:users!conversations_buyer_id_fkey (...)` | `conversations_buyer_id_fkey` |
| `conversations` → `messages (...)` | `messages_conversation_id_fkey` |
| `messages` → `sender:users (...)` | `messages_sender_id_fkey` |
| Đơn hàng → người mua/sản phẩm | `orders_buyer_id_fkey`, `orders_product_id_fkey` |

Khi xóa listing hoặc tài khoản, các dòng đơn hàng vẫn được giữ và khóa liên quan
được chuyển thành NULL. Xóa người tham gia sẽ xóa hội thoại và tin nhắn liên quan.

## Quyền truy cập và thay đổi tương thích trong code

- Khách xem được hồ sơ công khai và sản phẩm `published`; không xem được đơn hàng/chat.
- Email có trong `users` để đồng bộ Auth nhưng không được đọc qua client API.
  Ba truy vấn hồ sơ `select("*")` đã đổi thành danh sách cột công khai.
  Checkout upsert chỉ gửi `id`, `display_name`, `avatar_url`; không ghi email nữa.
- Tài khoản chỉ sửa hồ sơ và listing của chính mình; không tự cấp `rating` hoặc
  `is_verified_seller`. Việc đánh dấu người bán được xác thực do quản trị viên thực hiện.
- Người mua xem đơn của mình; người bán xem đơn gắn với listing của mình.
  Client chỉ được insert đơn của chính tài khoản, không update/delete đơn.
- Chỉ hai người tham gia đọc được hội thoại/tin nhắn. Người gửi phải là tài khoản
  đang đăng nhập và thuộc hội thoại; không sửa nội dung hoặc thay người tham gia qua client.
- Trigger insert `messages` tăng bộ đếm người nhận và cập nhật thời gian hội thoại.
  Đã bỏ phần tăng bộ đếm thủ công trong `seller-marketplace-store.ts` để tránh đếm hai lần.
  Client chỉ được reset bộ đếm của chính mình về 0.
- `messages` được thêm vào `supabase_realtime`; các bảng có sẵn trong publication được giữ.
- Bucket `Image` được tạo nếu thiếu; bucket/file có sẵn được giữ nguyên. Policy chỉ cho
  đọc/list thư mục `popular_game`; không cấp quyền upload, sửa hoặc xóa Storage file.

## 8 ảnh Popular Games

Script thêm 8 dòng dùng đúng URL đã kiểm tra từ `Image/popular_game`, với
`is_popular = true`, `sort_order` từ 1 đến 8, `status = 'draft'`, `price = NULL`,
`stock = 0`, `seller_id = NULL`.

Để đăng sản phẩm trong **Table Editor → products**:

1. Tạo tài khoản Auth thật và lấy UUID tương ứng trong `public.users`.
2. Gán UUID đó vào `seller_id` của sản phẩm.
3. Điền giá thật vào `price`, số lượng thật vào `stock`; điều chỉnh category/platform nếu cần.
4. Đổi `status` thành `published`. Các dòng sẽ xuất hiện trong Popular Games.

Code Popular Games lọc `is_popular = true`, `status = 'published'`, sắp xếp `sort_order`.
Các nhóm trang chủ khác lọc `image_url` theo `/upcoming-game/`, `/new-on-difmark/`,
`/weekly-chart/`, `/under-10/`. Đây là điều kiện của URL ảnh, không phải tên bảng riêng.

## Tài nguyên cần cấu hình ngoài SQL

- **Auth email/password**: đang bật trên project mới. Route signup hiện dùng Admin API,
  nên server vẫn cần `SUPABASE_SERVICE_ROLE_KEY`; public key không đủ cho route này.
- **Google OAuth**: phải bật provider, cấu hình Client ID/Secret và callback
  `https://pcbxvswjcjdmelwznarp.supabase.co/auth/v1/callback`, Site URL và redirect URLs.
  Facebook/Twitch/Microsoft hiện chỉ là nút thông báo chưa hỗ trợ.
- **Stripe test**: checkout gọi API Next.js `/api/create-payment-intent`; không cần
  deploy Edge Function cũ. `.env.local` cần publishable key, secret key và service-role key.
  Server đọc giá sản phẩm và xác minh Stripe trước khi ghi đơn. Webhook local cần Stripe CLI.
  Xem [payment-setup.md](./payment-setup.md); chạy `payment-security.sql` để chặn browser ghi đơn.
- **Kết nối web**: `.env.local` đã có `NEXT_PUBLIC_SUPABASE_URL` và
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`; cấu hình hostname ảnh nằm trong `next.config.ts`.
  Bản deploy cần đặt các biến tương ứng và build lại.
- **CLI**: `.temp` còn liên kết project cũ; nếu dùng CLI thì link lại project mới.
  SQL Editor không phụ thuộc liên kết CLI này.

Một số file vẫn gọi backend qua `NEXT_PUBLIC_API_URL` (mặc định `localhost:5000`):
`hooks/useProduct.ts`, `app/api/sellers/route.ts`, các fallback trong
`components/user/seller-profile.data.ts` và luồng username onboarding cũ.
Tạo bảng Supabase không tự tạo các endpoint backend đó.

Ví, cấp độ, reviews/followers, danh mục top-up, một phần dashboard và tin tức
hiện lấy dữ liệu tĩnh; giỏ hàng/thông báo lưu ở trình duyệt. Không có truy vấn
Supabase tương ứng để suy ra các bảng `wallets`, `reviews`, `followers`, `carts`
hay `notifications` trong phạm vi mã nguồn hiện tại.

## Giới hạn hiện tại của checkout

Checkout hiện hỗ trợ sản phẩm catalog bằng USD trong Stripe test mode. Server xác thực
Supabase session, kiểm tra stock, tính giá bằng cents và gắn buyer/line prices vào metadata.
Trang success xác minh PaymentIntent qua server; URL và sessionStorage không xác nhận tiền.
Server ghi từng dòng đơn bằng UUID ổn định, chống trùng khi retry hoặc webhook gửi lại.

Chạy `payment-security.sql` trên project đã dựng trước thay đổi này. Browser chỉ đọc đơn;
service role ghi đơn sau xác minh. `setup.sql` đã cập nhật quyền cho lần dựng/rerun sau.
Webhook HTTPS/Stripe CLI phải cấu hình riêng để nhận sự kiện khi khách đóng browser.
Direct top-up, tiền tệ khác USD, giao key thật, trừ/reserve stock và hoàn tiền chưa được triển khai.
Luồng này từ chối live keys để tránh thu tiền cho dữ liệu demo.

## Tạo dữ liệu demo cho Popular Games

Sau khi chạy `setup.sql`, mở `supabase/seed-demo.sql`, copy toàn bộ vào SQL Editor
của project `pcbxvswjcjdmelwznarp` và bấm Run. File tạo một người bán `Demo Game Store`
và cập nhật đúng 8 dòng ảnh hiện có thành `is_popular = true`, `status = 'published'`,
có giá USD mẫu và tồn kho mẫu 10. Tải lại `/en` để thấy các thẻ sản phẩm.

Người bán này chỉ dùng để hiển thị thử: có Auth row để đáp ứng khóa ngoại,
không có mật khẩu/identity đăng nhập và bị khóa đăng nhập. Giá, tồn kho và mô tả
là dữ liệu demo. File chạy lại không tạo trùng và dừng nếu một ID đã thuộc người bán khác.
Public key không đủ quyền chạy file này qua API; hãy dùng SQL Editor.

## Bổ sung các mục trang chủ từ Storage

Với project đã chạy setup và đã có Demo Game Store, chỉ cần chạy toàn bộ
`supabase/homepage-sections.sql` trong SQL Editor. Không cần chạy lại setup hay seed demo.
File thêm cột còn thiếu, index và quyền đọc metadata ảnh trong 4 thư mục mới,
sau đó tự đọc tên ảnh thực tế từ `storage.objects` để tạo listing đã publish.
Phiên bản hiện tại giữ dữ liệu trung gian trong biến JSON cục bộ; không tạo bảng
tạm `homepage_seed_source` và không dùng `DROP POLICY`.

| Mục | Thư mục trong bucket `Image` | Cột bật hiển thị |
| --- | --- | --- |
| Popular Games | `popular_game` | `is_popular` (đã có) |
| Upcoming Games | `up_coming` | `is_upcoming` |
| New on Difmark | `new_on_difmark` | `is_new` |
| Weekly Chart | `weekly_chart` | `is_weekly` |
| Under $100 | `under_price` | `is_under_price`, đồng thời USD và giá < 100 |

Mỗi ảnh tạo một listing demo của Demo Game Store; ID ổn định theo đường dẫn ảnh
để chạy lại không trùng. Listing đã có cùng URL ảnh được dùng lại. Giá và tồn kho
mới là dữ liệu mẫu; giá, tiêu đề và ngày phát hành đã chỉnh được giữ nguyên.
Tên sản phẩm được suy ra từ tên file (một số tên game có mapping riêng); có thể
sửa `title` trong Table Editor nếu cần cách viết khác. Không tự điền ngày phát hành:
nhập `release_date` dạng `YYYY-MM-DD` để hiện badge trong Upcoming Games.
Ảnh phải ở ngay trong các thư mục trên; script bỏ qua video, thư mục lồng và file khác ảnh.

Trang chủ lấy dữ liệu ở server qua `lib/homepage-products.ts`, bằng public key và
không dùng session của browser, rồi truyền các thẻ đã có dữ liệu vào giao diện.
Truy vấn lọc bằng cột, không phụ thuộc tên thư mục URL, chỉ đọc sản phẩm `published`
và tối đa 8 dòng/mục theo `sort_order`, `id`. Khi SQL chạy xong, tải lại trang web.
Kết quả SQL cuối hiển thị số sản phẩm đủ điều kiện của từng mục, kể cả mục có 0 dòng.
Các dữ liệu Popular Games đang có được giữ nguyên. Thư mục khác không được cấp quyền mới.

## Kiểm tra và tái tạo inventory

Chạy tại thư mục gốc dự án:

```powershell
node supabase/scripts/inventory.cjs
npm install --prefix .codex-artifacts/supabase-validation --no-save --package-lock=false @electric-sql/pglite@0.5.8
node supabase/tests/verify-schema.cjs
```

Đã đạt 90 kiểm tra PostgreSQL: tạo mới, backfill/đồng bộ Auth, nâng cấp script cũ,
chạy lại giữ dữ liệu, FK dùng trong join, RLS và quyền cột, quyền người bán/người mua,
chat riêng tư, bộ đếm tin chưa đọc, đơn hàng nhiều sản phẩm/NULL top-up, Storage folder
và cấu hình publication, catalog demo hiển thị qua RLS, chạy lại không trùng và
bảo vệ sản phẩm của người bán khác, migration các mục trang chủ và import theo
Storage metadata. Kiểm tra chạy trong PGlite (PostgreSQL trong bộ nhớ) với
các role/Auth/Storage tối thiểu mô phỏng Supabase; không kết nối hay ghi vào project thật.
Chưa kiểm tra end-to-end Google OAuth, Stripe, hoặc luồng WebSocket Realtime trên hosted project.

Nguồn tham khảo: [Auth profile triggers](https://supabase.com/docs/guides/auth/managing-user-data),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security),
[Realtime publications](https://supabase.com/docs/guides/realtime/postgres-changes),
[Storage access control](https://supabase.com/docs/guides/storage/security/access-control).
