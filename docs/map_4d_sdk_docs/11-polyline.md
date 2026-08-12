## [Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline "Polyline")

Để vẽ đường thẳng trên bản đồ thì ta sử dụng đối tượng Polyline. Một đối tượng Polyline bao gồm một mảng các điểm ILatLng và tạo ra các đoạn thẳng nối các vị trí đó theo một trình tự có thứ tự.

### [1. Thêm một Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_1-th%c3%aam-m%e1%bb%99t-polyline)

Hàm khởi tạo của lớp map4d.Polyline cần truyền vào một đối tượng map4d.PolylineOptions để xác định các thuộc tính ban đầu của Polyline.

Các đối tượng Polyline được vẽ dưới dạng các đoạn thẳng trên bản đồ nối các điểm mà bạn truyền vào thông qua tham số path trong đối tượng PolylineOptions. Ngoài ra bạn cũng có thể chỉ định nhiều thuộc tính khác như màu sắc, độ rộng, độ trong suốt, kiểu (nét liền hay nét đứt)... thông qua đối tượng PolylineOptions.

Đối tượng PolylineOptions được định nghĩa như sau:

```
interface PolylineOptions { path: ILatLng[] strokeWidth: number strokeColor?: string strokeOpacity?: number visible?: boolean closed?: boolean draggable?: boolean zIndex?: number elevation?: number strokePattern?: PatternItem clickable?: boolean }
```



Các thuộc tính của PolylineOptions :

- path (bắt buộc): truyền vào một mảng các tọa độ ILatLng để tạo Polyline.
- strokeWidth (bắt buộc): chỉ định độ rộng của Polyline theo đơn vị point.
- strokeColor (tùy chọn): chỉ định màu sắc của Polyline theo mã HEX (ví dụ "#FF0000"). Tham số này không hỗ trợ chỉ định màu theo tên (ví dụ: red, green, blue, ...). Giá trị mặc định là "#0000FF".
- strokeOpacity (tùy chọn): chỉ định độ trong suốt của Polyline, khoảng giá trị của nó nằm trong khoảng từ 0.0 đến 1.0. Giá trị mặc định là 1.0
- visible (tùy chọn): xác định Polyline có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.
- closed (tùy chọn): chỉ định Polyline có nối điểm đầu và điểm cuối lại với nhau hay không. Giá trị mặc định là false. Nếu bạn chỉ định thuộc tính này bằng true thì bạn sẽ được một hình đa giác.
- draggable (tùy chọn): cho phép người dùng có thể kéo Polyline trên bản đồ hay không. Giá trị mặc định là false.
- zIndex (tùy chọn): chỉ định thứ tự chồng nhau giữa các Polyline với nhau hoặc giữa Polyline với các đối tượng khác trên bản đồ. Giá trị mặc định là 0.
- elevation (tùy chọn): chỉ định độ cao của Polyline so với mực nước biển, đơn vị là mét. Giá trị mặc định là 0
- strokePattern (tùy chọn): chỉ định kiểu vẽ của Polyline ([SolidPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=solidpattern-class), [DashPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dashpattern-class), [DotPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dotpattern-class) hay [IconPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=iconpattern-class)). Giá trị mặc định là `SolidPattern`
- clickable (tùy chọn): cho phép người dùng có thể tương tác được với Polyline hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với Polyline thì tất cả các sự kiện liên quan tới Polyline từ phía người dùng sẽ không có tác dụng.

Ví dụ sau đây sẽ thêm một Polyline vào bản đồ:

### [2. Xóa Polyline khỏi bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_2-x%c3%b3a-polyline-kh%e1%bb%8fi-b%e1%ba%a3n-%c4%91%e1%bb%93)

Để xóa một Polyline ra khỏi bản đồ, hãy gọi phương thức setMap() và truyền vào tham số null

```
polyline.setMap(null)
```



Lưu ý rằng cách trên không xóa Polyline. Nó chỉ xóa Polyline ra khỏi bản đồ. Nếu bạn muốn xóa Polyline, bạn nên xóa nó khỏi bản đồ, sau đó bạn gán polyline bằng null.

### [3. Tạo một Polyline có thể kéo được trên bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_3-t%e1%ba%a1o-m%e1%bb%99t-polyline-c%c3%b3-th%e1%bb%83-k%c3%a9o-%c4%91%c6%b0%e1%bb%a3c-tr%c3%aan-b%e1%ba%a3n-%c4%91%e1%bb%93)

