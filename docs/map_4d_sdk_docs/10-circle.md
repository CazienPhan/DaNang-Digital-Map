## [Circle](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle "Circle")

Nếu bạn muốn vẽ một hình tròn lên bản đồ, thì Map4D SDK cung cấp cho bạn lớp map4d.Circle để thực hiện điều đó.

### [1. Thêm một Circle](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle?id=_1-th%c3%aam-m%e1%bb%99t-circle)

Để tạo một đối tượng Circle bạn cần truyền một đối tượng map4d.CircleOptions vào hàm khởi tạo của lớp map4d.Circle. Đối tượng CircleOptions này chứa các thông tin về tọa độ tâm, màu sắc, bán kính, độ trong suốt và đường viền cũng như màu đường viền của Circle.

Đối tượng CircleOptions được định nghĩa như sau:

```
interface CircleOptions { center: ILatLng radius: number fillColor?: string fillOpacity?: number visible?: boolean strokeColor?: string strokeWidth?: number draggable?: boolean zIndex?: number elevation?: number clickable?: boolean }
```



Các thuộc tính của CircleOptions :

- center (bắt buộc): một điểm tọa độ ILatLng để xác định tâm của Circle.
- radius (bắt buộc): chỉ định bán kính của Circle theo đơn vị mét.
- fillColor (tùy chọn): chỉ định màu sắc của Circle theo mã HEX (ví dụ "#FF0000"). Giá trị mặc định là "#0000FF".
- fillOpacity (tùy chọn): chỉ định độ trong suốt màu của Circle, khoảng giá trị của nó nằm trong khoảng từ 0.0 đến 1.0. Giá trị mặc định là 1.
- visible (tùy chọn): xác định Circle có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.
- strokeColor (tùy chọn): chỉ định màu sắc của đường viền Circle theo mã HEX (ví dụ "#FF0000"). Giá trị mặc định là "#00FF00".
- strokeWidth (tùy chọn): chỉ định độ lớn của đường viền Circle theo đơn vị point.
- draggable (tùy chọn): cho phép người dùng có thể kéo Circle trên bản đồ hay không. Giá trị mặc định là false.
- zIndex (tùy chọn): chỉ định thứ tự chồng nhau giữa các Circle với nhau hoặc giữa Circle với các đối tượng khác trên bản đồ. Giá trị mặc định là 0.
- elevation (tùy chọn): chỉ định độ cao của Circle so với mực nước biển, đơn vị là mét. Giá trị mặc định là 0
- clickable (tùy chọn): cho phép người dùng có thể tương tác được với Circle hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với Circle thì tất cả các sự kiện liên quan tới Circle từ phía người dùng sẽ không có tác dụng.

Ví dụ sau đây sẽ thêm một Circle vào bản đồ:

### [2. Xóa Circle khỏi bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle?id=_2-x%c3%b3a-circle-kh%e1%bb%8fi-b%e1%ba%a3n-%c4%91%e1%bb%93)

Để xóa một Circle ra khỏi bản đồ, hãy gọi phương thức setMap() và truyền vào tham số null

```
circle.setMap(null)
```



Lưu ý rằng cách trên không xóa Circle. Nó chỉ xóa Circle ra khỏi bản đồ. Nếu bạn muốn xóa Circle, bạn nên xóa nó khỏi bản đồ, sau đó bạn gán circle bằng null.

### [3. Tạo một Circle có thể kéo được trên bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle?id=_3-t%e1%ba%a1o-m%e1%bb%99t-circle-c%c3%b3-th%e1%bb%83-k%c3%a9o-%c4%91%c6%b0%e1%bb%a3c-tr%c3%aan-b%e1%ba%a3n-%c4%91%e1%bb%93)

Bạn có thể cho người dùng kéo Circle từ vị trí này đến vị trí khác trên bản đồ bằng cách chỉ định thuộc tính draggable bằng true ở trong CircleOptions khi tạo Circle

Ngoài ra bạn có thể gọi phương thức setDraggable() của đối tượng Circle và truyền vào tham số true để bật tính năng draggable của Circle hoặc truyền vào tham số false để tắt tính năng draggable.

### [4. Các sự kiện trên Circle](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle?id=_4-c%c3%a1c-s%e1%bb%b1-ki%e1%bb%87n-tr%c3%aan-circle)

Để lắng nghe các sự kiện xảy ra trên Circle, bạn hãy dùng phương thức addListener() của lớp Map với tham số EventOptions là đối tượng {circle: true}.

Các sự kiện có thể lắng nghe trên Polyline là: click, dblClick, longClick, rightClick, hover, drag, dragStart, dragEnd

Mô tả các sự kiện này tương tự như mô tả của Map Event. Các bạn có thể tham khảo [tại đây](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events)

Ví dụ để lắng nghe sự kiện click cho Circle ta thực hiện như sau:

```
let clickEvent = map.addListener("click", (args) => { console.log("Circle clicked: ") console.log(args) }, {circle: true})
```



Tham số args trả về khi có sự kiện xảy ra sẽ bao gồm các thông tin chính như sau:

- circle: là đối tượng circle mà người dùng click.
- location: là tọa độ click trên bản đồ theo latitude và longitude.
- pixel: là tọa độ pixel mà người dùng click trên màn hình.

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle?id=reference)

### [Circle Class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle?id=circle-class)

`map4d.Circle` class

Constructor

Tạo Circle với các options được chỉ định

```
Circle(options)
```



- Parameters:
  - options: [CircleOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/circle?id=circle-options) *required*

