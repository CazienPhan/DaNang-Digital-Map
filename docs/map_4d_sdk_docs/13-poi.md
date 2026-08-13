## [POI](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi "POI")

Hiện tại trên bản đồ đã có những điểm đánh dấu địa điểm có sẵn (như địa danh công cộng, quán cà phê, nhà hàng, bến xe, ...) và chúng chỉ hiển thị khi bản đồ ở chế độ 2D. Khi bạn cần một đối tượng để đánh dấu một địa điểm trên bản đồ tương tự như những điểm có sẵn đó thì bạn có thể dùng lớp map4d.POI. Các đối tượng map4d.POI bạn thêm vào bản đồ có thể hiện thị ở cả 2 chế độ 2D và 3D.

### [1. Thêm một POI](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi?id=_1-th%c3%aam-m%e1%bb%99t-poi)

Hàm khởi tạo của lớp map4d.POI cần truyền vào một đối tượng map4d.POIOptions để định nghĩa các thuộc tính ban đầu của POI.

Đối tượng POIOptions được định nghĩa như sau:

```
interface POIOptions { position: ILatLng title?: string subtitle?: string color?: string type?: string icon?: string elevation?: number zIndex?: number visible?: boolean draggable?: boolean clickable?: boolean }
```



Các thuộc tính của POIOptions :

- position (bắt buộc): chỉ định một ILatLng để xác định vị trí ban đầu của POI.
- title (tùy chọn): chỉ định tiêu đề của POI. Tiêu đề sẽ hiển thị thông tin của POI mà bạn muốn hiển thị cho người dùng.
- subtitle (tùy chọn): chỉ định thông tin mô tả của POI.
- color (tùy chọn): chỉ định màu cho tiêu đề và màu icon (nếu sử dụng thuộc tính `type`) của POI
- type (tùy chọn): chỉ định kiểu của POI, tùy thuộc vào kiểu mà icon của POI sẽ có hình ảnh tương ứng. Phụ thuộc vào kind được quy định trong file [style](https://map4d-web-cdtqg.map4d.vn/user/platform/map-style/list)
- icon (tùy chọn): chỉ định một đường dẫn URL để lấy hình ảnh cho POI. Nếu option này được set giá trị thì hình ảnh của POI sẽ lấy theo URL này mà không cần quan tâm tới option type. Giá trị mặc định là null
- elevation (tùy chọn): chỉ định độ cao của POI so với mực nước biển, đơn vị là mét. Giá trị mặc định là 0.
- zIndex (tùy chọn): chỉ định thứ tự chồng nhau giữa các POI với nhau, nó không dùng để xác định thứ tự chồng nhau so với các đối tượng khác. Giá trị mặc định là 0.
- visible (tùy chọn): xác định POI có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.
- draggable (tùy chọn): cho phép người dùng có thể kéo POI trên bản đồ hay không. Giá trị mặc định là false
- clickable (tùy chọn): cho phép người dùng có thể tương tác được với POI hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với POI thì tất cả các sự kiện liên quan tới POI từ phía người dùng sẽ không có tác dụng.

Ví dụ sau đây thêm một POI vào bản đồ với kiểu là cafe và tiêu đề là Demo POI cafe

### [2. Xóa POI khỏi bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi?id=_2-x%c3%b3a-poi-kh%e1%bb%8fi-b%e1%ba%a3n-%c4%91%e1%bb%93)

Để xóa một POI ra khỏi bản đồ, hãy gọi phương thức setMap() và truyền vào đối số null

```
poi.setMap(null)
```



Lưu ý rằng cách trên không xóa POI. Nó chỉ xóa POI ra khỏi bản đồ. Nếu bạn muốn xóa POI, bạn nên xóa nó khỏi bản đồ, sau đó bạn gán poi bằng null.

### [3. Bật, tắt tính năng POI có sẵn của bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi?id=_3-b%e1%ba%adt-t%e1%ba%aft-t%c3%adnh-n%c4%83ng-poi-c%c3%b3-s%e1%ba%b5n-c%e1%bb%a7a-b%e1%ba%a3n-%c4%91%e1%bb%93)

Bạn có thể bật hoặc tắt tính năng POI có sẵn của bản đồ. Mặc định thì bản đồ sẽ hiển thị các POI có sẵn của nó. Nếu bạn muốn tắt nó đi thì sử dụng phương thức setPOIsEnabled() của lớp map4d.Map và truyền vào tham số false. Ngược lại nếu bạn muốn bật nó lên thì bạn truyền vào tham số là true.

Ví dụ để tắt tính năng POI có sẵn của bản đồ:

```
map.setPOIsEnabled(false)
```



Ngoài ra để kiểm tra tính năng POI có sẵn có được bật hay không bạn cũng có thể sử dụng phương thức isPOIsEnabled() của lớp map4d.Map. Phương thức này sẽ trả về một giá trị boolean tương ứng với tính năng có được bật hay không.

```
let isPOIsEnabled = map.isPOIsEnabled()
```



### [4. Các sự kiện trên POI](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi?id=_4-c%c3%a1c-s%e1%bb%b1-ki%e1%bb%87n-tr%c3%aan-poi)

Để lắng nghe các sự kiện xảy ra trên POI, bạn hãy dùng phương thức addListener() của lớp Map với tham số EventOptions là đối tượng {poi: true} hoặc/và {mappoi: true}.

- {poi: true}: là EventOptions cho POI mà bạn tự thêm vào.
- {mappoi: true}: là EventOptions cho POI có sẵn trên bản đồ.

Các sự kiện có thể lắng nghe trên POI là: click, dblClick, longClick, rightClick, hover, drag, dragStart, dragEnd

Mô tả các sự kiện này tương tự như mô tả của Map Event. Các bạn có thể tham khảo [tại đây](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events)

Ví dụ để lắng nghe sự kiện click cho POI ta thực hiện như sau:

```
let clickEvent = map.addListener("click", (args) => { console.log("POI clicked: ") console.log(args) }, {poi: true})
```



Tham số args trả về khi có sự kiện xảy ra sẽ bao gồm các thông tin chính như sau:

- poi: là đối tượng POI mà người dùng click.
- location: là tọa độ click trên bản đồ theo latitude và longitude.
- pixel: là tọa độ pixel mà người dùng click trên màn hình.

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi?id=reference)

