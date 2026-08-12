## [Map Types](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-types "Map Types")

Map4D Web SDK cho phép tùy chỉnh kiểu hiển thị của bản đồ.

### [Các loại bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-types?id=c%c3%a1c-lo%e1%ba%a1i-b%e1%ba%a3n-%c4%91%e1%bb%93)

Map4D Web SDK hiện cung cấp 3 loại bản đồ tùy chỉnh thông qua đối tượng `map4d.MapType` như bên dưới:

| **No.** | **Name**  | **Description**                                                                                                                                                                             |
| ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | ROADMAP   | Giá trị:`map4d.MapType.roadmap` hoặc `"roadmap"`<br>Các thành phần của bản đồ được vẽ dưới dạng các đường nét và hình khối, có độ phân giải cao<br>Đây là bản đồ mặc định của Map4D Web SDK |
| 2       | SATELLITE | Giá trị:`map4d.MapType.satellite` hoặc `"satellite"`<br>Bản đồ hiển thị dưới dạng hình ảnh vệ tinh, không bao gồm đường sá, địa điểm                                                        |
| 3       | HYBRID    | Giá trị:`map4d.MapType.hybrid` hoặc `"hybrid"`<br>Bản đồ hiển thị dưới dạng hình ảnh vệ tinh, bao gồm thông tin đường sá, địa điểm                                                          |

### [Thiết lập kiểu bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-types?id=thi%e1%ba%bft-l%e1%ba%adp-ki%e1%bb%83u-b%e1%ba%a3n-%c4%91%e1%bb%93)

#### [Thiết lập khi khởi tạo bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-types?id=thi%e1%ba%bft-l%e1%ba%adp-khi-kh%e1%bb%9fi-t%e1%ba%a1o-b%e1%ba%a3n-%c4%91%e1%bb%93)

Khi khởi tạo đối tượng bản đồ map4d, có thể set giá trị `mapType` trong [map options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-options) để quy định kiểu bản đồ hiển thị ban đầu.

Ví dụ: khởi tạo bản đồ với type map là satellite:

```
function initMap() { let options = { center: {lat: 16.072163491469226, lng: 108.22690536081757}, zoom: 15, mapType: "satellite" } let map = new map4d.Map(document.getElementById("map"), options) }
```




#### [Thay đổi kiểu bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-types?id=thay-%c4%91%e1%bb%95i-ki%e1%bb%83u-b%e1%ba%a3n-%c4%91%e1%bb%93)

Để thay kiểu bản đồ, ta gọi hàm `setMapType(mapType: IMapType)` thông qua đối tượng `map4d.Map`

Ví dụ:

#### [Get kiểu bản đồ hiện tại](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-types?id=get-ki%e1%bb%83u-b%e1%ba%a3n-%c4%91%e1%bb%93-hi%e1%bb%87n-t%e1%ba%a1i)

Để get kiểu bản đồ hiện tại ta có thể gọi hàm `getMapType()` thông qua đối tượng `map4d.Map`. Giá trị trả về sẽ là một kiểu của `map4d.MapType`

```
map.getMapType()
```

## [IMapType](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=imaptype)

`map4d.IMapType` type

```
type IMapType = MapType | string
```




## [MapsEventListener interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=mapseventlistener-interface)

Định nghĩa interface lắng nghe sự kiện trên Map.

`map4d.MapsEventListener` interface

```
interface MapsEventListener { remove(): void updateEventOptions(options: EventOptions): void }
```
