## [Tile Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay "Tile Overlay")

Tile Overlay là một loại overlay cho phép người dùng hiển thị các tile map khác nhau từ nhiều nguồn khác nhau lên trên tile map có sẵn của Map4D

## [Add Tile overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=add-tile-overlay)

Để thêm 1 tile overlay vào map cần tạo mới 1 đối tượng của lớp [TileOverlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/tile-overlay?id=tileoverlay-class) sau đó set `map` cho tile overlay đó.

Hàm khởi tạo của lớp [TileOverlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/tile-overlay?id=tileoverlay-class) nhận vào một đối tượng [TileOverlayOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/tile-overlay?id=tileoverlayoptions-interface) có các tham số như sau:

| **No** | **Property** | **Type** | **Requied** | **Description**                                                          |
| ------ | ------------ | -------- | ----------- | ------------------------------------------------------------------------ |
| 1      | getUrl       | function | YES         | Hàm nhận vào 3 giá trị `x`, `y`, `zoom` và trả về đường dẫn đến map tile |
| 2      | visible      | boolean  | NO          | Nếu là `true` thì tile overlay sẽ được hiển thị                          |
| 3      | zIndex       | number   | NO          | Thứ tự hiển thị                                                          |
| 4      | opacity      | number   | NO          | Độ trong suốt của tile overlay. Có giá trị từ 0 đến 1                    |

### [Tạo mới Tile overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=t%e1%ba%a1o-m%e1%bb%9bi-tile-overlay)

```
let options = { getUrl: function (x, y, zoom) { return `https://tile.openstreetmap.de/${zoom}/${x}/${y}.png` }, visible: true, zIndex: 1 } let overlay = new map4d.TileOverlay(options)
```



### [Add tile overlay lên Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=add-tile-overlay-l%c3%aan-map)

Để vẽ Tile overlay lên map, ta set map cho tile overlay bằng hàm `setMap`

```
overlay.setMap(map)
```



### [Remove tile overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=remove-tile-overlay)

Để xóa Tile overlay khỏi map, ta gọi hàm `setMap` và truyền vào giá trị `null`

```
overlay.setMap(null)
```



### [Thay đổi zIndex](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=thay-%c4%91%e1%bb%95i-zindex)

Gọi hàm `setZIndex(number)` để thay đổi giá trị zIndex của tile overlay

```
overlay.setZIndex(10)
```



### [Ẩn/Hiện Tile Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=%e1%ba%a8nhi%e1%bb%87n-tile-overlay)

Gọi hàm `setVisible(boolean)` để ẩn/hiện tile overlay.
Chú ý: Mặc dù tile overlay không hiển thị nhưng quá trình tải các tile vẫn diễn ra

```
overlay.setVisible(false)
```



### [Thay đổi opacity](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=thay-%c4%91%e1%bb%95i-opacity)

Gọi hàm `setOpacity(number)` để thay đổi giá trị opacity của tile overlay. Chú ý: Giá trị opacity nằm trong khoảng từ 0 đến 1.

```
overlay.setOpacity(0.8)
```



## [References](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=references)

### [TileOverlay class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=tileoverlay-class)

`map4d.TileOverlay` class

Constructor

Tạo TileOverlay với các options được chỉ định

```
TileOverlay(options)
```



- Parameters:
  - options: [TileOverlayOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/tile-overlay?id=tileoverlayoptions-interface) *required*

Methods

| **Name**   | **Parameters**                                                                     | **Return Value** | **Description**                                                                        |
| ---------- | ---------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------- |
| setMap     | map: [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class) | none             | Hiển thị tile overlay lên map, nếu set map là null thì tile overlay sẽ bị xóa khỏi map |
| setVisible | visibility: boolean                                                                | none             | Ẩn/hiện tile overlay trên map                                                          |
| isVisible  | none                                                                               | boolean          | Get trạng thái ẩn/hiện của overlay                                                     |
| setZIndex  | zIndex: number                                                                     | none             | Set giá trị zIndex                                                                     |
| getZIndex  | none                                                                               | number           | Get giá trị zIndex hiện tại của overlay                                                |
| setOpacity | number                                                                             | none             | Set giá trị opacity cho overlay. Giá trị opacity từ 0 đến 1                            |
| getOpacity | none                                                                               | number           | Get giá trị opacity hiện tại của overlay                                               |

### [TileOverlayOptions interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/tile-overlay?id=tileoverlayoptions-interface)

`map4d.TileOverlayOptions` interface

Đối tượng TileOverlayOptions đùng để xác định các thuộc tính dùng cho TileOverlay.

Properties

| **Name**           | **Type** | **Description**                                                                                                                                                      |
| ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| getUrl *required*  | function | Hàm nhận vào 4 giá trị `x`, `y`, `zoom` và trả về đường dẫn đến map tile                                                                                             |
| visible *optional* | boolean  | Nếu là `true` thì tile overlay sẽ được hiển thị                                                                                                                      |
| zIndex *optional*  | number   | Tất cả các tile overlay được hiển thị trên bản đồ theo thứ tự zIndex của chúng,<br>với các giá trị cao hơn hiển thị phía trước các tile overlay có giá trị thấp hơn. |
| opacity *optional* | number   | Độ trong suốt của tile overlay. Có giá trị từ 0 đến 1                                                                                                                |
