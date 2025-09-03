# Rive Animations for Login Component

## Cách sử dụng Rive animations:

### 1. Tạo animations tại Rive.app
- Truy cập https://rive.app
- Tạo animation mới hoặc sử dụng templates có sẵn
- Export file dưới dạng .riv

### 2. Các animation cần thiết:

#### `login-animation.riv`
- **State Machines**: `LoginFlow`
- **States**: 
  - `Idle` - Trạng thái mặc định
  - `Success` - Khi đăng nhập thành công
  - `Error` - Khi có lỗi đăng nhập
- **Usage**: Background animation cho toàn bộ trang

#### `loading.riv`
- **State Machines**: `Loading`
- **States**:
  - `Idle` - Không loading
  - `Loading` - Đang loading
- **Usage**: Animation khi đang đăng nhập

### 3. Thay thế placeholder files:
- Xóa các file placeholder hiện tại
- Copy file .riv thực tế vào thư mục này
- Đảm bảo tên file và state machines khớp với code

### 4. Tùy chỉnh animations:
- Có thể thay đổi `src` trong code để sử dụng animation khác
- Điều chỉnh `fit` và `alignment` để phù hợp với design
- Thêm `onStateChange` để xử lý các state transitions

### 5. Fallback:
- Nếu không có Rive animations, component sẽ hoạt động bình thường
- Chỉ mất hiệu ứng animation, không ảnh hưởng chức năng

## Ví dụ animation đơn giản:
```jsx
// Trong component
const { RiveComponent, rive } = useRive({
  src: '/animations/custom-animation.riv',
  stateMachines: 'CustomFlow',
  autoplay: true,
});

// Trigger animation
if (rive) {
  rive.play('CustomState');
}
```
