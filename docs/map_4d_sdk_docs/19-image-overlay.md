## [Image Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay "Image Overlay")

Image Overlay là một loại overlay cho phép người dùng hiển thị một image lên trên map của Map4D trong một khu vực/vùng cụ thể gắn với kinh độ và vĩ độ.

## [Add Image overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=add-image-overlay)

Để thêm 1 image overlay vào map cần tạo mới 1 đối tượng của lớp [ImageOverlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/image-overlay?id=imageoverlay-class) sau đó set `map` cho image overlay đó.

Hàm khởi tạo của lớp [ImageOverlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/image-overlay?id=imageoverlay-class) nhận vào một đối tượng [ImageOverlayOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/image-overlay?id=imageoverlayoptions-interface) có các tham số như sau:

| **No** | **Property** | **Type**                                                                                            | **Requied** | **Description**                                                                                                                         |
| ------ | ------------ | --------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | url          | string                                                                                              | YES         | Đường dẫn url của image                                                                                                                 |
| 2      | bounds       | [ILatLngBounds](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlngbounds) | YES         | Vùng hiển thị của Image Overlay                                                                                                         |
| 3      | visible      | boolean                                                                                             | NO          | Nếu là `true` thì Image Overlay sẽ được hiển thị                                                                                        |
| 4      | zIndex       | number                                                                                              | NO          | Thứ tự hiển thị giữa các Image Overlay với nhau. Tất cả các Image overlay được hiển thị đè lên trên bản đồ và các điểm Place của bản đồ |
| 5      | opacity      | number                                                                                              | NO          | Độ trong suốt của Image Overlay. Có giá trị từ 0 đến 1                                                                                  |

### [Tạo mới Image Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=t%e1%ba%a1o-m%e1%bb%9bi-image-overlay)

```
let options = { url: `https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189`, bounds: [{lng: 108.214421, lat: 16.061733}, {lng: 108.23086738586424, lat: 16.075630202564316}], zIndex: 1 } let overlay = new map4d.ImageOverlay(options)
```



### [Add Image Overlay lên Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=add-image-overlay-l%c3%aan-map)

Để vẽ Image Overlay lên map, ta set map cho Image Overlay bằng hàm `setMap`

```
overlay.setMap(map)
```



### [Remove Image Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=remove-image-overlay)

Để xóa Image Overlay khỏi map, ta gọi hàm `setMap` và truyền vào giá trị `null`

```
overlay.setMap(null)
```



### [Ẩn/Hiện Image Overlay](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=%e1%ba%a8nhi%e1%bb%87n-image-overlay)

Gọi hàm `setVisible(boolean)` để ẩn/hiện Image Overlay.

```
overlay.setVisible(false)
```



### [Thay đổi opacity](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=thay-%c4%91%e1%bb%95i-opacity)

Gọi hàm `setOpacity(number)` để thay đổi giá trị opacity của image overlay. Chú ý: Giá trị opacity nằm trong khoảng từ 0 đến 1.

```
overlay.setOpacity(0.8)
```



## [References](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=references)

### [ImageOverlay class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=imageoverlay-class)

`map4d.ImageOverlay` class

Constructor

Tạo ImageOverlay với các options được chỉ định

```
ImageOverlay(options)
```



- Parameters:
  - options: [ImageOverlayOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/image-overlay?id=imageoverlayoptions-interface) *required*

Methods

| **Name**   | **Parameters**                                                                     | **Return Value** | **Description**                                                                          |
| ---------- | ---------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| setMap     | map: [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class) | none             | Hiển thị Image Overlay lên map, nếu set map là null thì Image Overlay sẽ bị xóa khỏi map |
| setVisible | visibility: boolean                                                                | none             | Ẩn/hiện Image Overlay trên map                                                           |
| isVisible  | none                                                                               | boolean          | Get trạng thái ẩn/hiện của Image Overlay                                                 |
| setOpacity | number                                                                             | none             | Set giá trị opacity cho overlay. Giá trị opacity từ 0 đến 1                              |
| getOpacity | none                                                                               | number           | Get giá trị opacity hiện tại của overlay                                                 |

### [ImageOverlayOptions interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/image-overlay?id=imageoverlayoptions-interface)

`map4d.ImageOverlayOptions` interface

Đối tượng ImageOverlayOptions đùng để xác định các thuộc tính dùng cho ImageOverlay.

Properties

| **Name**           | **Type**                                                                                            | **Description**                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| url *required*     | string                                                                                              | Đường dẫn url của Image                                                                                                                 |
| bounds *required*  | [ILatLngBounds](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlngbounds) | Vùng hiển thị Image Overlay                                                                                                             |
| visible *optional* | boolean                                                                                             | Nếu là `true` thì Image Overlay sẽ được hiển thị                                                                                        |
| zIndex *optional*  | number                                                                                              | Thứ tự hiển thị giữa các Image Overlay với nhau. Tất cả các Image overlay được hiển thị đè lên trên bản đồ và các điểm Place của bản đồ |
| opacity *optional* | number                                                                                              | Độ trong suốt của Image Overlay. Có giá trị từ 0 đến 1                                                                                  |
