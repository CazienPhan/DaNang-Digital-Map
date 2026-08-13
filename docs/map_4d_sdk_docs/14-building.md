## [Building](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building "Building")

Điểm khác biệt giữa nền tảng bản đồ map4d với các nền tảng bản đồ khác đó là chế độ bản đồ 3D. Chế độ này sẽ có các đối tượng 3D mô phỏng lại các tòa nhà, cây cối, các cây cầu cũng như các công trình kiến trúc khác, ... Ngoài những đối tượng building 3D có sẵn của bản đồ, bạn còn có thể tự tạo và thêm đối tượng 3D của bạn lên bản đồ thông qua đối tượng map4d.Building

Chú ý: Những đối tượng Building này chỉ được vẽ trong chế độ 3D của bản đồ, nó không được vẽ trong chế độ 2D.

### [1. Thêm một Building](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=_1-th%c3%aam-m%e1%bb%99t-building)

Hàm khởi tạo của lớp map4d.Building cần truyền vào một đối tượng map4d.BuildingOptions để định nghĩa các thuộc tính ban đầu của Buidling.

Đối tượng BuildingOptions được định nghĩa như sau:

```
interface BuildingOptions { position?: ILatLng name?: string scale?: number bearing?: number elevation?: number height?: number model?: string texture?: string coordinates?: ILatLng[] visible?: boolean draggable?: boolean clickable?: boolean selected?: boolean growUp?: boolean }
```



Các thuộc tính của BuildingOptions :

- position (bắt buộc): chỉ định một ILatLng để xác định vị trí của Building.
- name (tùy chọn): chỉ định tên của Building mà bạn tạo. Tên mặc định sẽ là Unknown name
- scale (tùy chọn): chỉ định tỉ lệ của Building được vẽ ra ở trên bản đồ so với tỉ lệ thật của nó. Ví dụ khi giá trị scale là 0.5 thì Building sẽ nhỏ hơn một nửa so với kích thước thật của nó. Giá trị mặc định là 1.
- bearing (tùy chọn): chỉ định góc quay của Building khi được vẽ ra trên bản đồ theo đơn vị là Độ. Bình thường giá trị mặc định của nó là 0. Khi bạn muốn quay Building theo một hướng nào đó thì bạn chỉ cần set lại giá trị bearing trong khoảng từ 0 đến 360 độ.
- elevation (tùy chọn): chỉ định độ cao của Building so với mực nước biển theo đơn vị mét. Giá trị mặc định là 0
- height (tùy chọn): chỉ định chiều cao của Building theo đơn vị là mét. Thuộc tính này chỉ có tác dụng khi Building của bạn được tạo từ một mảng ILatLng thông qua thuộc tính coordinates (hay còn gọi là Extrude Building). Nó không có tác dụng với Building được vẽ bằng Model và Texture. Giá trị mặc định là 1.
- model (tùy chọn): chỉ định một đường dẫn URL để lấy dữ liệu model cho Building.
- texture (tùy chọn): chỉ định một đường dẫn URL để lấy dữ liệu texture cho Building. Thuộc tính này chỉ được dùng khi thuộc tính model được set giá trị. Nó sẽ map texture này vào model mà bạn đã set cho Building. Nếu bạn không set giá trị texture khi đã set giá trị model thì bản đồ sẽ vẽ một building màu trắng.
- coordinates (tùy chọn): chỉ định một mảng vị trí ILatLng để tạo một Building hình khối với mặt đáy của hình khối là mảng vị trí này. Nó kết hợp với thuộc tính height để tạo chiều cao cho hình khối đó (building này được gọi là Extrude Building). Trường hợp dùng coordinates thì sẽ không dùng đến thuộc tính texture. Nếu set giá trị cho coordinates và cả model đồng thời thì sẽ ưu tiên lấy giá trị của modelđể tạo Building.
- visible (tùy chọn): xác định Building có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.
- draggable (tùy chọn): cho phép người dùng có thể kéo Building trên bản đồ hay không. Giá trị mặc định là false
- clickable (tùy chọn): cho phép người dùng có thể tương tác được với Building hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với Building thì tất cả các sự kiện liên quan tới Building từ phía người dùng sẽ không có tác dụng.
- selected (tùy chọn): chỉ định Building có được hightlight hay không. Khi nó được set là true thì Building sẽ được vẽ một đường viền màu đỏ xung quanh để giúp người dùng dễ nhận biết. Còn khi nó được set giá trị là false thì nó sẽ được vẽ như một Building bình thường. Giá trị mặc định là false.
- growUp (tùy chọn): quy định Building có hiệu ứng mọc hay không. Hiệu ứng này tạo cảm giác đẹp mắt hơn khi Building vừa được load lên bản đồ. Giá trị mặc định là true.

