# Session notes — POI marker density cap redesign (2026-08-12)

Bối cảnh cho AI session sau: đây là log đầy đủ những gì đã sửa trong phiên làm việc
này, theo đúng thứ tự xảy ra, kèm lý do và trạng thái hiện tại. Đây là phiên **kế
tiếp** của `2026-08-11-poi-map-icon-styling.md` — đọc file đó trước để hiểu tại sao
có `resolvePoiStyle()`, 3 tier, `POIOverlay`, v.v. File này chỉ ghi những gì **thay
đổi thêm** trong phiên 2026-08-12.

## Tóm tắt 1 câu

Từ cơ chế "3 tier hiện/ẩn theo ngưỡng zoom cố định" (session trước) đã đi qua 2 lần
redesign kiến trúc (thử `MarkerClusterer` rồi bỏ), để tới trạng thái **hiện tại**:
tier 1 (marker_url) cap **chính xác tuyệt đối** theo tổng số hiển thị trên màn hình
(tính ở frontend), tier 2/3 (icon Map4D + giọt nước mặc định) cap **gần đúng** theo
tổng mong muốn chia cho số tile ước lượng (tính ở backend, qua `POIOverlay`).

---

## 1. Vấn đề ban đầu: "rừng marker"

User báo khi zoom vào, POI hiện quá nhiều, giống "rừng marker". Yêu cầu gốc:

1. Thứ tự ưu tiên marker: `marker_url` (tier 1) > icon Map4D có sẵn (tier 2) >
   marker giọt nước mặc định (tier 3).
2. Giới hạn/phân bổ theo zoom: zoom thấp → ít, zoom cao → nhiều.

### Root cause tìm được (đọc code thật, không đoán)

- **Bug rò rỉ marker**: tier 1 được render bằng `map4d.POI` đứng riêng
  (`customPoiByDbIdRef`/`customPoiByEngineIdRef`), nhưng cleanup của các ref này
  chỉ chạy khi `mapInstance`/`activeFilters` đổi — **không chạy khi pan/zoom qua
  tile mới**. Guard `if (!customPoiByDbIdRef.current.has(poi.id))` chỉ chặn tạo
  trùng, không xóa marker đã ra khỏi khung nhìn → mọi tier-1 POI từng đi qua tồn
  tại **vĩnh viễn** trên map.
- **Tier 1 không có trần zoom**: `isVisibleAtZoom(tier, zoom)` của session trước
  luôn trả `true` cho tier 1 ở mọi zoom, kể cả zoom ra toàn thành phố.

---

## 2. Lần redesign #1: Marker + MarkerClusterer — ĐÃ THỬ RỒI BỎ

**Không còn tồn tại trong code hiện tại.** Ghi lại để session sau không mất công
thử lại đường này.

Đã làm: bỏ hẳn `POIOverlay`, tier 1 + tier 3 dùng `map4d.Marker` + 1
`MarkerClusterer` duy nhất, tier 2 vẫn dùng `map4d.POI` riêng (không cluster được
vì `Marker` không có property `type` — chỉ `POI` mới có `type` để dùng icon dựng
sẵn Map4D). Tự viết tile-fetch bằng `idle` event + diff theo `poi.id` để thay thế
`POIOverlay`.

**2 bug phát sinh, là lý do bỏ hướng này:**

1. **Icon tier 1 hiển thị siêu to.** `Marker.icon` nhận URL string thô, SDK vẽ
   đúng kích thước gốc file ảnh (ảnh gốc trên Supabase to). `POI.icon` thì SDK tự
   bound trong khung marker cố định, luôn gọn — khác biệt hành vi giữa 2 class SDK.
2. **Tier 2/3 mất màu đa dạng, đồng loạt đỏ.** `POIOverlay` có pipeline "vector
   style texture" nội bộ tự chọn màu theo từng `type` (theo file style riêng của
   Map4D). Khi tier 2/3 chuyển sang tạo `map4d.POI` thủ công (để tương thích với
   việc bỏ `POIOverlay`), field `color` hầu như luôn `undefined` (đa số POI không
   có `category_color_hex`) → SDK áp cứng màu mặc định `#FF0000` cho **mọi** type.

User phản hồi rõ: **không phải bug tự nhiên, là do đổi kiến trúc** — trước đó
(qua `POIOverlay`) vẫn dùng "màu của map4d" và có nhiều màu khác nhau.

