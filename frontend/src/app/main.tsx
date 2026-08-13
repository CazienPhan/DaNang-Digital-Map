import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import WonderApp from '@/features/wonder/WonderApp'

/**
 * Trong lúc chuyển sang giao diện WONDER, hai giao diện cùng tồn tại:
 *
 *   /            → giao diện WONDER (mới, đang làm)
 *   /?ui=legacy  → giao diện cũ chạy Map4D + dữ liệu thật
 *
 * Công tắc này sẽ được gỡ bỏ khi WONDER đã nối xong toàn bộ dữ liệu thật.
 */
const useLegacyUi = new URLSearchParams(window.location.search).get('ui') === 'legacy'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {useLegacyUi ? <App /> : <WonderApp />}
  </StrictMode>,
)
