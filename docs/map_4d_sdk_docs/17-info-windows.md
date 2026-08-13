## [Info Windows](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window "Info Windows")

InfoWindow hiển thị nội dung (thường là văn bản hoặc hình ảnh) trong cửa sổ bật lên phía trên bản đồ, tại một vị trí nhất định. Cửa sổ thông tin xuất hiện dưới dạng Hộp thoại đối với trình đọc màn hình.

Thông thường sẽ đính kèm một cửa sổ thông tin vào một marker, nhưng cũng có thể đính kèm một cửa sổ thông tin vào một ILatLng cụ thể.

### [1. Thêm một InfoWindow](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=_1-th%c3%aam-m%e1%bb%99t-infowindow)

Hàm khởi tạo của lớp map4d.InfoWindow cần truyền vào một đối tượng map4d.InfoWindowOptions để định nghĩa các thuộc tính ban đầu của InfoWindow.

Đối tượng InfoWindowOptions được định nghĩa như sau:

```
interface InfoWindowOptions { ariaLabel?: string content?: string maxWidth?: number minWidth?: number position?: ILatLng zIndex?: number }
```



Các thuộc tính của InfoWindow Options :

- ariaLabel (tùy chọn) : ariaLabel sẽ gán cho InfoWindow.
- content (tùy chọn) : nội dung để hiển thị trong InfoWindow. Đó có thể là một phần tử HTML, một chuỗi văn bản thuần túy hoặc một chuỗi chứa HTML.
- maxWidth (tùy chọn) : chiều rộng tối đa của InfoWindow, bất kể chiều rộng của nội dung. Giá trị này chỉ được xem xét nếu được đặt trước khi gọi open()
- minWidth (tùy chọn) : chiều rộng tối thiểu của InfoWindow, bất kể chiều rộng của nội dung. Khi sử dụng thuộc tính này, bạn nên đặt minWidth thành một giá trị nhỏ hơn chiều rộng của bản đồ (tính bằng pixel).
- position (tùy chọn) : chỉ định một ILatLng để xác định vị trí ban đầu của InfoWindow. Nếu InfoWindow được mở bằng anchor, vị trí của anchor sẽ được sử dụng thay thế.
- zIndex (tùy chọn) : chỉ định thứ tự chồng nhau giữa các InfoWindow với nhau hoặc giữa InfoWindow với các đối tượng khác trên bản đồ. Giá trị mặc định là 0

### [2. Mở một InfoWindow](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=_2-m%e1%bb%9f-m%e1%bb%99t-infowindow)

Khi bạn tạo một InfoWindow, cửa sổ đó sẽ không tự động xuất hiện trên bản đồ. Để hiển thị cửa sổ thông tin, bạn phải gọi phương thức open() trên InfoWindow, chuyển một đối tượng [InfoWindowOpenOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/info-window?id=infowindow-open-options) chỉ định các tùy chọn sau:

```
interface InfoWindowOpenOptions { map?: Map anchor?: Marker }
```



Các thuộc tính của InfoWindowOpenOptions :

- map (tùy chọn) : bản đồ để hiển thị InfoWindow này.
- anchor (tùy chọn) : chứa điểm anchor point (ví dụ: Marker). Nếu tuỳ chọn anchor là null hoặc undefined, cửa sổ thông tin sẽ lấy giá trị của position property.

```
infoWindow.open({ anchor: marker, map, });
```



Ví dụ thêm 1 InfoWindow

### [3. Đóng một InfoWindow](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=_3-%c4%90%c3%b3ng-m%e1%bb%99t-infowindow)

Theo mặc định, một cửa sổ thông tin vẫn mở cho đến khi người dùng nhấp vào nút điều khiển đóng (nút close ở trên cùng bên phải cửa sổ thông tin). Bạn cũng có thể đóng cửa sổ thông tin một cách rõ ràng bằng cách gọi phương thức close().

```
infoWindow.close()
```



### [4. Di chuyển một InfoWindow](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=_4-di-chuy%e1%bb%83n-m%e1%bb%99t-infowindow)

Có một số cách để thay đổi vị trí của cửa sổ thông tin:

