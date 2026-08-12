## [Data Layer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer "Data Layer")

Map4D Web SDK cung cấp 1 data layer cho phép người dùng hiển thị dữ liệu không gian địa lý tùy ý, theo định dạng [GeoJSON](https://geojson.org/)

## [Thêm feature vào data layer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=th%c3%aam-feature-v%c3%a0o-data-layer)

Có 2 cách để thêm data layer vào Map4D

- Sử dụng hàm `addGeoJson` của đối tượng [data](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/data-layer?id=mapdata-class) trong [map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)
- Sử dụng hàm `add` của đối tượng [data](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/data-layer?id=mapdata-class) trong [map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class)

Dưới đây là ví dụ thêm data layer sử dụng hàm `addGeoJson`

Lưu ý: Hiện tại data layer chỉ hỗ trợ các kiểu sau:

- Polygon
- MultiPolygon
- LineString
- MultiLineString
- Point

## [Xóa feature khỏi data layer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=x%c3%b3a-feature-kh%e1%bb%8fi-data-layer)

Để xóa feature khỏi data layer chúng ta sử dụng hàm `remove`

```
// Thêm 1 danh sách features vào data layer let features = map.data.addGeoJson(geojsonString) // Xóa tất cả features khỏi data layer features.forEach((feature) => { map.data.remove(feature) })
```



## [Xóa tất cả các feature khỏi data layer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=x%c3%b3a-t%e1%ba%a5t-c%e1%ba%a3-c%c3%a1c-feature-kh%e1%bb%8fi-data-layer)

Để xóa tất cả các feature khỏi data layer chúng ta sử dụng hàm `clear`

```
map.data.clear()
```



## [References](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=references)

### [MapData class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=mapdata-class)

`map4d.MapData` class

Methods

| **Name**    | **Parameters**                                                                                                                                                                                                         | **Return Value**                                                                                              | **Description**                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| add         | feature: [Data.Feature](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=feature-class) \| [Data.FeatureOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=featureoptions-type) | [Data.Feature](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=feature-class)                | Thêm 1 feature vào Data Layer                         |
| addGeoJson  | geoJson: string                                                                                                                                                                                                        | [Data.Feature](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=feature-class)                | Thêm 1 hoặc nhiều feature vào Data Layer bằng geoJson |
| remove      | feature: [Data.Feature](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=feature-class)                                                                                                                | none                                                                                                          | Xóa feature khỏi Data Layer                           |
| clear       | none                                                                                                                                                                                                                   | none                                                                                                          | Xóa tất cả feature khỏi Data Layer                    |
| addListener | event: string \| [MapEvent](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=mapevent-enum)<br>func: Function                                                                                              | [MapsEventListener](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=mapseventlistener-interface) | Thêm sự kiên cho Data Layer                           |
| setMinZoom  | minZoom: number                                                                                                                                                                                                        | none                                                                                                          | Set mức zoom nhỏ nhất để hiển thị Data Layer          |
| getMinZoom  | none                                                                                                                                                                                                                   | number                                                                                                        | Get mức zoom nhỏ nhất có thể hiển thị Data Layer      |
| setMaxZoom  | maxZoom: number                                                                                                                                                                                                        | none                                                                                                          | Set mức zoom lớn nhất để hiển thị Data Layer          |
| getMaxZoom  | none                                                                                                                                                                                                                   | number                                                                                                        | Get mức zoom lớn nhất có thể hiển thị Data Layer      |

---

### [Data namespace](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=data-namespace)

#### [FeatureOptions type](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=featureoptions-type)

`map4d.Data.FeatureOptions` type

Properties

| **Name**   | **Type**                                                                                             | **Description**    |
| ---------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| id         | number \| string                                                                                     | Feature id         |
| geometry   | [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface) | Feature geometry   |
| properties | any                                                                                                  | Feature properties |

---

#### [Feature class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=feature-class)

`map4d.Data.Feature` class

Constructor

Tạo Data.Feature với các tham số được chỉ định

```
Data.Feature(id, geometry, properties)
```



- Parameters:
  - id: number | string *required*
  - geometry: Geometry *required*
  - properties: any *required*

Methods

| **Name**      | **Parameters** | **Return Value**                                                                                     | **Description**        |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| getId         | none           | number \| string                                                                                     | Get feature id         |
| getGeometry   | none           | [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface) | Get feature geometry   |
| getProperties | none           | any                                                                                                  | Get feature properties |

---

#### [Geometry interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface)

`map4d.Data.Geometry` interface

Geometry là một giao diện chung dành cho các đối tượng:

- Point
- MultiPoint
- LineString
- MultiLineString
- Polygon
- MultiPolygon

---

#### [Point class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=point-class)

`map4d.Data.Point` class là một [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface)

Constructor

Tạo Data.Point với coordinate được chỉ định

```
Data.Point(coordinate)
```



- Parameters:
  - coordinate: [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) *required*

Methods

| **Name**      | **Parameters**                     | **Return Value**                                                                      | **Description**                                            |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| getType       | none                               | string                                                                                | "Point"                                                    |
| forEachLatLng | callback: function(LatLng) => void | none                                                                                  | Gọi xử lý `callback` với tham số là `coordinate` của Point |
| get           | none                               | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) | Get `coordinate` của Point                                 |

