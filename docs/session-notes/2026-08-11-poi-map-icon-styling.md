# Session notes — POI map icon styling & declutter (2026-08-11)

Bối cảnh cho AI session sau: đây là log đầy đủ những gì đã sửa trong phiên làm việc
này, theo đúng thứ tự xảy ra, kèm lý do và trạng thái hiện tại. Đọc file này trước
khi động vào bất kỳ chỗ nào liên quan đến render POI trên map.

## Tóm tắt 1 câu

Xây hệ thống chọn icon/màu cho marker POI trên Map4D dựa theo dữ liệu DB thay vì
hard-code, dùng SDK built-in icon type khi có thể, và thêm/rồi-bỏ cơ chế giảm mật độ
marker theo zoom — hiện tại cơ chế giảm mật độ **vẫn còn** nhưng **chưa được test lại**
sau lần user báo "còn dày" (xem mục "Việc còn dang dở" cuối file).

---

## 1. Tắt POI mặc định của Map4D

`frontend/src/features/map/components/MapContainer.tsx` — dòng khởi tạo map:

```ts
map.setPOIsEnabled(false);
```

Trước đó là `true`. Chỉ tắt POI **có sẵn của Map4D** (loại `mappoi`), không ảnh
hưởng POI tự vẽ bằng `map4d.POI`.

## 2. Style POI theo dữ liệu DB thay vì hard-code (yêu cầu gốc)

### Vấn đề ban đầu

`MapContainer.tsx` cũ có 1 hàm `resolvePoiIcon()` + `getPoiMarkerIcon()` tự vẽ SVG
data-URI theo `poi_type` (4 màu cứng: cam/xanh lá/tím/xám cho
TOURISM/OCOP_STORE/MARKET/khác). Không dùng icon SDK có sẵn, không dùng dữ liệu
category thật từ DB.

### Quyết định kiến trúc (đã hỏi và chốt với user)

- **Nguồn data**: qua backend REST API (`/api/pois`, `/api/pois/tile/:x/:y/:zoom`),
  KHÔNG thêm Supabase client trực tiếp ở frontend (frontend chưa từng có
  `@supabase/supabase-js`, giữ nguyên kiến trúc cũ).
- **Không tạo hệ thống render mới** (không dùng `MarkerClusterer` + `map4d.Marker`
  như đề xuất ban đầu). Thay vào đó **enrich pipeline `POIOverlay` đang chạy sẵn**
  trong `MapContainer.tsx` (đã có unified click listener, standalone-POI fallback
  cho icon ảnh HTTP — không đụng vào 2 phần đó).
- **Độ ưu tiên style** (chốt qua nhiều vòng hỏi + test tay trên map thật):
  1. `category_icon_url` (từ `poi.poi_categories.icon_url`, join sẵn ở backend,
     trả về field `iconUrl` trong response) — nếu có, luôn thắng, dùng làm
     `icon` của `map4d.POI`.
  2. Nếu không có icon riêng: tra `raw_type` (mảng text, cột
     `poi.pois.raw_type`) trong bảng `RAW_TYPE_TO_SDK_TYPE` — tag đầu tiên
     **theo thứ tự khai báo trong bảng** (không phải thứ tự trong mảng) mà khớp
     thì thắng, set `type` = SDK built-in type tương ứng.
  3. Nếu `raw_type` không khớp gì: tra `poi_type` (ENUM cố định 7 giá trị:
     TOURISM/RESTAURANT/OCOP_STORE/HOTEL/MARKET/OTHER/UNVERIFIED) trong bảng
     `POI_TYPE_TO_SDK_TYPE`.
  4. Không khớp gì cả → không set `type`/`icon` → SDK tự vẽ marker mặc định
     (giọt nước xanh). Không tự thiết kế icon fallback nữa (khác với code cũ).
  - `color` (mã HEX) lấy từ `category_color_hex` (cột `poi.poi_categories.color_hex`,
    cũng join sẵn ở backend) ở MỌI tier, độc lập với icon/type — nếu DB null thì
    không set màu, để SDK dùng màu gốc của icon/type đó.