### [POI Class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi?id=poi-class)

`map4d.POI` class

Constructor

Tạo POI với các options được chỉ định

```
POI(options)
```



- Parameters:
  - options: [POIOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/poi?id=poi-options) *required*

Methods

| **Name**     | **Parameters**                                                                          | **Return Value**                                                                      | **Description**                                                          |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| setMap       | [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)           | none                                                                                  | Thêm polygon vào map, nếu set map là null thì polygon sẽ bị xóa khỏi map |
| getMap       | none                                                                                    | Map                                                                                   | Lấy đối tượng map mà polygon được thêm vào                               |
| setTitle     | string                                                                                  | none                                                                                  | Set tiêu đề cho POI                                                      |
| getTitle     | none                                                                                    | string                                                                                | Get tiêu đề của POI                                                      |
| setPosition  | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | none                                                                                  | Set vị trí tọa độ trên bản đồ cho POI                                    |
| getPosition  | none                                                                                    | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) | Get vị trí tọa độ của POI                                                |
| setColor     | string                                                                                  | none                                                                                  | Set màu cho icon (nếu sử dụng `type`) và tiêu đề của POI                 |
| getColor     | none                                                                                    | string                                                                                | Get màu tiêu đề và icon (nếu sử dụng `type`) của POI                     |
| setSubtitle  | string                                                                                  | none                                                                                  | Set thông tin mô tả cho POI                                              |
| getSubtitle  | none                                                                                    | string                                                                                | Get thông tin mô tả của POI                                              |
| setType      | string                                                                                  | none                                                                                  | Set kiểu cho POI                                                         |
| getType      | none                                                                                    | string                                                                                | Get kiểu của POI                                                         |
| setIcon      | string                                                                                  | none                                                                                  | Set đường dẫn URL để lấy hình ảnh thay thế ảnh mặc định của POI          |
| getIcon      | none                                                                                    | string                                                                                | Get đường dẫn URL hình ảnh của POI                                       |
| setVisible   | boolean                                                                                 | none                                                                                  | Ẩn/hiện POI trên map hay không                                           |
| isVisible    | none                                                                                    | boolean                                                                               | Get trạng thái ẩn/hiện của POI                                           |
| setDraggable | boolean                                                                                 | none                                                                                  | Cho phép POI có được kéo trên bản đồ hay không                           |
| isDraggable  | none                                                                                    | boolean                                                                               | Kiểm tra xem POI có thể kéo trên bản đồ hay không                        |
| setZIndex    | number                                                                                  | none                                                                                  | Set giá trị zIndex cho POI                                               |
| getZIndex    | none                                                                                    | number                                                                                | Get giá trị zIndex hiện tại của POI                                      |
| setElevation | number                                                                                  | none                                                                                  | Set giá trị độ cao cho POI theo đơn vị mét                               |
| getElevation | none                                                                                    | number                                                                                | Get giá trị độ cao của POI theo đơn vị mét                               |
| getUserData  | none                                                                                    | any                                                                                   | Set dữ liệu riêng mà người dùng muốn cho POI                             |
| setUserData  | any                                                                                     | none                                                                                  | Get dữ liệu riêng mà người dùng đã set cho POI                           |
| isClickable  | none                                                                                    | boolean                                                                               | Kiểm tra POI có thể tương tác bởi người dùng hay không                   |
| setClickable | boolean                                                                                 | none                                                                                  | Cho phép POI có thể tương tác bởi người dùng hay không                   |

