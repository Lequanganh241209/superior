# Kế hoạch nâng cấp "Aether OS" vượt xa Lovable

## 1. Tái cấu trúc Routing (Refactor)
- **Di chuyển Dashboard:** Chuyển code từ `src/app/page.tsx` (hiện tại là Dashboard) sang `src/app/dashboard/page.tsx`.
- **Mục đích:** Giải phóng đường dẫn gốc `/` để làm Landing Page.

## 2. Xây dựng "Killer" Landing Page (Trang chủ)
- **File:** `src/app/page.tsx`
- **Thiết kế:** Phong cách "Futurist/Cyberpunk" (như đã định nghĩa trong system prompt của bạn).
- **Các Section chính:**
    - **Hero Section:** Tiêu đề cực mạnh ("Build Software at the Speed of Thought"), hiệu ứng ánh sáng, nút CTA dẫn vào Dashboard.
    - **Bento Grid Features:** Hiển thị các tính năng cốt lõi (Autonomous Coding, Self-Healing, One-Click Deploy) dưới dạng lưới hiện đại.
    - **Comparison:** Tại sao Aether OS > Lovable (Tốc độ, Khả năng tự sửa lỗi).
    - **Pricing & CTA:** Thúc đẩy người dùng đăng ký.
- **Công nghệ:** Sử dụng `framer-motion` cho animation mượt mà.

## 3. Cập nhật Luồng Authentication
- **File:** `src/app/login/page.tsx`
- **Thay đổi:** Sau khi đăng nhập thành công, redirect user về `/dashboard` thay vì `/`.

## 4. Kiểm tra & Hoàn thiện
- Đảm bảo không có lỗi biên dịch.
- Xác nhận trải nghiệm người dùng mượt mà từ Landing Page -> Login -> Dashboard.