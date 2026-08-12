## [Coordinates](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates "Coordinates")

## [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlng)

`map4d.LatLng` class

Constructor

Tạo đối tượng LatLng vớ latitude and longitude

```
LatLng(latitude, longitude)
```



- Parameters
  - latitude: number *required*
  - longitude: number *required*

Properties

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| lat      | number   | latitude        |
| lng      | number   | longitude       |

Methods

| **Name**  | **Parameters**                                                                     | **Return Value** | **Description**                                                         |
| --------- | ---------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------- |
| equals    | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlng) | boolean          | So sánh bằng với một LatLng khác                                        |
| toString  | none                                                                               | string           |                                                                         |
| normalize | none                                                                               | LatLng           |                                                                         |
| valid     | none                                                                               | boolean          | Kiểm tra xem đối tượng LatLng đó có phải là một tọa độ hợp lệ hay không |

## [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng)

`map4d.ILatLng` type

```
type ILatLng = LatLng | {lat: number, lng: number} | [number, number]
```



- Trường hợp ILatLng là array thì giá trị ở vị trí `0` của mảng sẽ là *longitude*, còn giá trị ở vị trí `1` sẽ là *latitude*

## [LatLngBounds](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlngbounds)

`map4d.LatLngBounds` class

Constructor

Tạo đối tượng LatLngBounds với 2 tham số [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng)

```
LatLngBounds(southwest, northeast)
```



- Parameters
  - southwest: [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng) *required*
  - northeast: [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng) *required*

Methods

| **Name**     | **Parameters** | **Return Value** | **Description**                     |
| ------------ | -------------- | ---------------- | ----------------------------------- |
| getCenter    | none           | LatLng           | Get vị trí trung tâm của bounds     |
| getNortheast | none           | LatLng           | Get vị trí phía đông bắc của bounds |
| getSouthwest | none           | LatLng           | Get vị trí phía tây nam của bounds  |
| extend       | ILatLng        | LatLngBounds     | Mở rộng vùng tới vị trí mới         |

## [ILatLngBounds](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlngbounds)

`map4d.ILatLngBounds` type

```
type ILatLngBounds = LatLngBounds | [ILatLng, ILatLng] | [number, number, number, number]
```



## [Point](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=point)

`map4d.Point` class

Constructor

Tạo đối tượng Point với 2 giá trị x, y

```
Point(x, y)
```



- Parameters
  - x: number *required*
  - y: number *required*

Properties

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| x        | number   | coordinate      |
| y        | number   | coordinate      |

Methods

| **Name** | **Parameters**                                                                   | **Return Value** | **Description**                 |
| -------- | -------------------------------------------------------------------------------- | ---------------- | ------------------------------- |
| equals   | [Point](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=point) | boolean          | So sánh bằng với một Point khác |
| toString | none                                                                             | string           |                                 |

## [IPoint](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ipoint)

`map4d.IPoint` type

```
type IPoint = Point | {x: number, y: number} | [number, number]
```



## [Measure](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=measure)

`map4d.Measure` class

Constructor

Tạo Measure với danh sách các tọa độ lat, lng được chỉ định

```
Measure(path)