Methods

| **Name**       | **Parameters**                                                                          | **Return Value**                                                                      | **Description**                                                        |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| setMap         | [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)           | none                                                                                  | Thêm circle vào map, nếu set map là null thì circle sẽ bị xóa khỏi map |
| getMap         | none                                                                                    | Map                                                                                   | Lấy đối tượng map mà circle được thêm vào                              |
| setCenter      | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | none                                                                                  | Set tạo độ tâm cho circle                                              |
| getCenter      | none                                                                                    | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) | Get tọa độ tâm của circle                                              |
| setRadius      | number                                                                                  | none                                                                                  | Set bán kính cho circle theo đơn vị là mét                             |
| getRadius      | none                                                                                    | number                                                                                | Get bán kính của circle theo đơn vị là mét                             |
| setFillColor   | string                                                                                  | none                                                                                  | Set màu cho circle theo mã HEX (ví dụ: "#0F4DA9")                      |
| getFillColor   | none                                                                                    | string                                                                                | Get màu của circle                                                     |
| setFillOpacity | number                                                                                  | none                                                                                  | Set độ trong suốt cho màu của circle (giá trị từ 0.0 đến 1.0)          |
| getFillOpacity | none                                                                                    | number                                                                                | Get độ trong suốt của circle                                           |
| setStrokeColor | string                                                                                  | none                                                                                  | Set màu cho circle theo mã HEX (ví dụ: "#0F4DA9")                      |
| getStrokeColor | none                                                                                    | string                                                                                | Get màu của circle                                                     |
| setStrokeWidth | number                                                                                  | none                                                                                  | Set độ rộng cho đường viền của circle                                  |
| getStrokeWidth | none                                                                                    | number                                                                                | Get độ rộng cho đường viền của circle                                  |
| setVisible     | boolean                                                                                 | none                                                                                  | Ẩn/hiện circle trên map                                                |
| isVisible      | none                                                                                    | boolean                                                                               | Get trạng thái ẩn/hiện của circle                                      |
| setZIndex      | number                                                                                  | none                                                                                  | Set giá trị zIndex cho circle                                          |
| getZIndex      | none                                                                                    | number                                                                                | Get giá trị zIndex hiện tại của circle                                 |
| setElevation   | number                                                                                  | none                                                                                  | Set giá trị độ cao cho circle theo đơn vị mét                          |
| getElevation   | none                                                                                    | number                                                                                | Get giá trị độ cao của circle                                          |
| setDraggable   | boolean                                                                                 | none                                                                                  | Cho phép circle có được kéo trên bản đồ hay không                      |
| isDraggable    | none                                                                                    | boolean                                                                               | Kiểm tra xem circle có thể kéo trên bản đồ hay không                   |
| getUserData    | none                                                                                    | any                                                                                   | Set dữ liệu riêng mà người dùng muốn cho circle                        |
| setUserData    | any                                                                                     | none                                                                                  | Get dữ liệu riêng mà người dùng đã set cho circle                      |
| isClickable    | none                                                                                    | boolean                                                                               | Kiểm tra circle có thể tương tác bởi người dùng hay không              |
| setClickable   | boolean                                                                                 | none                                                                                  | Cho phép circle có thể tương tác bởi người dùng hay không              |

### [Circle Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle?id=circle-options)

`map4d.CircleOptions` interface

Đối tượng CircleOptions dùng để xác định các thuộc tính dùng cho Circle.

Properties

| **Name**               | **Type**                                                                                | **Description**                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| center *required*      | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | một điểm tọa độ ILatLng để xác định tâm của Circle.                                                                                                                                                                               |
| radius *required*      | number                                                                                  | chỉ định bán kính của Circle theo đơn vị mét.                                                                                                                                                                                     |
| fillColor *optional*   | string                                                                                  | chỉ định màu sắc của Circle theo mã HEX (ví dụ "#FF0000"). Giá trị mặc định là "#0000FF".                                                                                                                                         |
| fillOpacity *optional* | number                                                                                  | chỉ định độ trong suốt màu của Circle, khoảng giá trị của nó nằm trong khoảng từ 0.0 đến 1.0. Giá trị mặc định là 1.                                                                                                              |
| visible *optional*     | boolean                                                                                 | xác định Circle có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.                                                                                                                                                         |
| strokeColor *optional* | string                                                                                  | chỉ định màu sắc của đường viền Circle theo mã HEX (ví dụ "#FF0000"). Giá trị mặc định là "#00FF00".                                                                                                                              |
| strokeWidth *optional* | number                                                                                  | chỉ định độ lớn của đường viền Circle theo đơn vị point.                                                                                                                                                                          |
| draggable *optional*   | boolean                                                                                 | cho phép người dùng có thể kéo Circle trên bản đồ hay không. Giá trị mặc định là false.                                                                                                                                           |
| zIndex *optional*      | number                                                                                  | chỉ định thứ tự chồng nhau giữa các Circle với nhau hoặc giữa Circle với các đối tượng khác trên bản đồ. Giá trị mặc định là 0.                                                                                                   |
| elevation *optional*   | number                                                                                  | chỉ định độ cao của Circle so với mực nước biển, đơn vị là mét. Giá trị mặc định là 0                                                                                                                                             |
| clickable *optional*   | boolean                                                                                 | cho phép người dùng có thể tương tác được với Circle hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với Circle thì tất cả các sự kiện liên quan tới Circle từ phía người dùng sẽ không có tác dụng. |