---

#### [MultiPoint class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=multipoint-class)

`map4d.Data.MultiPoint` class là một [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface)

Constructor

Tạo Data.MultiPoint với coordinates được chỉ định

```
Data.MultiPoint(coordinates)
```



- Parameters:
  - coordinates: [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) *required*

Methods

| **Name**      | **Parameters**                     | **Return Value**                                                                          | **Description**                                                               |
| ------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| getType       | none                               | string                                                                                    | "MultiPoint"                                                                  |
| forEachLatLng | callback: function(LatLng) => void | none                                                                                      | Duyệt qua các LatLng của mỗi element trong MultiPoint và gọi xử lý `callback` |
| getAt         | n: number                          | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng)     | Get LatLng ở vị trí `n`                                                       |
| getArray      | none                               | [LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) | Get coordinates                                                               |
| getLength     | none                               | number                                                                                    | Get tổng số coordinates hiện có của đối tượng MultiPoint                      |

---

#### [LineString class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=linestring-class)

`map4d.Data.LineString` class là một [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface)

Constructor

Tạo Data.LineString với các elements được chỉ định

```
Data.LineString(elements)
```



- Parameters:
  - elements: [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) *required*

Methods

| **Name**      | **Parameters**                     | **Return Value** | **Description**                                               |
| ------------- | ---------------------------------- | ---------------- | ------------------------------------------------------------- |
| getType       | none                               | string           | "LineString"                                                  |
| forEachLatLng | callback: function(LatLng) => void | none             | Duyệt qua các elements của LineString và gọi xử lý `callback` |

---

#### [MultiLineString class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=multilinestring-class)

`map4d.Data.MultiLineString` class là một [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface)

Constructor

Tạo Data.MultiLineString với các elements được chỉ định

```
Data.MultiLineString(elements)
```



- Parameters:
  - elements: [Data.LineString\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=linestring-class) *required*

Methods

| **Name**      | **Parameters**                     | **Return Value**                                                                                     | **Description**                                                                    |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| getType       | none                               | string                                                                                               | "MultiLineString"                                                                  |
| forEachLatLng | callback: function(LatLng) => void | none                                                                                                 | Duyệt qua các LatLng của mỗi element trong MultiLineString và gọi xử lý `callback` |
| getAt         | n: number                          | [Data.LineString](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=linestring-class) | Get LineString ở vị trí `n`                                                        |
| getLength     | none                               | number                                                                                               | Get tổng số LineString hiện có của đối tượng MultiLineString                       |

---

#### [LinearRing class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=linearring-class)

`map4d.Data.LinearRing` class

Constructor

Tạo Data.LinearRing với các elements được chỉ định

```
Data.LinearRing(elements)
```



- Parameters:
  - elements: [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) *required*

Properties

| **Name** | **Type**                                                                                    | **Description** |
| -------- | ------------------------------------------------------------------------------------------- | --------------- |
| elements | [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) |                 |

---

#### [Polygon class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=polygon-class)

`map4d.Data.Polygon` class là một [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface)

Constructor

Tạo Data.Polygon với các elements được chỉ định

```
Data.Polygon(elements)
```



- Parameters:
  - elements: [LinearRing](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=linearring-class) *required*

Methods

| **Name**      | **Parameters**                     | **Return Value** | **Description**                                            |
| ------------- | ---------------------------------- | ---------------- | ---------------------------------------------------------- |
| getType       | none                               | string           | "Polygon"                                                  |
| forEachLatLng | callback: function(LatLng) => void | none             | Duyệt qua các elements của Polygon và gọi xử lý `callback` |

---

#### [MultiPolygon class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=multipolygon-class)

`map4d.Data.MultiPolygon` class là một [Data.Geometry](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=geometry-interface)

Constructor

Tạo Data.MultiPolygon với các elements được chỉ định

```
Data.MultiPolygon(elements)
```



- Parameters:
  - elements: [Data.Polygon\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=polygon-class) *required*

Methods

| **Name**      | **Parameters**                     | **Return Value**                                                                               | **Description**                                                                 |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| getType       | none                               | string                                                                                         | "MultiPolygon"                                                                  |
| forEachLatLng | callback: function(LatLng) => void | none                                                                                           | Duyệt qua các LatLng của mỗi element trong MultiPolygon và gọi xử lý `callback` |
| getAt         | n: number                          | [Data.Polygon](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/data-layer?id=polygon-class) | Get Polygon ở vị trí `n`                                                        |
| getLength     | none                               | number                                                                                         | Get tổng số polygon hiện có của đối tượng MultiPolygon                          |