**Kết luận:** `POIOverlay` phải giữ lại cho tier 2/3 (để giữ đúng màu gốc SDK).
`MarkerClusterer` không dùng nữa.

---

## 3. Lần redesign #2: bỏ cluster, cap cứng theo bảng zoom — CŨNG BỊ THAY THẾ MỘT PHẦN

User yêu cầu đơn giản hoá: bỏ `MarkerClusterer`, mỗi POI luôn là 1 object riêng lẻ,
giới hạn số lượng bằng **cap cứng theo zoom** (không phải on/off theo ngưỡng nữa),
vẫn giữ thứ tự ưu tiên tier1 > tier2 > tier3 khi cap không đủ chỗ.

Đã làm (backend `poi.service.ts`):

- `ZOOM_POI_CAP_ANCHORS`: bảng `{zoom, cap}` nội suy tuyến tính giữa các mốc (thay
  vì nhảy bậc đột ngột) — cap này là **số POI tối đa mỗi TILE**, không phải tổng
  màn hình (điểm này sau mới lộ ra là hiểu lầm, xem mục 5).
- `getPoiTier()` giữ nguyên (3 tier như session trước).
- Sort toàn bộ POI trong tile theo tier (1 trước, 2, rồi 3), rồi `.slice(0, cap)`
  — tier 1 luôn thắng chỗ trước tiên.

Frontend (`MapContainer.tsx`): tier 1 chuyển từ `Marker` về lại `POI` (fix bug icon
to), vẫn giữ `POIOverlay` riêng cho tier 2/3 (fix bug mất màu), tier 1 vẫn tự fetch
tile qua `idle` + diff theo `poi.id` (giữ fix bug rò rỉ marker).

### 3.1. User muốn chia theo % thay vì "tier 1 thắng hết"

User: muốn set % cụ thể theo zoom, VD zoom 14 thì x% tier1, y% tier2, còn lại là
giọt nước (tier3).

Đã thêm `ZOOM_TIER_MIX_ANCHORS` (`{zoom, tier1Pct, tier2Pct}`, tier3Pct = phần dư)
+ hàm `fillByTierMix()`: mỗi tier có target riêng = `cap * pct`, nếu 1 tier không
đủ POI để lấp target thì phần dư **chuyển sang tier tiếp theo** (1→2→3, một chiều,
không chuyển ngược). **Cấu trúc này đã bị thay thế ở mục 4** (tier 1 không còn nằm
chung 1 cap với tier 2/3 nữa) — tên hàm/biến cũ (`ZOOM_TIER_MIX_ANCHORS`,
`fillByTierMix`, `getPoiCapForZoom`, `getTierMixForZoom`) **không còn tồn tại**
trong code, đừng tìm lại.

---

## 4. Phát hiện quan trọng: cap là PER TILE, không phải per màn hình

User set `cap = 10` ở zoom 12, kỳ vọng tổng 10 marker trên màn hình, nhưng vẫn thấy
"như rừng". Lý do: **1 màn hình hiển thị nhiều tile cùng lúc** (mỗi tile chỉ
256×256px, một cửa sổ trình duyệt thường phủ ~15-20 tile). Cap "10/tile" × "~15-20
tile" = tổng thực tế trên màn hình có thể **150-200 marker**, không phải 10.

Đây là nguyên nhân gốc của "t để 10 mà vẫn như rừng" — không phải bug, là hiểu nhầm
đơn vị cap.

### Giải pháp: decouple tier 1 (cap chính xác) khỏi tier 2/3 (cap gần đúng)

Không thể áp dụng "cap chính xác theo tổng màn hình" cho cả 3 tier như nhau, vì:

- **Tier 1**: code tự viết (client tự fetch từng tile trong viewport, tự gộp kết
  quả) → **biết chính xác** đang tải bao nhiêu tile, tổng bao nhiêu POI → cap
  chính xác tuyệt đối được.
- **Tier 2/3**: đi qua `POIOverlay`, Map4D SDK tự quyết định tải tile nào/khi nào,
  gọi backend **riêng lẻ từng tile một, không có state chung** giữa các request →
  backend **không thể biết** đang có bao nhiêu tile đang được tải cho viewport
  hiện tại → chỉ có thể áp dụng **gần đúng**: chọn tổng mong muốn, chia cho 1 hằng
  số ước lượng "trung bình bao nhiêu tile phủ 1 màn hình", ra cap/tile.

---

## 5. Trạng thái hiện tại (đọc kỹ trước khi sửa tiếp)

### Backend — `backend/src/services/poi.service.ts`