Ví dụ sau đây thêm một Building là một cây cầu bằng Model và Texture vào bản đồ:

Hoặc ta cũng có thể thêm một Building bằng một mảng coordinates như sau:

### [2. Xóa Building khỏi bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=_2-x%c3%b3a-building-kh%e1%bb%8fi-b%e1%ba%a3n-%c4%91%e1%bb%93)

Để xóa một Building ra khỏi bản đồ, hãy gọi phương thức setMap() và truyền vào đối số null

```
building.setMap(null)
```



Lưu ý rằng cách trên không xóa Buidling. Nó chỉ xóa Building ra khỏi bản đồ. Nếu bạn muốn xóa Building, bạn nên xóa nó khỏi bản đồ, sau đó bạn gán building bằng null.

### [3. Hiện, ẩn những Building có sẵn của bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=_3-hi%e1%bb%87n-%e1%ba%a9n-nh%e1%bb%afng-building-c%c3%b3-s%e1%ba%b5n-c%e1%bb%a7a-b%e1%ba%a3n-%c4%91%e1%bb%93)

Bạn có thể cho phép hiện hoặc ẩn những building có sẵn của bản đồ. Mặc định thì bản đồ sẽ hiển thị tất cả các building có sẵn của nó ở chế độ 3D. Nếu bạn muốn ẩn tất cả các building đó đi thì sử dụng phương thức setBuildingsEnabled() của lớp map4d.Map và truyền vào tham số false. Ngược lại nếu bạn muốn hiện chúng lên thì bạn truyền vào tham số là true.

Ví dụ để ẩn các building có sẵn của bản đồ:

```
map.setBuildingsEnabled(false)
```



Ngoài ra để kiểm tra các building có sẵn có được hiện trên bản đồ hay không bạn cũng có thể sử dụng phương thức isBuildingsEnabled() của lớp map4d.Map. Phương thức này sẽ trả về một giá trị boolean tương ứng với các building có được hiện hay không.

```
let isBuildingsEnabled = map.isBuildingsEnabled()
```



### [4. Hiển thị các building theo filter](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=_4-hi%e1%bb%83n-th%e1%bb%8b-c%c3%a1c-building-theo-filter)

Đôi lúc bạn không muốn hiển thị tất cả các building mặc định của bản đồ mà chỉ muốn hiển thị theo một số type mà bạn muốn. Phương thức setFilterBuildings() của lớp Map sẽ giúp bạn thực hiện điều đó. Bạn cần truyền một mảng string chứa các type của các building mà bạn muốn hiển thị trên bản đồ. Hiện tại map4d hỗ trợ các type phổ biến sau cho building: point, decoration, university, school, bank, bus\_station, stadium, cafe, restaurant, doctors, motel, shop, marketplace, museum, atm, tree, theatre, bridge, payment\_centre, house, electronics

Số lượng các type có thể tăng lên theo thời gian nhưng chúng tôi sẽ cập nhật sớm nhất có thể.

Ví dụ: Để cho phép bản đồ chỉ hiển thị những Building có type là motel, bridge và school

```
map.setFilterBuildings(["motel", "bridge", "school"])
```



Nếu bạn gọi phương thức setFilterBuildings() nhiều lần thì mảng danh sách mà bạn set cuối cùng sẽ được filter.

Để hiển thị lại tất cả các building mặc định của bản đồ mà không filter thì bạn có thể gọi lại phương thức setFilterBuildings() với tham số truyền vào là null hoặc một một mảng rỗng ([])

Ví dụ:

```
map.setFilterBuildings(null)
```



hoặc

```
map.setFilterBuildings([])
```