Bạn có thể cho người dùng kéo Polyline từ vị trí này đến vị trí khác trên bản đồ bằng cách chỉ định thuộc tính draggable bằng true ở trong PolylineOptions khi tạo Polyline

Ngoài ra bạn có thể gọi phương thức setDraggable() của đối tượng Polyline và truyền vào tham số true để bật tính năng draggable của Polyline hoặc truyền vào tham số false để tắt tính năng draggable.

### [4. Tạo một Polyline sử dụng Pattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_4-t%e1%ba%a1o-m%e1%bb%99t-polyline-s%e1%bb%ad-d%e1%bb%a5ng-pattern)

Chúng ta có thể thay đổi kiểu của Polyline bằng cách chỉ định thuộc tính strokePattern bằng các đối tượng như [SolidPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=solidpattern-class), [DashPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dashpattern-class), [DotPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dotpattern-class) hay [IconPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=iconpattern-class) ở trong PolylineOptions khi tạo Polyline.

Ví dụ sau đây vẽ polyline với Dash Pattern

Ví dụ sau đây vẽ polyline với IconPattern

Ngoài ra chúng ta có thể gọi phương thức `setStrokePattern` của đối tượng Polyline để set kiểu pattern.

### [5. Các sự kiện trên Polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=_5-c%c3%a1c-s%e1%bb%b1-ki%e1%bb%87n-tr%c3%aan-polyline)

Để lắng nghe các sự kiện xảy ra trên Polyline, bạn hãy dùng phương thức addListener() của lớp Map với tham số EventOptions là đối tượng {polyline: true}.

Các sự kiện có thể lắng nghe trên Polyline là: click, dblClick, longClick, rightClick, hover, drag, dragStart, dragEnd

Mô tả các sự kiện này tương tự như mô tả của Map Event. Các bạn có thể tham khảo [tại đây](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events)

Ví dụ để lắng nghe sự kiện click cho Polyline ta thực hiện như sau:

```
let clickEvent = map.addListener("click", (args) => { console.log("Polyline clicked: ") console.log(args) }, {polyline: true})
```



Tham số args trả về khi có sự kiện xảy ra sẽ bao gồm các thông tin chính như sau:

- polyline: là đối tượng polyline mà người dùng click.
- location: là tọa độ click trên bản đồ theo latitude và longitude.
- pixel: là tọa độ pixel mà người dùng click trên màn hình.

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=reference)

### [Polyline Class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=polyline-class)

`map4d.Polyline` class

Constructor

Tạo Polyline với các options được chỉ định

```
Polyline(options)
```



- Parameters:
  - options: [PolylineOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/polyline?id=polyline-options) *required*

Methods