### File liên quan

- **`frontend/src/features/map/config/mapCategoryConfig.ts`** — chứa
  `resolvePoiStyle(poi): { icon?, color?, type? }` (hàm pure, dễ unit test sau
  này — chưa viết test vì frontend chưa có test runner nào, cố tình không cài
  thêm để giữ đúng scope).
- **`backend/src/services/poi.service.ts`** — `getAllPois()` và
  `getPoisByTile()` JOIN thêm `poi.poi_categories.color_hex AS category_color_hex`
  và SELECT thêm `p.raw_type` (trước đó 2 field này chưa được trả về, chỉ có ở
  `getPoiDetails()`).
- `frontend/src/services/supabase/poi.service.ts` — `POIData` interface thêm
  `category_color_hex`, `raw_type`.
- `MapContainer.tsx`: hàm cũ `resolvePoiIcon()`, `getPoiMarkerIcon()`,
  `getPoiMarkerIconDataUri()` (vẽ SVG tay) đã **xóa hẳn**. `parserData` của
  `POIOverlay` giờ gọi `resolvePoiStyle(poi)`, dùng `style.icon` để quyết định
  POI đi vào nhánh `standalone map4d.POI` (icon ảnh HTTP) hay nhánh
  `standardPois` (POIOverlay vector, dùng `type`).

## 3. Bảng ánh xạ type — vấn đề đồng bộ 2 project & giải pháp

### Vấn đề phát hiện

`RAW_TYPE_TO_SDK_TYPE` / `POI_TYPE_TO_SDK_TYPE` ban đầu chỉ viết ở frontend. Khi
cần backend cũng biết 2 bảng này (để lọc theo zoom — xem mục 4), nếu hard-code 2
bản riêng ở backend và frontend sẽ dễ lệch nhau. Thử phương án "1 file JSON dùng
chung, cả 2 cùng import trực tiếp lúc runtime" nhưng **không khả thi**: backend và
frontend deploy tách theo subfolder riêng (Render/hosting set Root Directory theo
từng service), 1 project không thấy được file nằm ngoài folder gốc của nó lúc build
production.

### Giải pháp đã làm: 1 nguồn thật + script sync (copy)

- **`shared/poiTypeMapping.json`** (repo root) — **nguồn thật duy nhất**, sửa ở
  đây. Có 2 key: `POI_TYPE_TO_SDK_TYPE`, `RAW_TYPE_TO_SDK_TYPE`.
- **`scripts/sync-poi-type-mapping.js`** — script Node thuần (không cần
  ts-node/DB), copy `shared/poiTypeMapping.json` ra 2 nơi:
  - `backend/src/config/poiTypeMapping.json`
  - `frontend/src/features/map/config/poiTypeMapping.json`
- Chạy: `node scripts/sync-poi-type-mapping.js` từ repo root.
- **Đây là sync thủ công, KHÔNG tự động.** Không có hook nào chạy sync trong
  `npm run dev`/`build`. User đã hỏi có nên tự động hoá không — chưa quyết định,
  vẫn đang thủ công. Nếu session sau muốn tự động hoá (VD `predev`/`prebuild`
  script hoặc file watcher), đó là việc chưa làm, không phải đã làm rồi bỏ.
- Backend: thêm `"resolveJsonModule": true` vào `backend/tsconfig.json`. Đã verify
  `npm run build` copy đúng JSON sang `dist/config/poiTypeMapping.json` (tsc tự
  copy file JSON được import vào outDir, không cần thêm bước copy thủ công).
- Frontend: thêm `"resolveJsonModule": true` vào `frontend/tsconfig.app.json`.
  Vite tự hỗ trợ import JSON, không cần cấu hình thêm.