### [POI Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/poi?id=poi-options)

`map4d.POIOptions` interface

Đối tượng POIOptions dùng để xác định các thuộc tính dùng cho POI.

Properties

| **Name**             | **Type**                                                                                | **Description**                                                                                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| position *required*  | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | chỉ định một ILatLng để xác định vị trí ban đầu của POI.                                                                                                                                                                 |
| title *optional*     | string                                                                                  | chỉ định tiêu đề của POI. Tiêu đề sẽ hiển thị thông tin của POI mà bạn muốn hiển thị cho người dùng.                                                                                                                     |
| subtitle *optional*  | string                                                                                  | chỉ định thông tin mô tả của POI.                                                                                                                                                                                        |
| color *optional*     | string                                                                                  | chỉ định màu tiêu đề và icon ((nếu sử dụng `type`)) của POI theo mã HEX (ví dụ "#5B9AFF"). Giá trị mặc định là "#FF0000"                                                                                                 |
| type *optional*      | string                                                                                  | chỉ định kiểu của POI, tùy thuộc vào kiểu mà icon của POI sẽ có hình ảnh tương ứng. Phụ thuộc vào kind được quy định trong file [style](https://map4d-web-cdtqg.map4d.vn/user/platform/map-style/list)                   |
| icon *optional*      | string                                                                                  | chỉ định một đường dẫn URL để lấy hình ảnh cho POI. Nếu option này được set giá trị thì hình ảnh của POI sẽ lấy theo URL này mà không cần quan tâm tới option type. Giá trị mặc định là null.                            |
| elevation *optional* | number                                                                                  | chỉ định độ cao của POI so với mực nước biển, đơn vị là mét. Giá trị mặc định là 0                                                                                                                                       |
| zIndex *optional*    | number                                                                                  | chỉ định thứ tự chồng nhau giữa các POI với nhau, nó không dùng để xác định thứ tự chồng nhau so với các đối tượng khác. Giá trị mặc định là 0.                                                                          |
| visible *optional*   | boolean                                                                                 | xác định POI có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.                                                                                                                                                   |
| draggable *optional* | boolean                                                                                 | cho phép người dùng có thể kéo POI trên bản đồ hay không. Giá trị mặc định là false.                                                                                                                                     |
| clickable *optional* | boolean                                                                                 | cho phép người dùng có thể tương tác được với POI hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với POI thì tất cả các sự kiện liên quan tới POI từ phía người dùng sẽ không có tác dụng. |