| **Name**         | **Parameters**                                                                            | **Return Value**                                                                        | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| setMap           | [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)             | none                                                                                    | Thêm polyline vào map, nếu set map là null thì polyline sẽ bị xóa khỏi map                                                                                                                                                                                                                                                                                                                                                            |
| getMap           | none                                                                                      | Map                                                                                     | Lấy đối tượng map mà polyline được thêm vào                                                                                                                                                                                                                                                                                                                                                                                           |
| setPath          | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)[] | none                                                                                    | Set mảng các điểm tọa độ của polyline                                                                                                                                                                                                                                                                                                                                                                                                 |
| getPath          | none                                                                                      | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng)[] | Get mảng các điểm tọa độ tâm của polyline                                                                                                                                                                                                                                                                                                                                                                                             |
| setClosed        | boolean                                                                                   | none                                                                                    | Set thuộc tính chỉ định polyline có nối điểm đầu và điểm cuối hay không                                                                                                                                                                                                                                                                                                                                                               |
| isClosed         | none                                                                                      | boolean                                                                                 | Kiểm tra polyline có được nối điểm đầu với điểm cuối với nhau hay không                                                                                                                                                                                                                                                                                                                                                               |
| setStrokeWidth   | number                                                                                    | none                                                                                    | Set độ rộng cho polyline                                                                                                                                                                                                                                                                                                                                                                                                              |
| getStrokeWidth   | none                                                                                      | number                                                                                  | Get độ rộng của polyline                                                                                                                                                                                                                                                                                                                                                                                                              |
| setStrokeColor   | string                                                                                    | none                                                                                    | Set màu cho polyline theo mã HEX (ví dụ: "#0F4DA9")                                                                                                                                                                                                                                                                                                                                                                                   |
| getStrokeColor   | none                                                                                      | string                                                                                  | Get màu của polyline                                                                                                                                                                                                                                                                                                                                                                                                                  |
| setStrokeOpacity | number                                                                                    | none                                                                                    | Set độ trong suốt cho màu của polyline (giá trị từ 0.0 đến 1.0)                                                                                                                                                                                                                                                                                                                                                                       |
| getStrokeOpacity | none                                                                                      | number                                                                                  | Get độ trong suốt của polyline                                                                                                                                                                                                                                                                                                                                                                                                        |
| setVisible       | boolean                                                                                   | none                                                                                    | Ẩn/hiện polyline trên map hay không                                                                                                                                                                                                                                                                                                                                                                                                   |
| isVisible        | none                                                                                      | boolean                                                                                 | Get trạng thái ẩn/hiện của polyline                                                                                                                                                                                                                                                                                                                                                                                                   |
| setStrokePattern | [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)   | none                                                                                    | Set kiểu vẽ cho polyline (có 4 kiểu là: [SolidPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=solidpattern-class), [DashPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dashpattern-class), [DotPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dotpattern-class) và [IconPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=iconpattern-class)) |
| getStrokePattern | none                                                                                      | [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem) | Get kiểu vẽ hiện tại của polyline                                                                                                                                                                                                                                                                                                                                                                                                     |
| setZIndex        | number                                                                                    | none                                                                                    | Set giá trị zIndex cho polyline                                                                                                                                                                                                                                                                                                                                                                                                       |
| getZIndex        | none                                                                                      | number                                                                                  | Get giá trị zIndex hiện tại của polyline                                                                                                                                                                                                                                                                                                                                                                                              |
| setElevation     | number                                                                                    | none                                                                                    | Set giá trị độ cao cho polyline theo đơn vị mét                                                                                                                                                                                                                                                                                                                                                                                       |
| getElevation     | none                                                                                      | number                                                                                  | Get giá trị độ cao của polyline theo đơn vị mét                                                                                                                                                                                                                                                                                                                                                                                       |
| setDraggable     | boolean                                                                                   | none                                                                                    | Cho phép polyline có được kéo trên bản đồ hay không                                                                                                                                                                                                                                                                                                                                                                                   |
| isDraggable      | none                                                                                      | boolean                                                                                 | Kiểm tra xem polyline có thể kéo trên bản đồ hay không                                                                                                                                                                                                                                                                                                                                                                                |
| getUserData      | none                                                                                      | any                                                                                     | Set dữ liệu riêng mà người dùng muốn cho polyline                                                                                                                                                                                                                                                                                                                                                                                     |
| setUserData      | any                                                                                       | none                                                                                    | Get dữ liệu riêng mà người dùng đã set cho polyline                                                                                                                                                                                                                                                                                                                                                                                   |
| isClickable      | none                                                                                      | boolean                                                                                 | Kiểm tra polyline có thể tương tác bởi người dùng hay không                                                                                                                                                                                                                                                                                                                                                                           |
| setClickable     | boolean                                                                                   | none                                                                                    | Cho phép polyline có thể tương tác bởi người dùng hay không                                                                                                                                                                                                                                                                                                                                                                           |

### [Polyline Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline?id=polyline-options)

`map4d.PolylineOptions` interface

Đối tượng PolylineOptions dùng để xác định các thuộc tính dùng cho Polyline.

Properties

