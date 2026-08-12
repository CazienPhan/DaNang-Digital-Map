## [Building Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay "Building Overlay")

Building overlay là một loại overlay cho phép người dùng hiển thị các building từ nhiều nguồn khác nhau lên bản đồ, kết hợp với building sẵn có của Map4D.
Building overlay chỉ hiển thị ở chế độ 3D.

## [Add Building overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=add-building-overlay)

Để thêm 1 building overlay vào map cần tạo mới 1 đối tượng của lớp [BuildingOverlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/building-overlay?id=buildingverlay-class) sau đó set `map` cho building overlay đó.
Hàm khởi tạo của lớp [BuildingOverlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/building-overlay?id=buildingoverlay-class) nhận vào một đối tượng [BuildingOverlayOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/building-overlay?id=buildingoverlayoptions-interface) có các tham số như sau:

| **No** | **Property** | **Type** | **Requied** | **Description**                                                                                                                                                                          |
| ------ | ------------ | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | getUrl       | function | YES         | Hàm nhận vào 3 giá trị `x`, `y`, `zoom` và trả về đường dẫn đến Buildings                                                                                                                |
| 2      | parserData   | function | YES         | Hàm nhận vào response data từ api của `getUrl` và parser thành mảng các [BuildingData](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/building-overlay?id=buildingdata-interface) |
| 3      | prefixId     | string   | NO          | Giá trị được thêm vào trước id của những building thuộc building overlay.<br>Dùng để tránh nhầm lẫn trong trường hợp trùng id với building của Map4D hay các building overlay khác       |
| 4      | visible      | boolean  | NO          | Nếu `true` thì building overlay sẽ được hiển thị                                                                                                                                         |

### [Tạo mới Building overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=t%e1%ba%a1o-m%e1%bb%9bi-building-overlay)

```
let options = { getUrl: function (x, y, zoom) { return `rest-api-get-building-from-tile-coordinate` }, parserData: function(response) { let buildingDatas = [] /** * parser data from response ... */ return buildingDatas }, prefixId: "prefix" visible: true } let overlay = new map4d.BuildingOverlay(options)
```



### [Add Building overlay lên Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=add-building-overlay-l%c3%aan-map)

Để vẽ building overlay lên map, ta set map cho building overlay bằng hàm `setMap`

```
overlay.setMap(map)
```



### [Remove Building overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=remove-building-overlay)

Để xóa building overlay khỏi map, ta gọi hàm `setMap` và truyền vào giá trị `null`

```
overlay.setMap(null)
```



### [Ẩn/Hiện Building Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=%e1%ba%a8nhi%e1%bb%87n-building-overlay)

Gọi hàm `setVisible(boolean)` để ẩn/hiện building overlay.
Chú ý: Mặc dù building overlay không hiển thị nhưng quá trình tải các building vẫn diễn ra

```
overlay.setVisible(false)
```



## [Sự kiện đối với building thuộc building overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=s%e1%bb%b1-ki%e1%bb%87n-%c4%91%e1%bb%91i-v%e1%bb%9bi-building-thu%e1%bb%99c-building-overlay)

Các sự kiện đối với building thuộc building overlay phát sinh tương tự với building của Map4D, việc xử lý được diễn ra ngay tại hàm xử lý sự kiện của Map4D. Xem [Events](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events)

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=reference)

### [BuildingOverlay class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=buildingoverlay-class)

`map4d.BuildingOverlay` class

Constructor

Tạo BuildingOverlay với các options được chỉ định

```
BuildingOverlay(options)
```



- Parameters:
  - options: [BuildingOverlayOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/building-overlay?id=buildingoverlayoptions-interface) *required*

Methods

| **Name**    | **Parameters**                                                                     | **Return Value** | **Description**                                                                                |
| ----------- | ---------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| setMap      | map: [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class) | none             | Hiển thị building overlay lên map, nếu set map là null thì building overlay sẽ bị xóa khỏi map |
| setVisible  | visibility: boolean                                                                | none             | Ẩn/hiện building overlay trên map                                                              |
| isVisible   | none                                                                               | boolean          | Get trạng thái ẩn/hiện của overlay                                                             |
| getPrefixId | none                                                                               | string           | Get prefixId                                                                                   |

### [BuildingOverlayOptions interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=buildingoverlayoptions-interface)

`map4d.BuildingOverlayOptions` interface

Đối tượng BuildingOverlayOptions đùng để xác định các thuộc tính dùng cho BuildingOverlay.

Properties

| **Name**            | **Type** | **Description**                                                           |
| ------------------- | -------- | ------------------------------------------------------------------------- |
| getUrl *required*   | function | Hàm nhận vào 3 giá trị `x`, `y`, `zoom` và trả về đường dẫn đến Buildings |
| prefixId *optional* | string   | Giá trị được thêm vào trước id của những building thuộc overlay.          |
| visible *optional*  | boolean  | Nếu là `true` thì building overlay sẽ được hiển thị                       |

### [BuildingData interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building-overlay?id=buildingdata-interface)

`map4d.BuildingData` interface

Đối tượng BuildingData dùng để xác định các thuộc tính của building

Properties

| **Name**               | **Type**                                                                                    | **Description**                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| id *required*          | string                                                                                      | ID của building                                                                                                                             |
| name *required*        | string                                                                                      | Tên tuilding                                                                                                                                |
| position *required*    | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)     | Vị trí hiển thị building trên bản đồ                                                                                                        |
| model *optional*       | string                                                                                      | Đường dẫn URL để lấy dữ liệu model cho building                                                                                             |
| texture *optional*     | string                                                                                      | Đường dẫn URL để lấy dữ liệu texture cho building                                                                                           |
| coordinates *optional* | [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | Một mảng vị trí `ILatLng` để tạo một Building hình khối với mặt đáy của hình khối là mảng vị trí này. Kết hợp với `height` để tạo chiều cao |
| height *optional*      | number                                                                                      | Chiều cao của building (đơn vị: mét)                                                                                                        |
| scale *optional*       | number                                                                                      | Tỉ lệ hiển thị của building so với kích thước thực tế                                                                                       |
| bearing *optional*     | number                                                                                      | Góc quay của building khi được vẽ ra trên bản đồ (đơn vị: độ)                                                                               |
| elevation *optional*   | number                                                                                      | Độ cao của building so với mực nước biển (đơn vị: mét)                                                                                      |
| startDate *optional*   | number                                                                                      | Ngày bắt đầu hiển thị building                                                                                                              |
| endDate *optional*     | number                                                                                      | Ngày kết thúc hiển thị building                                                                                                             |

Chú ý:

- Trường hợp dùng `model` nhưng `texture` là *`null`* thì building sẽ được tô màu trắng.
- Trường hợp dùng `model` thì sẽ không dùng đến thuộc tính `coordinates`. Nếu set giá trị cho `coordinates` và cả `model` đồng thời thì sẽ ưu tiên lấy giá trị của `model` để tạo Building