```ts
// Helper dùng chung cho mọi bảng nội suy theo zoom bên dưới
function interpolateByZoom<K>(anchors, zoom, key): number

// Tier 1: KHÔNG PHẢI cap thật — chỉ là trần an toàn/tile, phòng 1 tile
// pathological quá dày trước khi frontend tự cap chính xác.
const TIER1_SAFETY_CAP_PER_TILE = 300;

// Tier 2/3: cap/tile = (tổng mong muốn trên màn hình) / ASSUMED_TILES_PER_VIEWPORT
const ASSUMED_TILES_PER_VIEWPORT = 20;   // ước lượng, CHƯA đo thật
const ZOOM_TIER23_TOTAL_ANCHORS = [...]; // user đã tự chỉnh xuống 15/20/25/30/35/40
function getTier23CapPerTile(zoom): number

// Tỷ lệ tier2 (icon Map4D) trong nhóm tier2+3 — tier3Share = phần dư
const ZOOM_TIER2_SHARE_ANCHORS = [...];  // user đã chỉnh flat 0.8 mọi zoom
function getTier2Share(zoom): number

function fillTier23(pools, cap, tier2Share): T[]  // tier2 lấp trước, dư chuyển tier3

// getPoisByTile(): gom POI theo 3 pool (tier1/tier2/tier3), tier1 chỉ cắt theo
// safety cap, tier2/3 cắt theo fillTier23(). rows = [...tier1Rows, ...tier23Rows]
```

**Lưu ý:** các tên biến/hàm cũ từ mục 3 (`ZOOM_POI_CAP_ANCHORS`,
`getPoiCapForZoom`, `ZOOM_TIER_MIX_ANCHORS`, `getTierMixForZoom`, `fillByTierMix`)
đã bị xoá hoàn toàn, thay bằng bộ tên ở trên. Đừng nhầm 2 hệ thống.

### Frontend — `frontend/src/features/map/components/MapContainer.tsx`

```ts
// Cap CHÍNH XÁC tổng số tier-1 hiện trên màn hình, theo zoom
const TIER1_TOTAL_CAP_ANCHORS = [...]; // user đã chỉnh xuống 9/12/15/18/21/24
function getTier1TotalCap(zoom): number
```

Có **2 effect riêng** trong component:

1. **Effect `POIOverlay`** (tier 2/3): y hệt cơ chế cũ từ session trước — SDK tự
   quản lý tile, giữ màu gốc đa dạng theo `type`. `parserData` lọc bỏ item có
   `style.icon` (nhường cho effect kia xử lý).
2. **Effect tile-diff tự viết** (chỉ tier 1): lắng nghe `idle`, tự tính tile x/y/z
   phủ viewport hiện tại (dùng `latLngToTile()`, công thức Web Mercator chuẩn,
   nghịch đảo với công thức backend), fetch **tất cả** tile đó, gộp kết quả, lọc
   chỉ giữ item có `style.icon` (tier 1), dedupe theo `id`, rồi
   `.slice(0, getTier1TotalCap(zoomLevel))` — đây là bước cap **chính xác**. Diff
   với `dbPoisRef` hiện có để add/remove đúng phần thay đổi (fix bug rò rỉ marker
   gốc).

### Click handling (unified listener, dòng ~200 trong `MapContainer.tsx`)

Có **2 nhánh xử lý** cho database POI, tuỳ POI đó đến từ effect nào:

- `args.poi.getUserData()` có giá trị → POI tier 1 (do effect tự viết tạo, có gọi
  `setUserData(poi)` khi tạo).
- `args.poi.id` bắt đầu bằng `"database-poi-"` (prefix do `POIOverlay` tự thêm) →
  POI tier 2/3 do `POIOverlay` render nội bộ, **không có `getUserData`** (object
  của SDK, không phải object mình tạo) — phải đọc lại từ field nhúng sẵn trong
  item trả về cho `parserData` (`name_en`, `poi_type`, `dia_chi`).

Nếu sau này đổi cách tier 2/3 render (VD không dùng `POIOverlay` nữa), **phải sửa
cả nhánh click này**, không chỉ chỗ render.

---

## 6. Bug ngoài ý muốn: `nodemon` crash khi user tự sửa file