**⚠️ Lỗi đã xảy ra 1 lần trong phiên này**: user từng sửa nhầm trực tiếp vào bản
copy `frontend/src/features/map/config/poiTypeMapping.json` thay vì
`shared/poiTypeMapping.json`. Đã phát hiện qua `diff`, áp lại đúng diff đó vào
file gốc rồi mới sync. **Luôn nhắc user (hoặc tự kiểm tra qua diff) sửa đúng file
gốc trước khi sync**, vì sync là copy 1 chiều `shared/` → 2 project, sync sai
chiều sẽ mất data.

### Giá trị đã test THẬT trên map (đáng tin cậy)

Test bằng cách tạo tạm `new map4d.POI({..., type: "X"})` ở `MapContainer.tsx`
(luôn xóa sau khi test — không để sót code test trong file thật):

| raw_type tag | SDK `type` xác nhận đúng | Ghi chú |
|---|---|---|
| `bridge` | `bridge` | ra icon cầu, không phải màu mặc định |
| `park`, `campground` | `park` | **`tree` đã test SAI** (ra giọt nước mặc định), `park` mới đúng |
| `hospital` | `hospital` | tách riêng khỏi `doctors` sau khi test |
| `hotel`, `lodging` | `hotel` | **`motel` đã test SAI** (không rõ ra gì khác biệt), user tự sửa thành `hotel` |
| `pharmacy` | `pharmacy` | user tự thêm, chưa thấy note xác nhận rõ ràng nhưng đã set trong bảng |

Các giá trị còn lại trong `RAW_TYPE_TO_SDK_TYPE`
(`cafe→cafe, restaurant→restaurant, food_service→restaurant, bakery→cafe,
bar→restaurant, store/grocery_store/.../jewelry_store→shop,
electronics_store/computer_store→electronics, shopping_mall→marketplace,
museum/art_gallery→museum, university→university,
primary_school/secondary_school/education→school, bank/finance→bank, atm→atm,
health/doctor/dentist→hospital (đổi từ doctors sau lần sửa tay của user),
bus_station/transit_station/public_transport→bus_station,
cinema/entertainment→theatre, stadium→stadium`) — **CHƯA test thật**, chỉ là suy
đoán ban đầu (SDK không công khai đầy đủ danh sách type hỗ trợ). Không khớp thì
âm thầm fallback về marker mặc định, không lỗi — nhưng đừng coi các giá trị này là
đã xác nhận chỉ vì có trong bảng.

## 4. Cơ chế giảm mật độ marker theo zoom (declutter) — 3 tầng

### Vấn đề

Sau khi bảng `raw_type`/`poi_type` phủ nhiều loại, phần lớn POI trong khu vực đông
đúc đều "có style" → map vẫn rất dày marker (chỉ đổi từ giọt nước xanh sang nhiều
icon màu, không giảm số lượng). User gửi ảnh so sánh với map chính thức của Map4D
(thưa hơn nhiều) và muốn giảm mật độ.

### Đã cân nhắc 4 hướng, user chỉ chọn (A)

- (A) **Zoom nhiều tầng** ← đã chọn, đã làm.
- (B) Bộ lọc nhóm category do user tự bật/tắt (UI) — không chọn.
- (C) Giới hạn số lượng/tile — không chọn.
- (D) Cluster thật bằng `map4d.Marker` + `MarkerClusterer` — không chọn (sẽ mất
  icon theo `type` có sẵn của SDK, phải tự vẽ icon SVG — đi ngược quyết định ở
  mục 2).

### Cài đặt hiện tại — `backend/src/services/poi.service.ts`

```ts
const TIER_2_MIN_ZOOM = 12;
const TIER_3_MIN_ZOOM = 19;

function getPoiTier(poi): 1 | 2 | 3 {
  // tier 1: có category_icon_url thật từ DB
  // tier 2: raw_type hoặc poi_type khớp bảng mapping (có icon SDK theo type)
  // tier 3: không khớp gì — sẽ ra marker mặc định
}

function isVisibleAtZoom(tier, zoom): boolean {
  // tier 1: luôn hiện
  // tier 2: hiện khi zoom >= TIER_2_MIN_ZOOM (12)
  // tier 3: hiện khi zoom >= TIER_3_MIN_ZOOM (19)
}
```

