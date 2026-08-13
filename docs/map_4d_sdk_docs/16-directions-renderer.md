## [Directions Renderer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer "Directions Renderer")

Để vẽ chỉ đường giữa các địa điểm trên Map thì ta sử dụng đối tượng Directions Renderer thay cho việc vẽ nhiều Polyline một cách thủ công.

### [1. Thêm một Directions Renderer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer?id=_1-th%c3%aam-m%e1%bb%99t-directions-renderer)

Hàm khởi tạo của lớp map4d.DirectionsRenderer cần truyền vào một đối tượng map4d.DirectionsRendererOptions để xác định các thuộc tính ban đầu của DirectionsRenderer.

Các đối tượng DirectionsRenderer sẽ vẽ các polyline thẳng trên bản đồ dựa theo các route mà bạn truyền vào thông qua tham số routes hoặc tham số directions trong đối tượng DirectionsRendererOptions. Ngoài ra bạn cũng có thể chỉ định nhiều thuộc tính khác như màu sắc, độ rộng, outline ... thông qua đối tượng DirectionsRendererOptions.

Đối tượng DirectionsRendererOptions được định nghĩa như sau:

```
interface DirectionsRendererOptions { routes?: string | RouteOptions | ILatLng[][] activedIndex?: number activeStrokeWidth?: number activeStrokeColor?: string activeOutlineWidth?: number activeOutlineColor?: string activeStrokePattern?: PatternItem inactiveStrokeWidth?: number inactiveStrokeColor?: string inactiveOutlineWidth?: number inactiveOutlineColor?: string inactiveStrokePattern?: PatternItem originMarkerOptions?: MarkerOptions destinationMarkerOptions?: MarkerOptions waypointMarkerOptions?: MarkerOptions[] onMarkerDragEnd?: Function }
```



Các thuộc tính của DirectionsRendererOptions :