Để kiểm tra các type nào đang được filter bạn có thể sử dụng phương thức getFilterBuildings() của lớp Map. Phương thức này sẽ trả về một mảng string chứa các type

Ví dụ:

```
let filterTypes = map.getFilterBuildings()
```



### [5. Lấy danh sách các tile chứa Building](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=_5-l%e1%ba%a5y-danh-s%c3%a1ch-c%c3%a1c-tile-ch%e1%bb%a9a-building)

Trong một số trường hợp bạn muốn lấy danh sách các tile chứa building (hoặc là danh sách các tile mà building vẽ đè lên trên bản đồ) thì hãy dùng phương thức getTileCovers(zooms: number[], completion: Function). Với 2 tham số như sau:

- zooms: number[]: mảng các mức zoom ta cần lấy danh sách tile bị đè bởi building. Nếu bạn chỉ cần lấy danh sách tile của 1 mức zoom thì có thể dùng mảng với 1 phần tử.
  Chú ý: mức zoom >= 17 (chế độ 3D thì mức zoom nhỏ nhất là 17)
- completion: là một hàm callback để nhận kết quả trả về với cấu trúc (tiles) => { /\* Your code \*/ }, trong đó tiles là danh sách các tile bị đè bởi building.

```
building.getTileCovers([18], (tiles) => { console.log(tiles) })
```



### [6. Lấy danh sách các tọa độ bao quanh mặt chân đế của Building](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=_6-l%e1%ba%a5y-danh-s%c3%a1ch-c%c3%a1c-t%e1%bb%8da-%c4%91%e1%bb%99-bao-quanh-m%e1%ba%b7t-ch%c3%a2n-%c4%91%e1%ba%bf-c%e1%bb%a7a-building)

Building sẽ có các hình dáng khác nhau (hình cong, hình uốn lượn, ...) nên mặt chân đế của nó cũng sẽ là những đường cong, đường uốn lượn đó. Vậy để xác định mặt chân đế của một building ta cần lấy các điểm tọa độ bằng phương thức getBoundsCoordinates(completion: Function) với 1 tham số truyền vào là:

- completion: là một hàm callback để nhận kết quả trả về với cấu trúc (coordinates) => {/\* Your code \*/}. trong đó coordinates là danh sách các điểm tọa độ bao quanh mặt chân đế của building

Ví dụ sau đây ta sẽ lấy các điểm tọa độ của mặt chân đế của một cây cầu và vẽ các Marker tại những điểm đó:

### [7. Các sự kiện trên Building](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=_7-c%c3%a1c-s%e1%bb%b1-ki%e1%bb%87n-tr%c3%aan-building)

Để lắng nghe các sự kiện xảy ra trên Building, bạn hãy dùng phương thức addListener() của lớp Map với tham số EventOptions là đối tượng {building: true} hoặc/và {mapbuilding: true}.

- {building: true}: là EventOptions cho Building mà bạn tự thêm vào.
- {mapbuilding: true}: là EventOptions cho Building có sẵn trên bản đồ.

Các sự kiện có thể lắng nghe trên Building là: click, dblClick, longClick, rightClick, hover, drag, dragStart, dragEnd

Mô tả các sự kiện này tương tự như mô tả của Map Event. Các bạn có thể tham khảo [tại đây](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events)

Ví dụ để lắng nghe sự kiện click cho Building ta thực hiện như sau:

```
let clickEvent = map.addListener("click", (args) => { console.log("Building clicked: ") console.log(args) }, {building: true})
```



Tham số args trả về khi có sự kiện xảy ra sẽ bao gồm các thông tin chính như sau:

- building: là đối tượng Building mà người dùng click.
- location: là tọa độ click trên bản đồ theo latitude và longitude.
- pixel: là tọa độ pixel mà người dùng click trên màn hình.

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=reference)

### [Building Class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=building-class)

`map4d.Building` class

Constructor

Tạo Building với các options được chỉ định

```
Building(options)
```



- Parameters:
  - options: [BuildingOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/building?id=building-options) *required*

Methods