- Call setPosition() ở InfoWindow hoặc
- Đính kèm InfoWindow vào điểm đánh dấu mới bằng phương thức InfoWindow\.open(). Lưu ý: Nếu bạn gọi open() mà không chuyển điểm marker, InfoWindow sẽ sử dụng vị trí được chỉ định khi xây dựng thông qua giá trị cố định InfoWindowOptions

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=reference)

### [InfoWindow Class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=infowindow-class)

`map4d.InfoWindow` class

Constructor

Tạo InfoWindow với các options được chỉ định

```
InfoWindow(options)
```



- Parameters:
  - options: [InfoWindowOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/info-window?id=infowindow-options)

Methods

| **Name**    | **Parameters**                                                                                                                                                                                                | **Return Value** | **Description**                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------ |
| open        | [IInfoWindowOpenOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/info-window?id=iinfowindowopenoptions), [anchor](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/marker?id=marker-class) | none             | Thêm InfoWindow vào map                    |
| close       | none                                                                                                                                                                                                          | none             | Xóa InfoWindow khỏi map                    |
| setOptions  | [InfoWindowOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/info-window?id=infowindow-options)                                                                                                  | none             | Set InfoWindowOptions InfoWindow           |
| setContent  | string `or` Node                                                                                                                                                                                              | none             | Set nội dung content cho InfoWindow        |
| getContent  | none                                                                                                                                                                                                          | string           | Get nội dung content của InfoWindow        |
| setPosition | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)                                                                                                                       | none             | Set vị trí cho InfoWindow                  |
| getPosition | none                                                                                                                                                                                                          | ILatLng          | Get vị trí của InfoWindow                  |
| setZIndex   | number                                                                                                                                                                                                        | none             | Set giá trị zIndex cho InfoWindow          |
| getZIndex   | none                                                                                                                                                                                                          | number           | Get giá trị zIndex hiện tại của InfoWindow |

### [InfoWindow Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=infowindow-options)

`map4d.InfoWindowOptions` interface

Đối tượng InfoWindowOptions dùng để xác định các thuộc tính dùng cho InfoWindow.

Properties

| **Name**             | **Type**                                                                                | **Description**                                                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| position *optional*  | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | chỉ định một ILatLng để xác định vị trí ban đầu của InfoWindow.                                                                                                                          |
| ariaLabel *optional* | string                                                                                  | ariaLabel sẽ gán cho InfoWindow.                                                                                                                                                         |
| content *optional*   | string `or` Node                                                                        | nội dung để hiển thị trong InfoWindow. Đó có thể là một phần tử HTML, một chuỗi văn bản thuần túy hoặc một chuỗi chứa HTML.                                                              |
| maxWidth *optional*  | number                                                                                  | chiều rộng tối đa của InfoWindow, bất kể chiều rộng của nội dung. Giá trị này chỉ được xem xét nếu được đặt trước khi gọi open()                                                         |
| minWidth *optional*  | number                                                                                  | chiều rộng tối thiểu của InfoWindow, bất kể chiều rộng của nội dung. Khi sử dụng thuộc tính này, bạn nên đặt minWidth thành một giá trị nhỏ hơn chiều rộng của bản đồ (tính bằng pixel). |
| zIndex *optional*    | number                                                                                  | chỉ định thứ tự chồng nhau giữa các InfoWindow với nhau hoặc giữa InfoWindow với các đối tượng khác trên bản đồ. Giá trị mặc định là 0                                                   |

### [IInfoWindowOpenOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=iinfowindowopenoptions)

`map4d.IInfoWindowOpenOptions` type

```
type IInfoWindowOpenOptions = InfoWindowOpenOptions | Map
```



### [InfoWindow Open Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/info-window?id=infowindow-open-options)

`map4d.InfoWindowOpenOptions` interface

Đối tượng InfoWindowOptions dùng để mở InfoWindow

Properties

| **Name**          | **Type**                                                                               | **Description**                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| anchor *optional* | [Marker](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/marker?id=marker-class) | chỉ định một [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) để xác định vị trí ban đầu của InfoWindow. |
| map *optional*    | [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)          | ariaLabel sẽ gán cho InfoWindow.                                                                                                                |
