import { useEffect } from 'react';

/**
 * Đóng hộp thoại khi nhấn phím Esc.
 *
 * Dùng kèm `dismissOnBackdrop` bên dưới để người dùng có đủ ba cách thoát:
 * bấm nút ✕, bấm ra ngoài, hoặc nhấn Esc — đúng thói quen thông thường.
 */
export function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);
}

/**
 * Trả về handler cho lớp nền của hộp thoại.
 *
 * Chỉ đóng khi cú bấm rơi đúng vào lớp nền (`e.target === e.currentTarget`).
 * Bấm bên trong khung nội dung thì sự kiện nổi lên có `target` là phần tử con,
 * nên không bị đóng nhầm — cách này an toàn hơn `stopPropagation` ở khung
 * nội dung, vì không chặn các handler khác đang lắng nghe ở ngoài.
 */
export function dismissOnBackdrop(onClose: () => void) {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
}