| **Name**                 | **Type**                                                                                  | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path *required*          | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng)[] | truyền vào một mảng các tọa độ ILatLng để tạo Polyline.                                                                                                                                                                                                                                                                                                                                                                                                           |
| strokeWidth *required*   | number                                                                                    | chỉ định độ rộng của Polyline theo đơn vị point.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| strokeColor *optional*   | string                                                                                    | chỉ định màu sắc của Polyline theo mã HEX (ví dụ "#FF0000"). Tham số này không hỗ trợ chỉ định màu theo tên (ví dụ: red, green, blue, ...). Giá trị mặc định là "#0000FF".                                                                                                                                                                                                                                                                                        |
| strokeOpacity *optional* | number                                                                                    | chỉ định độ trong suốt của Polyline, khoảng giá trị của nó nằm trong khoảng từ 0.0 đến 1.0. Giá trị mặc định là 1.0                                                                                                                                                                                                                                                                                                                                               |
| visible *optional*       | boolean                                                                                   | xác định Polyline có thể ẩn hay hiện trên bản đồ. Giá trị mặc định là true.                                                                                                                                                                                                                                                                                                                                                                                       |
| closed *optional*        | string                                                                                    | chỉ định Polyline có nối điểm đầu và điểm cuối lại với nhau hay không. Giá trị mặc định là false. Nếu bạn chỉ định thuộc tính này bằng true thì bạn sẽ được một hình đa giác.                                                                                                                                                                                                                                                                                     |
| draggable *optional*     | number                                                                                    | cho phép người dùng có thể kéo Polyline trên bản đồ hay không. Giá trị mặc định là false.                                                                                                                                                                                                                                                                                                                                                                         |
| zIndex *optional*        | boolean                                                                                   | chỉ định thứ tự chồng nhau giữa các Polyline với nhau hoặc giữa Polyline với các đối tượng khác trên bản đồ. Giá trị mặc định là 0.                                                                                                                                                                                                                                                                                                                               |
| elevation *optional*     | number                                                                                    | chỉ định độ cao của Polyline so với mực nước biển, đơn vị là mét. Giá trị mặc định là 0                                                                                                                                                                                                                                                                                                                                                                           |
| strokePattern *optional* | [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)   | chỉ định kiểu vẽ của Polyline ([SolidPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=solidpattern-class), [DashPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dashpattern-class), [DotPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dotpattern-class) hay [IconPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=iconpattern-class)). Giá trị mặc định là `SolidPattern` |
| clickable *optional*     | boolean                                                                                   | cho phép người dùng có thể tương tác được với Polyline hay không. Giá trị mặc định là true. Khi không cho phép người dùng tương tác với Polyline thì tất cả các sự kiện liên quan tới Polyline từ phía người dùng sẽ không có tác dụng.                                                                                                                                                                                                                           |

## [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=patternitem)

Là một lớp trừu tượng dùng để định nghĩa các kiểu pattern cho line.

Chúng ta sẽ dùng các class triển khai sau để set pattern cho line:

- Class [SolidPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=solidpattern-class) : dùng để định nghĩa kiểu pattern liền mạch.
- Class [DashPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dashpattern-class) : dùng để định nghĩa kiểu pattern nét đứt.
- Class [DotPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dotpattern-class) : dùng để định nghĩa kiểu pattern chấm tròn.
- Class [IconPattern](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=iconpattern-class) : dùng để định nghĩa kiểu pattern cho phép người dùng gắn một image lên line, image này sẽ được lặp lại nếu độ dài ngắn hơn độ dài của line.

## [SolidPattern class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=solidpattern-class)

`map4d.SolidPattern` class

Lớp này kế thừa lớp [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)

Constructor

```
SolidPattern()
```




## [DashPattern class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=dashpattern-class)

`map4d.DashPattern` class

Lớp này kế thừa lớp [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)

Constructor

```
DashPattern(options)
```




- Parameters:
  - options: [DashPatternOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dashpatternoptions) *required*

## [DashPatternOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=dashpatternoptions)

Định nghĩa giao diện quy định hình dạng của nét đứt.

`map4d.DashPatternOptions` interface

```
interface DashPatternOptions { length: number gap: number }
```




| **No** | **Name** | **Description**            |
| ------ | -------- | -------------------------- |
| 1      | length   | Độ dài của nét đứt         |
| 2      | gap      | Khoảng hở giữa các nét đứt |

## [DotPattern class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=dotpattern-class)

`map4d.DotPattern` class

Lớp này kế thừa lớp [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)

Constructor

```
DotPattern(options)
```

- Parameters:
  - options: [DotPatternOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=dotpatternoptions) *required*

## [DotPatternOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=dotpatternoptions)

Định nghĩa giao diện quy định khoảng cách của các chấm tròn

`map4d.DotPatternOptions` interface

```
interface DotPatternOptions { repeat?: number }
```




| **No** | **Name** | **Description**                                                                                                                  |
| ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1      | repeat   | Khoảng cách giữa các chấm tròn, giá trị khoảng cách này được tính theo số lần đường kính của chấm tròn đó, giá trị mặc định là 1 |

## [IconPattern class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=iconpattern-class)

`map4d.IconPattern` class

Lớp này kế thừa lớp [PatternItem](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=patternitem)

Constructor

```
IconPattern(options)
```

- Parameters:
  - options: [IconPatternOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=iconpatternoptions) *required*

## [IconPatternOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=iconpatternoptions)

Định nghĩa giao diện để set image cho IconPattern.

`map4d.IconPatternOptions` interface

```
interface IconPatternOptions { url: string }
```




| **No** | **Name** | **Description**                                                                 |
| ------ | -------- | ------------------------------------------------------------------------------- |
| 1      | url      | set đường dẫn của image, hỗ trợ ảnh có alpha để tạo khoảng hở khi lặp lại image |