Áp dụng trong `getPoisByTile()` (dùng bởi `POIOverlay.getUrl` trong
`MapContainer.tsx` — tile-based, có `zoom` sẵn trong URL). **KHÔNG** áp dụng trong
`getAllPois()` (endpoint `/api/pois`, dùng ở chỗ khác, không có khái niệm zoom).

Đã verify bằng test thật qua `curl` (không phải chỉ đọc code): so sánh cùng 1 khu
vực ở zoom 11/12/18/19, xác nhận tier 3 (VD POI "Cơ sở Mực khô Hạng Huệ" —
`OCOP_STORE`, không icon_url, không raw_type) chỉ xuất hiện từ zoom 19 trở lên,
đúng thiết kế.

### ⚠️ Việc còn dang dở — ĐỌC KỸ TRƯỚC KHI ĐỘNG VÀO

1. **Suýt bị xóa nhầm.** Giữa phiên, user nói "xóa dùm 2 cái filter đi" — AI hiểu
   nhầm là "2 filter" = `TIER_2_MIN_ZOOM`/`TIER_3_MIN_ZOOM` và đã xóa sạch cơ chế
   3 tầng này. User phản hồi đó KHÔNG phải ý họ ("ai kêu m xóa cơ chế mới xây").
   Đã khôi phục lại y hệt bản trước đó (xem code ở mục trên). "2 cái filter" thật
   ra là 2 nút UI "Điểm tham quan"/"Sản phẩm OCOP" (xem mục 5) — **đã xóa đúng cái
   đó rồi**, không phải cơ chế zoom.
2. **Ngưỡng 12/19 chưa được test lại sau khi user báo "còn dày".** Toàn bộ luồng
   sự kiện: (a) build cơ chế 3 tầng (12/16/19 → thực tế code chỉ dùng 12 và 19,
   số "16" trong câu trả lời của user chỉ là nhãn option, không phải threshold
   riêng) → (b) user gửi ảnh chê "vẫn dày" → (c) user gõ "xóa 2 cái filter" (ý là
   UI buttons) → (d) AI hiểu nhầm xóa nhầm cơ chế zoom → (e) khôi phục lại → (f)
   sau đó chuyển hướng luôn sang xóa UI filter buttons, **chưa quay lại xác nhận
   xem 12/19 có thực sự giải quyết được độ dày mà user chê ở bước (b) hay chưa**.
   Rất có thể vẫn cần chỉnh `TIER_2_MIN_ZOOM` lên cao hơn 12 (hiện tại từ zoom 12
   đã hiện MỌI POI có `raw_type`/`poi_type` khớp bảng — đúng cái đang gây dày đặc
   trong ảnh user gửi ở tin nhắn than phiền). **Việc tiếp theo hợp lý nhất: hỏi
   user xem map hiện tại (sau khi đã xóa UI filter buttons, threshold 12/19 vẫn
   còn) có còn dày như ảnh cũ không, rồi mới quyết định có cần nâng
   `TIER_2_MIN_ZOOM` hay không.**

## 5. Xóa UI filter "Điểm tham quan" / "Sản phẩm OCOP"

User xác nhận (kèm ảnh chụp 2 nút) muốn xóa hẳn 2 nút toggle filter trên map,
không phải cơ chế zoom ở mục 4. Đã xóa:

- `frontend/src/features/map/components/MapFilterBar.tsx` — **file đã xóa hẳn**
  (component `MapFilterBar`, type `MapFilters`).
- `frontend/src/features/map/index.ts` — bỏ 2 dòng export của `MapFilterBar`.
- `frontend/src/app/App.tsx`:
  - Bỏ import `MapFilterBar`, `type MapFilters`.
  - Bỏ state `const [mapFilters, setMapFilters] = useState<MapFilters>(...)`.
  - Bỏ JSX `<div className="absolute top-[41px] ..."><MapFilterBar .../></div>`.
  - Bỏ prop `activeFilters={mapFilters}` khi render `<MapContainer />`.