| **Name**             | **Parameters**                                                                          | **Return Value**                                                                      | **Description**                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| setMap               | [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)           | none                                                                                  | Thêm building vào map, nếu set map là null thì building sẽ bị xóa khỏi map                            |
| getMap               | none                                                                                    | Map                                                                                   | Lấy đối tượng map mà building được thêm vào                                                           |
| setPosition          | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | none                                                                                  | Set vị trí tọa độ trên bản đồ cho building                                                            |
| getPosition          | none                                                                                    | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) | Get vị trí tọa độ của building                                                                        |
| setName              | string                                                                                  | none                                                                                  | Set tên cho building                                                                                  |
| getName              | none                                                                                    | string                                                                                | Get tên của building                                                                                  |
| setBearing           | number                                                                                  | none                                                                                  | Set góc quay khi đặt trên bản đồ cho building theo đơn vị Độ                                          |
| getBearing           | none                                                                                    | number                                                                                | Get góc quay trên bản đồ của building theo đơn vị Độ                                                  |
| setScale             | number                                                                                  | none                                                                                  | Set tỉ lệ vẽ building trên bản đồ so với kích thước thật của nó                                       |
| getScale             | none                                                                                    | number                                                                                | Get tỉ lệ vẽ building trên bản đồ so với kích thước thật của nó                                       |
| setHeight            | number                                                                                  | none                                                                                  | Set giá trị độ cao cho building khi model của nó được tạo từ thuộc tính coordinates                   |
| getHeight            | none                                                                                    | number                                                                                | Get giá trị độ cao của building khi model của nó được tạo từ thuộc tính coordinates                   |
| setElevation         | number                                                                                  | none                                                                                  | Set giá trị độ cao building so với mực nước biển theo đơn vị mét                                      |
| getElevation         | none                                                                                    | number                                                                                | Get giá trị độ cao building so với mực nước biển theo đơn vị mét                                      |
| setSelected          | boolean                                                                                 | none                                                                                  | Set giá trị để xác định building có được hightlight hay không                                         |
| isSelected           | none                                                                                    | boolean                                                                               | Kiểm tra building có được hightlight hay không                                                        |
| setModel             | string                                                                                  | none                                                                                  | Set đường dẫn URL để lấy dữ liệu model cho Building                                                   |
| setTexture           | string                                                                                  | none                                                                                  | Set đường dẫn URL để lấy dữ liệu texture cho Building                                                 |
| getCoordinates       | none                                                                                    | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) | Get mảng vị trí mặt đáy LatLng đã truyền vào để tạo Building extrude                                  |
| setCoordinates       | string                                                                                  | none                                                                                  | Set mảng vị trí ILatLng để tạo một Building hình khối với mặt đáy của hình khối là mảng vị trí này    |
| setVisible           | boolean                                                                                 | none                                                                                  | Ẩn/hiện building trên map hay không                                                                   |
| isVisible            | none                                                                                    | boolean                                                                               | Get trạng thái ẩn/hiện của building                                                                   |
| setGrowUp            | boolean                                                                                 | none                                                                                  | Bật/tắt hiệu ứng mọc lúc tải building                                                                 |
| isGrowUp             | none                                                                                    | boolean                                                                               | Get trạng thái bật/tắt hiệu ứng mọc lúc tải của building                                              |
| setDraggable         | boolean                                                                                 | none                                                                                  | Cho phép building có được kéo trên bản đồ hay không                                                   |
| isDraggable          | none                                                                                    | boolean                                                                               | Kiểm tra xem building có thể kéo trên bản đồ hay không                                                |
| getUserData          | none                                                                                    | any                                                                                   | Set dữ liệu riêng mà người dùng muốn cho building                                                     |
| setUserData          | any                                                                                     | none                                                                                  | Get dữ liệu riêng mà người dùng đã set cho building                                                   |
| isClickable          | none                                                                                    | boolean                                                                               | Kiểm tra building có thể tương tác bởi người dùng hay không                                           |
| setClickable         | boolean                                                                                 | none                                                                                  | Cho phép building có thể tương tác bởi người dùng hay không                                           |
| getTileCovers        | zooms: number[], completion: Function                                                   | none                                                                                  | trả về danh sách các tile thông qua hàm completion tương ứng với mảng các mức zoom mà bạn truyền vào. |
| getBoundsCoordinates | completion: Function                                                                    | none                                                                                  | trả về danh sách các tọa độ bao quanh mặt chân đế của building thông qua hàm completion               |

### [Building Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building?id=building-options)

