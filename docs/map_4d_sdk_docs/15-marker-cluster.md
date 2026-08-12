## [Marker Cluster](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker-cluster "Marker Cluster")

Khi bạn thêm rất nhiều marker lên bản đồ thì việc gom các marker gần nhau lại thành từng nhóm theo từng mức zoom sẽ giúp việc hiển thị được rõ ràng và đỡ rối rắm hơn cho người xem. Và để thực hiện điều đó thì Map4D SDK cung cấp cho bạn một lớp là MarkerClusterer

### [1. Thêm một Marker Clusterer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker-cluster?id=_1-th%c3%aam-m%e1%bb%99t-marker-clusterer)

Hàm khởi tạo của lớp map4d.MarkerClusterer cần truyền vào 2 đối tượng là:

- Mảng các marker cần đưa vào MarkerClusterer.
- map4d.MarkerClusterOptions để định nghĩa các thuộc tính ban đầu của MarkerClusterer.

Đối tượng MarkerClusterOptions được định nghĩa như sau:

```
interface MarkerClusterOptions { minZoom?: number maxZoom?: number radius?: number zoomOnClick?: boolean clusterIcon?: Function | map4d.Icon | string }
```



Các thuộc tính của MarkerClusterOptions :

- minZoom (tùy chọn) : chỉ định mức zoom nhỏ nhất mà các marker có thể hiển thị theo từng nhóm. Giá trị mặc định là 0
- maxZoom (tùy chọn) : chỉ định mức zoom lớn nhất mà các marker có thể hiển thị theo từng nhóm. Giá trị mặc định là 22
- radius (tùy chọn) : chỉ định bán kính của cluster theo đơn vị pixel. Giá trị mặc định là 100.
- zoomOnClick (tùy chọn) : chỉ định bản đồ có thể zoom khi người dùng click vào đối tượng MarkerClusterer không. Giá trị mặc định là true
- clusterIcon (tùy chọn) : cho phép tùy chỉnh cluster icon.

Ví dụ sau đây thêm một MarkerClusterer vào bản đồ:

Ví dụ trên như một minh họa đơn giản cho MarkerClusterer. Trước tiên nó sẽ tạo một mảng các markers từ mảng locations, sau đó sẽ khởi tạo đối tượng MarkerClusterer từ mảng marker này.

Số trên các nhóm MarkerClusterer cho biết nó chứa bao nhiêu Marker. Khi bạn phóng to vào bất kỳ nhóm nào thì số trên nhóm sẽ giảm và các Marker riêng lẻ sẽ hiện ra trên bản đồ, khi bạn thu nhỏ thì ngược lại.

Nếu bạn set zoomOnClick là true thì khi bạn click vào đối tượng MarkerClusterer thì nó sẽ hiển thị các Marker trong nhóm đó thành các Marker riêng lẻ trên bản đồ với mức zoom phù hợp.

### [2. Xóa Marker Clusterer khỏi bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker-cluster?id=_2-x%c3%b3a-marker-clusterer-kh%e1%bb%8fi-b%e1%ba%a3n-%c4%91%e1%bb%93)

Để xóa một MarkerClusterer ra khỏi bản đồ, hãy gọi phương thức setMap() và truyền vào đối số null

```
markerClusterer.setMap(null)
```



Lưu ý rằng cách trên không xóa MarkerClusterer. Nó chỉ xóa MarkerClusterer ra khỏi bản đồ. Nếu bạn muốn xóa MarkerClusterer, bạn nên xóa nó khỏi bản đồ, sau đó bạn gán marker bằng null.

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker-cluster?id=reference)

### [Marker Clusterer Class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker-cluster?id=marker-clusterer-class)

`map4d.MarkerClusterer` class

Constructor

Tạo MarkerClusterer với mảng [Marker](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/marker?id=marker-class) và các options được chỉ định

```
MarkerClusterer(Marker[], options)
```



- Parameters:
  - Marker[]: Mảng các marker cần đưa vào MarkerClusterer.
  - options: [MarkerClusterOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/marker-cluster?id=marker-clusterer-options) *required*

Methods

| **Name**       | **Parameters**                                                                | **Return Value** | **Description**                                                                              |
| -------------- | ----------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| setMap         | [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class) | none             | Thêm marker cluster vào map, nếu set map là null thì marker cluster sẽ bị xóa khỏi map       |
| setZoomOnClick | boolean                                                                       | none             | Set giá trị cho phép phóng to bản đồ khi người dùng click để hiển tất cả các Marker trong nó |

### [Marker Clusterer Options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker-cluster?id=marker-clusterer-options)

`map4d.MarkerOptions` interface

Đối tượng MarkerClusterOptions dùng để xác định các thuộc tính dùng cho MarkerClusterer.

Properties

| **Name**               | **Type** | **Description**                                                                                 |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| minZoom *optional*     | number   | chỉ định mức zoom nhỏ nhất mà các marker có thể hiển thị theo từng nhóm. Giá trị mặc định là 0  |
| maxZoom *optional*     | number   | chỉ định mức zoom lớn nhất mà các marker có thể hiển thị theo từng nhóm. Giá trị mặc định là 22 |
| radius *optional*      | number   | chỉ định bán kính của cluster theo đơn vị pixel. Giá trị mặc định là 100.                       |
| zoomOnClick *optional* | boolean  | chỉ định bản đồ có thể zoom khi người dùng click vào đối tượng MarkerClusterer không.           |
