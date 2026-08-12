## [Events](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events "Events")

Map4D Web SDK cung cấp các sự kiện của map hay tương tác của người dùng giúp cho nhà phát triển có thể lắng nghe và xử lý.

| **No** | **Event Name**   | **Description**                                                                                                               |
| ------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1      | cameraWillChange | Được gọi khi một trong các thông số camera (tâm, góc nghiêng, góc quay, mức zoom) của map chuẩn bị thay đổi                   |
| 2      | cameraChanging   | Được gọi khi một trong các thông số camera (tâm, góc nghiêng, góc quay, mức zoom) của map đang thay đổi                       |
| 3      | idle             | Được gọi khi các thông số camera (tâm, góc nghiêng, góc quay, mức zoom) của map kết thúc sự thay đổi                          |
| 4      | hover            | Được gọi khi rê chuột vào annotation hoặc đối tượng 3D                                                                        |
| 5      | click            | Được gọi khi có sự kiện click trên map, annotation hoặc đối tượng 3D                                                          |
| 6      | dblClick         | Được gọi khi click 2 lần chuột trái vào map, annotation hoặc đối tượng 3D                                                     |
| 7      | drag             | Được gọi khi map đang được giữ và kéo chuột trái                                                                              |
| 8      | dragStart        | Được gọi khi map bắt đầu được giữ và kéo chuột trái                                                                           |
| 9      | dragEnd          | Được gọi khi map kết thúc giữ và kéo chuột trái                                                                               |
| 10     | mouseMove        | Được gọi khi chuột di chuyển trên map                                                                                         |
| 11     | mouseOut         | Được gọi khi chuột di chuyển ra ngoài map                                                                                     |
| 12     | mouseOver        | Đưọc gọi khi chuột di chuyển từ ngoài vào trong map                                                                           |
| 13     | rightClick       | Được gọi khi click chuột phải trên map, annotation hoặc đối tượng 3D                                                          |
| 14     | tilesLoaded      | Được gọi khi tất cả các visible tiles đã load hoàn thành (visible tiles là tất cả tiles sẽ được hiển thị trên màn hình)       |
| 15     | longClick        | Được gọi khi giữ chuột trái trong 1 khoảng thời gian trên bản đồ                                                              |
| 16     | boundsChanged    | Được gọi khi viewport đã thay đổi                                                                                             |
| 17     | limitedZoom      | Được gọi khi người dùng thao tác zoom trên bản đồ đạt tới mức zoom giới hạn (max zoom, min zoom hoặc mức zoom 17 ở chế độ 3D) |
| 18     | targetChanged    | Được gọi khi vị trí tâm của camera thay đổi                                                                                   |
| 19     | zoomChanged      | Được gọi khi mức zoom thay đổi                                                                                                |
| 20     | tiltChanged      | Được gọi khi góc nghiêng của bản đồ thay đổi                                                                                  |
| 21     | bearingChanged   | Được gọi khi góc quay của bản đồ thay đổi                                                                                     |

## [Handling Events](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=handling-events)

Để đăng ký thông báo sự kiện, sử dụng phương thức addListener(event, func, options).

Trong đó:

- event: tên event (xem bảng trên)
- func: hàm sẽ được gọi với tham số *args* khi sự kiện được chỉ định xảy ra
- options: tùy chọn, dùng để xác định việc xử lý sự kiện chỉ hoạt động đối với các đối tượng được chỉ định (poi, building, marker, ...). Tham khảo [EventOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map)

Phương thức này trả về một đối tượng [MapsEventListener](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=mapseventlistener-interface)

### [Cách đăng ký event chung](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=c%c3%a1ch-%c4%91%c4%83ng-k%c3%bd-event-chung)

```
let event = map.addListener("event_name", (args) => { // action ... }, { location: true mappoi: true mapbuilding: true marker: true polygon: true polyline: true circle: true poi: true building: true place: true })
```

Chú ý:

- Đối với các event limitedZoom, mouseOver, mouseOut, idle, cameraChanging, cameraWillChange, tilesLoaded, boundsChanged thì *options* là không cần thiết.
- Event hover chỉ hoạt động với [marker](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker), [polygon](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polygon), [polyline](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/polyline), [circle](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/circle), [building](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/building)

### [Cách gỡ bỏ một event khi không sử dụng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=c%c3%a1ch-g%e1%bb%a1-b%e1%bb%8f-m%e1%bb%99t-event-khi-kh%c3%b4ng-s%e1%bb%ad-d%e1%bb%a5ng)

```
event.remove()
```