`map4d.BuildingOptions` interface

Đối tượng BuildingOptions dùng để xác định các thuộc tính dùng cho Building.

Properties

| **Name**               | **Type**                                                                                  | **Description**                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| position *required*    | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)   | chỉ định một ILatLng để xác định vị trí ban đầu của building.                                                                                                                                                                                                                                                                                                                                                 |
| name *optional*        | string                                                                                    | chỉ định tên của Building mà bạn tạo. Tên mặc định sẽ là Unknown name                                                                                                                                                                                                                                                                                                                                         |
| scale *optional*       | number                                                                                    | chỉ định tỉ lệ của Building được vẽ ra ở trên bản đồ so với tỉ lệ thật của nó. Ví dụ khi giá trị scale là 0.5 thì Building sẽ nhỏ hơn một nửa so với kích thước thật của nó. Giá trị mặc định là 1.                                                                                                                                                                                                           |
| bearing *optional*     | number                                                                                    | chỉ định góc quay của Building khi được vẽ ra trên bản đồ theo đơn vị là Độ. Bình thường giá trị mặc định của nó là 0. Khi bạn muốn quay Building theo một hướng nào đó thì bạn chỉ cần set lại giá trị bearing trong khoảng từ 0 đến 360 độ.                                                                                                                                                                 |
| elevation *optional*   | number                                                                                    | chỉ định độ cao của building so với mực nước biển, đơn vị là mét. Giá trị mặc định là 0                                                                                                                                                                                                                                                                                                                       |
| height *optional*      | number                                                                                    | chỉ định chiều cao của Building theo đơn vị là mét. Thuộc tính này chỉ có tác dụng khi Building của bạn được tạo từ một mảng ILatLng thông qua thuộc tính coordinates (hay còn gọi là Extrude Building). Nó không có tác dụng với Building được vẽ bằng Model và Texture. Giá trị mặc định là 1.                                                                                                              |
| model *optional*       | string                                                                                    | chỉ định một đường dẫn URL để lấy dữ liệu model cho Building.                                                                                                                                                                                                                                                                                                                                                 |
| texture *optional*     | string                                                                                    | chỉ định một đường dẫn URL để lấy dữ liệu texture cho Building. Thuộc tính này chỉ được dùng khi thuộc tính model được set giá trị. Nó sẽ map texture này vào model mà bạn đã set cho Building. Nếu bạn không set giá trị texture khi đã set giá trị model thì bản đồ sẽ vẽ một building màu trắng.                                                                                                           |
| coordinates *optional* | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)[] | chỉ định một mảng vị trí ILatLng để tạo một Building hình khối với mặt đáy của hình khối là mảng vị trí này. Nó kết hợp với thuộc tính height để tạo chiều cao cho hình khối đó (building này được gọi là Extrude Building). Trường hợp dùng coordinates thì sẽ không dùng đến thuộc tính texture. Nếu set giá trị cho coordinates và cả model đồng thời thì sẽ ưu tiên lấy giá trị của modelđể tạo Building. |
| visible *optional*     | boolean                                                                                   | xác định building có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.                                                                                                                                                                                                                                                                                                                                   |
| draggable *optional*   | boolean                                                                                   | cho phép người dùng có thể kéo building trên bản đồ hay không. Giá trị mặc định là false.                                                                                                                                                                                                                                                                                                                     |
| clickable *optional*   | boolean                                                                                   | cho phép người dùng có thể tương tác được với building hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với building thì tất cả các sự kiện liên quan tới building từ phía người dùng sẽ không có tác dụng.                                                                                                                                                                       |
| selected *optional*    | boolean                                                                                   | chỉ định Building có được hightlight hay không. Khi nó được set là true thì Building sẽ được vẽ một đường viền màu đỏ xung quanh để giúp người dùng dễ nhận biết. Còn khi nó được set giá trị là false thì nó sẽ được vẽ như một Building bình thường. Giá trị mặc định là false.                                                                                                                             |
| growUp *optional*      | boolean                                                                                   | quy định Building có hiệu ứng mọc hay không. Hiệu ứng này tạo cảm giác đẹp mắt hơn khi Building vừa được load lên bản đồ. Giá trị mặc định là true.                                                                                                                                                                                                                                                           |