**Hệ quả**: `MapContainer` nhận `activeFilters` là `undefined` bây giờ (prop vẫn
tồn tại trong `MapContainerProps`, chỉ là không ai truyền vào nữa — cố tình giữ
lại prop, không xóa, vì đây là optional capability không gây hại nếu không dùng).
Theo doc-comment sẵn có trong `MapContainerProps`: "Omitted -> no filtering (all
POIs shown)" — tức bây giờ map **luôn hiện tất cả POI** (chịu chi phối duy nhất
bởi cơ chế 3-tier zoom ở mục 4), không còn yêu cầu user phải bấm chọn category
trước khi thấy marker nào (trước đây `mapFilters` default là
`{place: false, ocop: false}` — cả 2 tắt — nên có khả năng trước khi user bấm nút
nào thì map trống trơn; giờ không còn tình trạng đó).

`backend/src/routes/poi.routes.ts` và `poi.service.ts` vẫn giữ nguyên khả năng lọc
`?categories=place,ocop` qua query string (không xóa, vì đó là backend capability
độc lập, không phải lỗi cần sửa — chỉ là frontend hiện không còn gọi với query đó
nữa do bỏ UI).

## 6. File map nhanh (mọi thứ đụng tới trong phiên này)

```
backend/
  src/
    config/poiTypeMapping.json          # bản copy, sync từ shared/, KHÔNG sửa tay
    services/poi.service.ts             # category_color_hex, raw_type, getPoiTier/isVisibleAtZoom (3-tier declutter)
    routes/poi.routes.ts                # không đổi, chỉ đọc để hiểu route
  tsconfig.json                         # + resolveJsonModule: true

frontend/
  src/
    features/map/
      config/
        mapCategoryConfig.ts            # resolvePoiStyle(), 2 bảng mapping (import từ poiTypeMapping.json)
        poiTypeMapping.json             # bản copy, sync từ shared/, KHÔNG sửa tay
      components/
        MapContainer.tsx                # setPOIsEnabled(false), resolvePoiStyle trong parserData, xóa hàm vẽ SVG cũ
        MapFilterBar.tsx                # ĐÃ XÓA
      index.ts                          # bỏ export MapFilterBar
    services/supabase/poi.service.ts    # POIData + category_color_hex, raw_type
    app/App.tsx                         # bỏ mapFilters state + MapFilterBar UI
  tsconfig.app.json                     # + resolveJsonModule: true

shared/
  poiTypeMapping.json                   # NGUỒN THẬT — sửa ở đây, không sửa 2 bản copy trên

scripts/
  sync-poi-type-mapping.js              # chạy: node scripts/sync-poi-type-mapping.js (từ repo root)

docs/session-notes/
  2026-08-11-poi-map-icon-styling.md    # chính file này
```

## 7. Việc chưa làm / có thể cần làm tiếp

- Xác nhận lại độ dày marker sau khi xóa UI filter — xem mục 4 "Việc còn dang
  dở". Rất có thể cần nâng `TIER_2_MIN_ZOOM`.
- Chưa test thật các giá trị còn lại trong `RAW_TYPE_TO_SDK_TYPE` (chỉ mới test
  `bridge`, `park`, `hospital`, `hotel`; `pharmacy` không rõ đã confirm hay
  chưa) — xem bảng ở mục 3.
- Chưa quyết định có tự động hoá sync `shared/poiTypeMapping.json` hay không (VD
  hook `predev`/`prebuild`) — hiện vẫn thủ công, user chưa trả lời câu hỏi này.
- Chưa viết unit test cho `resolvePoiStyle()` dù đã tách thành pure function dễ
  test (cố tình, vì frontend chưa có test runner — quyết định của user, không
  phải thiếu sót).