### [Tham số gọi hàm khi xảy ra sự kiện](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=tham-s%e1%bb%91-g%e1%bb%8di-h%c3%a0m-khi-x%e1%ba%a3y-ra-s%e1%bb%b1-ki%e1%bb%87n)

| **No** | **Event**                                                                                                                                                      | **args**                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | - cameraWillChange<br>- cameraChanging<br>- idle                                                                                                               | { `camera`: [CameraPosition](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map) }                                                                                                                                                                                                                                                                                                                         |
| 2      | - hover<br>- click *coordinate*<br>- rightClick<br>- dblClick<br>- longClick<br>- dragStart<br>- drag<br>- dragEnd<br>- mouseMove<br>- mouseOut<br>- mouseOver | {<br>    `location`: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng),<br>    `pixel`: [Point](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=point),<br>    `xa`: MouseEvent<br>}                                                                                                                                                                     |
| 3      | - limitedZoom                                                                                                                                                  | { `zoom`: number }                                                                                                                                                                                                                                                                                                                                                                                                |
| 4      | - tilesLoaded<br>- boundsChanged                                                                                                                               | none                                                                                                                                                                                                                                                                                                                                                                                                              |
| 5      | - click *mappoi*                                                                                                                                               | {<br>    `poi`: { `id`: string, `name`: string, `location`: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng), `type`: string }<br>    `location`: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng),<br>    `pixel`: [Point](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=point),<br>    `xa`: MouseEvent<br>}   |
| 6      | - click *mapbuilding*                                                                                                                                          | {<br>    `building`: { `id`: string, `name`: string, `location`: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) }<br>    `location`: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng),<br>    `pixel`: [Point](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=point),<br>    `xa`: MouseEvent<br>}              |
| 7      | - click *place*                                                                                                                                                | {<br>    `place`: { `id`: string, `name`: string, `location`: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng), `type`: string }<br>    `location`: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng),<br>    `pixel`: [Point](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=point),<br>    `xa`: MouseEvent<br>} |

### [Thay đổi EventOptions ở runtime](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=thay-%c4%91%e1%bb%95i-eventoptions-%e1%bb%9f-runtime)

Map4dMap JavaScript SDK cho phép thay đổi EventOptions ở runtime. Ví dụ: ta đăng ký một event nhận sự kiên click của marker, polygon và polyline.

```
let listener = map.addListener("click", (args) => { console.log(args) }, {marker: true, polygon: true, polyline: true})
```



Sau ta muốn đổi các sự kiện của listener ta sử dụng như sau:

```
listener.updateEventOptions({marker: true})
```

Sau khi sử dụng hàm trên thì listener chỉ nhận sự kiện click của marker không còn nhận sự kiện click của polygon và polyline nữa.

## [Example](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=example)

### [Click Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=click-map)

Ví dụ dưới đây lắng nghe sự kiện click chuột trái trên map và hiển thị một [marker](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/marker) ở vị trí được click

### [Click POI on Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=click-poi-on-map)

Ví dụ dưới đây lắng nghe sự kiện click chuột trái trên POI của Map4D và thực hiện hiển thị thông tin của POI được click

### [Click place on Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=click-place-on-map)

Ví dụ dưới đây lắng nghe sự kiện click chuột trái trên place của Map4D và thực hiện hiển thị thông tin của place được click

### [Usage](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=usage)

#### [Target Changed](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=target-changed)

```
map.addListener("targetChanged", () => { console.log("targetChanged") })
```

#### [Zoom Changed](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=zoom-changed)

```
map.addListener("zoomChanged", () => { console.log("zoomChanged") })
```




#### [Tilt Changed](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=tilt-changed)

```
map.addListener("tiltChanged", ()) => { console.log("tiltChanged") })
```




#### [Bearing Changed](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-events?id=bearing-changed)

```
map.addListener("bearingChanged", () => { console.log("bearingChanged") })
```

## [MapEvent enum](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=mapevent-enum)

Định nghĩa tất cả các sự kiện của Map.

`map4d.MapEvent` enum

```
enum MapEvent { cameraWillChange = 0, cameraChanging, idle, hover, click, dblClick, drag, dragEnd, dragStart, mouseMove, mouseOut, mouseOver, rightClick, tilesLoaded, longClick, boundsChanged, limitedZoom }
```




## [EventOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=eventoptions)

Định nghĩa các option cho các sự kiện của Map.

`map4d.EventOptions` interface

```
interface EventOptions { marker?: boolean polygon?: boolean polyline?: boolean circle?: boolean poi?: boolean building?: boolean location?: boolean mappoi?: boolean mapbuilding?: boolean }
```