- routes (tùy chọn): truyền vào một mảng 2 chiều các tọa độ ILatLng hoặc dữ liệu Route bằng JSON string trả về từ [Map4D SDK API Route](https://docs-cdtqg.map4d.vn/map4d-service/api/v1.1/#/api_route) hoặc một đối tượng [RouteOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/directions-renderer?id=routeoptions) để tạo Directions Renderer.
- activedIndex (tùy chọn): chỉ định index cho route được active trong Directions Renderer.
- activeStrokeWidth (tùy chọn): chỉ định độ rộng của active line theo đơn vị point.
- activeStrokeColor (tùy chọn): chỉ định màu sắc của active line theo mã HEX (ví dụ "#FF0000").
- activeOutlineWidth (tùy chọn): chỉ định độ rộng của active outline theo đơn vị point.
- activeOutlineColor (tùy chọn): chỉ định màu sắc của active outline theo mã HEX (ví dụ "#FF0000").
- activeStrokePattern (tùy chọn): chỉ định pattern của active line. Tương tự như [pattern của Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_4-t%e1%ba%a1o-m%e1%bb%99t-polyline-s%e1%bb%ad-d%e1%bb%a5ng-pattern)
- inactiveStrokeWidth (tùy chọn): chỉ định độ rộng của inactive line theo đơn vị point.
- inactiveStrokeColor (tùy chọn): chỉ định màu sắc của inactive line theo mã HEX (ví dụ "#FF0000").
- inactiveOutlineWidth (tùy chọn): chỉ định độ rộng của inactive outline theo đơn vị point.
- inactiveOutlineColor (tùy chọn): chỉ định màu sắc của inactive outline theo mã HEX (ví dụ "#FF0000").
- inactiveStrokePattern (tùy chọn): chỉ định pattern của inactive outline. Tương tự như [pattern của Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_4-t%e1%ba%a1o-m%e1%bb%99t-polyline-s%e1%bb%ad-d%e1%bb%a5ng-pattern)
- originMarkerOptions (tùy chọn): chỉ định các options cho marker bắt đầu.
- destinationMarkerOptions (tùy chọn): chỉ định các options cho marker kết thúc.
- waypointMarkerOptions (tùy chọn): là mảng marker option chỉ định các marker waypoint. Các marker waypoint này có vị trí nằm ngoài route Chú ý: Để có đường polyline nối marker waypoint với routes thì routes phải chứa các điểm waypoint. Muốn vậy thì chúng ta phải set routes bằng JSON string hoặc RouteOptions. Trường hợp set routes bằng JSON string thì Map4D SDK tự nhận được các điểm waypoint này. Xem chi tiết ở các ví dụ bên dưới.
- onMarkerDragEnd (tùy chọn): chỉ định options callback sau khi thực hiện việc kéo Marker. Callback được gọi với tham số `args` là đối tượng chứa tọa độ LatLng của các Marker trong Directions Renderer.

Ví dụ sau đây sẽ thêm một Directions Renderer vào bản đồ với routes là mảng hai chiều các tọa độ `ILatLng`:

Thêm một Directions Renderer vào bản đồ với routes là JSON String trả về từ [Map4D SDK API Route](https://docs-cdtqg.map4d.vn/map4d-service/api/v1.1/#/api_route). Route này có chứa 2 điểm waypoint:

Ví dụ tiếp theo là chúng ta sẽ thêm một Directions Renderer vào bản đồ với một đối tượng `RouteOptions` với 2 điểm waypoint:

### [2. Xóa Directions Renderer khỏi bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer?id=_2-x%c3%b3a-directions-renderer-kh%e1%bb%8fi-b%e1%ba%a3n-%c4%91%e1%bb%93)

Để xóa một Directions Renderer ra khỏi bản đồ, hãy gọi phương thức setMap() và truyền vào tham số null

```
directionsRenderer.setMap(null)
```



Lưu ý rằng cách trên không xóa Directions Renderer. Nó chỉ remove Directions Renderer ra khỏi bản đồ. Nếu bạn muốn xóa Directions Renderer, bạn nên remove nó khỏi bản đồ, sau đó bạn gán directionsRenderer bằng null.

### [3. Các sự kiện trên Directions Renderer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer?id=_3-c%c3%a1c-s%e1%bb%b1-ki%e1%bb%87n-tr%c3%aan-directions-renderer)

Để lắng nghe các sự kiện xảy ra trên Directions Renderer, bạn hãy dùng phương thức addListener() của lớp Map với tham số EventOptions là đối tượng {directions: true}.

Các sự kiện có thể lắng nghe trên Directions Renderer là: click, dblClick, longClick, rightClick, hover

Mô tả các sự kiện này tương tự như mô tả của Map Event. Các bạn có thể tham khảo [tại đây](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events)

Ví dụ để lắng nghe sự kiện click cho Directions Renderer ta thực hiện như sau:

```
let clickEvent = map.addListener("click", (args) => { console.log("Directions Renderer clicked: ") let directionsRenderer = args.renderer directionsRenderer.setActivedIndex(args.routeIndex) }, {directions: true})
```



Tham số args trả về khi có sự kiện xảy ra sẽ bao gồm các thông tin chính như sau:

- renderer: là đối tượng Directions Renderer mà người dùng click.
- routeIndex: là index của route được người dùng click
- location: là tọa độ click trên bản đồ theo latitude và longitude.
- pixel: là tọa độ pixel mà người dùng click trên màn hình.

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer?id=reference)

### [Directions Renderer Class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer?id=directions-renderer-class)

`map4d.DirectionsRenderer` class

Constructor

Tạo DirectionsRenderer với các options được chỉ định

```
DirectionsRenderer(options)
```



- Parameters:
  - options: [DirectionsRendererOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/directions-renderer?id=directionsrenderer-options) *required*

Methods

| **Name**                 | **Parameters**                                                                                                                                                                                                         | **Return Value**                                                                          | **Description**                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| setOptions               | [DirectionsRendererOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/directions-renderer?id=directionsrenderer-options)                                                                                   | none                                                                                      | Set options dùng để xác định các thuộc tính dùng cho DirectionsRenderer                                                                                                                                                                                                                                                                          |
| setMap                   | [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)                                                                                                                                          | none                                                                                      | Thêm Directions Renderer vào map, nếu set map là null thì Directions Renderer sẽ bị xóa khỏi map                                                                                                                                                                                                                                                 |
| getMap                   | none                                                                                                                                                                                                                   | Map                                                                                       | Lấy đối tượng map mà Directions Renderer được thêm vào                                                                                                                                                                                                                                                                                           |
| setRoutes                | string `or` [RouteOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/directions-renderer?id=routeoptions) `or` [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)[][] | none                                                                                      | Set các routes cho Directions Renderer bằng một mảng 2 chiều các tọa độ ILatLng hoặc dữ liệu Route bằng JSON string trả về từ [Map4D SDK API Route](https://docs-cdtqg.map4d.vn/map4d-service/api/v1.1/#/api_route) hoặc một đối tượng [RouteOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/directions-renderer?id=routeoptions) |
| getRoutes                | none                                                                                                                                                                                                                   | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng)[][] | Get mảng tạo độ các routes của Directions Renderer                                                                                                                                                                                                                                                                                               |
| setActivedIndex          | number                                                                                                                                                                                                                 | none                                                                                      | Set index của route muốn active trong Directions Renderer                                                                                                                                                                                                                                                                                        |
| getActivedIndex          | none                                                                                                                                                                                                                   | number                                                                                    | Get index của route đang active trong Directions Renderer                                                                                                                                                                                                                                                                                        |
| setActiveStrokePattern   | [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)                                                                                                                                | none                                                                                      | Set pattern cho active line trong Directions Renderer. Tương tự như [pattern của Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_4-t%e1%ba%a1o-m%e1%bb%99t-polyline-s%e1%bb%ad-d%e1%bb%a5ng-pattern)                                                                                                                   |
| setInactiveStrokePattern | [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)                                                                                                                                | none                                                                                      | Set pattern cho inactive line trong Directions Renderer. Tương tự như [pattern của Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_4-t%e1%ba%a1o-m%e1%bb%99t-polyline-s%e1%bb%ad-d%e1%bb%a5ng-pattern)                                                                                                                 |

### [DirectionsRenderer Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer?id=directionsrenderer-options)

`map4d.DirectionsRendererOptions` interface

Đối tượng DirectionsRendererOptions dùng để xác định các thuộc tính dùng cho DirectionsRenderer.

Properties

| **Name**                            | **Type**                                                                                                                                                                                                               | **Description**                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| routes *optional*                   | string `or` [RouteOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/directions-renderer?id=routeoptions) `or` [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)[][] | truyền vào một mảng 2 chiều các tọa độ ILatLng hoặc dữ liệu Route bằng JSON string trả về từ [Map4D SDK API Route](https://docs-cdtqg.map4d.vn/map4d-service/api/v1.1/#/api_route) hoặc một đối tượng [RouteOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/directions-renderer?id=routeoptions) để tạo Directions Renderer. |
| activedIndex *optional*             | number                                                                                                                                                                                                                 | chỉ định index cho route được active trong Directions Renderer.                                                                                                                                                                                                                                                                             |
| activeStrokeWidth *optional*        | number                                                                                                                                                                                                                 | chỉ định độ rộng của active line theo đơn vị point.                                                                                                                                                                                                                                                                                         |
| activeStrokeColor *optional*        | string                                                                                                                                                                                                                 | chỉ định màu sắc của active line theo mã HEX (ví dụ "#FF0000").                                                                                                                                                                                                                                                                             |
| activeStrokePattern *optional*      | [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)                                                                                                                                | chỉ định pattern của active line. Tương tự như [pattern của Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_4-t%e1%ba%a1o-m%e1%bb%99t-polyline-s%e1%bb%ad-d%e1%bb%a5ng-pattern)                                                                                                                                   |
| activeOutlineWidth *optional*       | number                                                                                                                                                                                                                 | chỉ định độ rộng của active outline theo đơn vị point.                                                                                                                                                                                                                                                                                      |
| activeOutlineColor *optional*       | string                                                                                                                                                                                                                 | chỉ định màu sắc của active outline theo mã HEX (ví dụ "#FF0000").                                                                                                                                                                                                                                                                          |
| inactiveStrokeWidth *optional*      | number                                                                                                                                                                                                                 | chỉ định độ rộng của inactive line theo đơn vị point.                                                                                                                                                                                                                                                                                       |
| inactiveStrokeColor *optional*      | string                                                                                                                                                                                                                 | chỉ định màu sắc của inactive line theo mã HEX (ví dụ "#FF0000").                                                                                                                                                                                                                                                                           |
| inactiveOutlineWidth *optional*     | number                                                                                                                                                                                                                 | chỉ định độ rộng của inactive outline theo đơn vị point.                                                                                                                                                                                                                                                                                    |
| inactiveOutlineColor *optional*     | string                                                                                                                                                                                                                 | chỉ định màu sắc của inactive outline theo mã HEX (ví dụ "#FF0000").                                                                                                                                                                                                                                                                        |
| inactiveOutlinePattern *optional*   | [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)                                                                                                                                | chỉ định pattern của inactive outline. Tương tự như [pattern của Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_4-t%e1%ba%a1o-m%e1%bb%99t-polyline-s%e1%bb%ad-d%e1%bb%a5ng-pattern)                                                                                                                              |
| originMarkerOptions *optional*      | [MarkerOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/marker?id=marker-options)                                                                                                                        | chỉ định các options cho marker bắt đầu                                                                                                                                                                                                                                                                                                     |
| destinationMarkerOptions *optional* | [MarkerOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/marker?id=marker-options)                                                                                                                        | chỉ định các options cho marker kết thúc                                                                                                                                                                                                                                                                                                    |
| waypointMarkerOptions *optional*    | [MarkerOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/marker?id=marker-options)[]                                                                                                                      | chỉ định mảng options cho các marker waypoint. Chú ý: Để có đường polyline nối marker waypoint với route trong trường hợp route có waypoint thì bắt buộc chúng ta phải set route bằng JSON hoặc đối tượng RouteOptions                                                                                                                      |
| onMarkerDragEnd *optional*          | Function                                                                                                                                                                                                               | chỉ định options callback sau khi thực hiện việc kéo Marker, callback được gọi với tham số `args` là đối tượng chứa tọa độ LatLng của các Marker trong Directions Renderer.                                                                                                                                                                 |

### [RouteOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/directions-renderer?id=routeoptions)

`map4d.RouteOptions` interface

Đối tượng RouteOptions dùng để xác định các thuộc tính dùng cho routes (các tuyến đường đi từ vị trí này đến vị trí khác trên bản đồ)

Properties

| **Name**             | **Type**                                                                                    | **Description**                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| paths *required*     | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)[][] | truyền vào một mảng 2 chiều các tọa độ ILatLng chứa các route. Mỗi mảng một chiều tương ứng là một route |
| waypoints *optional* | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)[]   | truyền vào mảng 1 chiều tọa độ của các điểm waypoint (các điểm waypoint này nằm ở trên route)            |