User tự tay sửa `poi.service.ts` (đổi số cap), có lúc để sót tham chiếu tới biến
đã xoá (`isVisibleAtZoom`, `TIER_1_LOW_ZOOM_MAX`, `TIER_1_LOW_ZOOM_CAP` — di sản
từ mục 3, đã xoá). TypeScript compile fail → `nodemon` crash → toàn bộ request tới
`/api/pois/tile/...` bị `ERR_CONNECTION_REFUSED` ở frontend console. **Không phải
bug logic**, chỉ cần sửa lại reference rồi lưu, `nodemon` tự restart.

**Cách nhận biết nhanh:** xem terminal chạy `npm run dev` ở `backend/`, nếu có
`TSError: Unable to compile TypeScript` hoặc `[nodemon] app crashed - waiting for
file changes...` thì đúng tình huống này.

---

## 7. Lưu ý khác đã giải thích cho user (để không phải giải thích lại)

- **Zoom lẻ vs zoom nguyên**: `map.getCamera().getZoom()` trả số thực (VD
  `13.7116`), nhưng tile chỉ tồn tại ở zoom nguyên → code luôn
  `Math.floor(camera.getZoom())` trước khi gọi API/tính cap. Trong khoảng
  13.0–13.99, tile z và cap **không đổi**, chỉ nhảy khi qua mốc nguyên tiếp theo.
- **Cách xem zoom hiện tại khi test tay**: `(window as any).map` đã được gán global
  sẵn trong `MapContainer.tsx` (dòng gần đầu effect init map) → mở DevTools Console,
  gõ `map.getCamera().getZoom()`.
- **Test headless (Playwright) có giới hạn môi trường**: base tile nền bản đồ có
  lúc render ra khối màu đặc (nâu/xanh) thay vì ảnh vệ tinh thật — do headless
  Chromium thiếu WebGL/GPU thật, **không phải bug**. Cũng từng thấy page error
  flaky `Cannot read properties of null (reading 'width')` — trace vào tận code
  vendor SDK minified, xảy ra cả ở code cũ (baseline) khi test đủ nhiều lần → kết
  luận là timing-flake của SDK trong môi trường thiếu WebGL, không phải do code
  mình. Nếu gặp lại, đừng cố "fix" trong code app.

---

## 8. Việc chưa làm / có thể cần làm tiếp

- **`ASSUMED_TILES_PER_VIEWPORT = 20` chưa được đo thật**, chỉ là ước lượng cho
  cửa sổ trình duyệt cỡ ~1400×900. Nếu tier 2/3 vẫn lệch nhiều so với số user gõ ở
  `ZOOM_TIER23_TOTAL_ANCHORS`, tune hằng số này trước (không phải tune lại bảng
  total).
- User đang tự tay chỉnh số trong cả 2 bảng cap (`ZOOM_TIER23_TOTAL_ANCHORS`,
  `ZOOM_TIER2_SHARE_ANCHORS` ở backend; `TIER1_TOTAL_CAP_ANCHORS` ở frontend) —
  các con số trong code tại thời điểm ghi note này (`15/20/25/30/35/40`,
  `tier2Share` flat `0.8`, `9/12/15/18/21/24`) là **do user tự chỉnh**, không phải
  giá trị AI đề xuất ban đầu — đọc trực tiếp trong file để lấy số mới nhất, đừng
  tin số ghi trong note này nếu đã lâu.
- **Chưa quay lại xem tier 2/3 (qua `POIOverlay`, cap gần đúng) có thực sự khớp kỳ
  vọng của user sau khi decouple hay chưa** — mới verify bằng công thức tính tay +
  1 lần chụp màn hình Playwright, chưa có phản hồi trực tiếp "được rồi" từ user
  cho bản decouple cuối cùng này.
- Toàn bộ mục "Việc còn dang dở" của session trước (test thật các `raw_type` còn
  lại trong `RAW_TYPE_TO_SDK_TYPE`, quyết định tự động hoá sync
  `poiTypeMapping.json`) **vẫn còn nguyên, chưa đụng tới trong phiên này**.

## 9. File map nhanh (chỉ phần đổi thêm trong phiên này)

```
backend/
  src/services/poi.service.ts   # toàn bộ mục 5 "Backend" ở trên — thay hết phần declutter/cap của session trước

frontend/
  src/features/map/components/MapContainer.tsx
                                 # TIER1_TOTAL_CAP_ANCHORS, 2 effect riêng (POIOverlay cho tier2/3,
                                 # tile-diff tự viết cho tier1), click handler 2 nhánh (getUserData
                                 # vs prefix "database-poi-")

docs/session-notes/
  2026-08-12-poi-marker-density-cap-redesign.md   # chính file này
```
