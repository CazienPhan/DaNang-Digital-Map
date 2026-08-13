## [Projection](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection "Projection")

## [Projection class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=projection-class)

`map4d.Projection` class

Constructor

Tạo Projection với tham số là đối tượng `map`

```
Projection(map)
```




- Parameters:
  - map: [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=map-class) *required*

Methods

| **Name**           | **Parameters**                                                                                                                | **Return Value**                                                                      | **Description**                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| fromLatLngToScreen | latLng: [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng)<br>elevation?: number           | [Point](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=point)   | Chuyển đổi từ toạ độ LatLng sang toạ độ Screen |
| fromScreenToLatLng | screenCoordinate: [IPoint](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ipoint)<br>elevation?: number | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=latlng) | Chuyển đổi từ toạ độ Screen sang toạ độ LatLng |


Lớp [Projection](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=projection-class) được dùng để chuyển đổi giữa vị trí trên màn hình và tọa độ địa lý trên bề mặt trái đất và ngược lại.

## [1. Khởi tạo lớp Projection](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection?id=_1-kh%e1%bb%9fi-t%e1%ba%a1o-l%e1%bb%9bp-projection)

```
let projection = new map4d.Projection(map)
```



## [2. Chuyển đổi từ toạ độ LatLng sang toạ độ Screen](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection?id=_2-chuy%e1%bb%83n-%c4%91%e1%bb%95i-t%e1%bb%ab-to%e1%ba%a1-%c4%91%e1%bb%99-latlng-sang-to%e1%ba%a1-%c4%91%e1%bb%99-screen)

```
let screenCoordinate = projection.fromLatLngToScreen(new LatLng(10.771783, 106.700763))
```



## [3. Chuyển đổi từ toạ độ LatLng sang toạ độ Screen với elevation (meter)](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection?id=_3-chuy%e1%bb%83n-%c4%91%e1%bb%95i-t%e1%bb%ab-to%e1%ba%a1-%c4%91%e1%bb%99-latlng-sang-to%e1%ba%a1-%c4%91%e1%bb%99-screen-v%e1%bb%9bi-elevation-meter)

```
let target = new LatLng(10.771783, 106.700763) let elevation = 10 let screenCoordinate = projection.fromLatLngToScreen(target, elevation)
```



## [4. Chuyển đổi từ toạ độ Screen sang toạ độ LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection?id=_4-chuy%e1%bb%83n-%c4%91%e1%bb%95i-t%e1%bb%ab-to%e1%ba%a1-%c4%91%e1%bb%99-screen-sang-to%e1%ba%a1-%c4%91%e1%bb%99-latlng)

```
let latLngCoordinate = projection.fromScreenToLatLng({x: 100, y: 100})
```



## [5. Chuyển đổi từ toạ độ Screen sang toạ độ LatLng với elevation (meter)](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection?id=_5-chuy%e1%bb%83n-%c4%91%e1%bb%95i-t%e1%bb%ab-to%e1%ba%a1-%c4%91%e1%bb%99-screen-sang-to%e1%ba%a1-%c4%91%e1%bb%99-latlng-v%e1%bb%9bi-elevation-meter)

```
let screenCoordinate = {x: 100, y: 100} let elevation = 20 let latLngCoordinate = projection.fromScreenToLatLng(screenCoordinate, elevation)
```



## [6. Chuyển đổi tọa độ từ tọa độ LatLng sang tọa độ thế giới](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection?id=_6-chuy%e1%bb%83n-%c4%91%e1%bb%95i-t%e1%bb%8da-%c4%91%e1%bb%99-t%e1%bb%ab-t%e1%bb%8da-%c4%91%e1%bb%99-latlng-sang-t%e1%bb%8da-%c4%91%e1%bb%99-th%e1%ba%bf-gi%e1%bb%9bi)

```
let point = projection.fromLatLngToPoint(new LatLng(10.771783, 106.700763))
```



## [7. Chuyển đổi từ tọa độ thế giới sang tọa độ LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/projection?id=_7-chuy%e1%bb%83n-%c4%91%e1%bb%95i-t%e1%bb%ab-t%e1%bb%8da-%c4%91%e1%bb%99-th%e1%ba%bf-gi%e1%bb%9bi-sang-t%e1%bb%8da-%c4%91%e1%bb%99-latlng)

```
let latlng = projection.fromPointToLatLng({x: 100, y: 100})
```
