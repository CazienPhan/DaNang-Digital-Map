## [Map Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-options "Map Options")

Map options là một object [MapOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=mapoptions-interface) cung cấp các thiết lập ban đầu để khởi tạo đối tượng Map4D.
Bao gồm:

| **No** | **Name**            | **Type**                                                                                            | **Default Value** | **Description**                                                                                                           |
| ------ | ------------------- | --------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1      | center              | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)             | [0, 0]            | Vị trí hiển thị ban đầu của map                                                                                           |
| 2      | zoom                | number                                                                                              | 12                | Mức zoom hiển thị ban đầu của map                                                                                         |
| 3      | tilt                | number                                                                                              | 0                 | Độ nghiên hiển thị ban đầu của map                                                                                        |
| 4      | bearing             | number                                                                                              | 0                 | Góc xoay hiển thị ban đầu của map                                                                                         |
| 5      | controls            | boolean                                                                                             | false             | Cho phép hiện/ẩn bảng điều khiển *(zoom, direction, 3D button)*                                                           |
| 6      | controlOptions      | [ControlOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=controloptions-enum)  | BOTTOM\_RIGHT     | Vị trí hiển thị của bảng điều khiển                                                                                       |
| 7      | geolocate           | boolean                                                                                             | false             | Hiện/ẩn chức năng lấy vị trí hiện tại của người dùng                                                                      |
| 8      | minZoom             | number                                                                                              | 0                 | Thiết lập mức zoom nhỏ nhất mà map được hiển thị                                                                          |
| 9      | maxZoom             | number                                                                                              | 22                | Thiết lập mức zoom cao nhất mà map được hiển thị                                                                          |
| 10     | maxNativeZoom       | number                                                                                              | 19                | Giới hạn mức zoom cao nhất của Tile mà map request từ server                                                              |
| 11     | restrictionBounds   | [ILatLngBounds](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlngbounds) | null              | Giới hạn vùng hiển thị, di chuyển của map                                                                                 |
| 12     | mapType             | [IMapType](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=imaptype)                   | "roadmap"         | Xác định [kiểu của bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-types)                                  |
| 13     | cooperativeGestures | boolean                                                                                             | false             | Hỗ trợ cử chỉ hợp tác, `true` thì chỉ cho phép zoom map khi dùng ctrl + cuộn hoặc kéo map bằng 2 ngón tay                 |
| 14     | keyboardShortcuts   | boolean                                                                                             | true              | Hỗ trợ điều khiển bằng bàn phím (keyboard), `false` ngăn điều khiển bản đồ bằng bàn phím. Phím tắt được bật theo mặc định |

## [MapOptions interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=mapoptions-interface)

`map4d.MapOptions` interface

Đối tượng MapOptions dùng để xác định các thuộc tính dùng cho Map. [Chi tiết](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-options?id=map-options)

```
interface MapOptions { center?: ILatLng zoom?: number minZoom?: number maxZoom?: number maxNativeZoom?: number, geolocate?: boolean accessKey?: string tilt?: number, bearing?: number, controls?: boolean, controlOptions?: ControlOptions, restrictionBounds?: ILatLngBounds, mapType?: IMapType, cooperativeGestures?: boolean }
```
