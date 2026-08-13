## [Measure](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure "Measure")

```



- Parameters:
  - path: [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng) *required*

Properties

| **Name**  | **Type**                                                                           | **Description**                                                           |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| length    | number                                                                             | Tổng độ dài của các đoạn thẳng tạo ra bởi danh sách tọa độ. Đơn vị: mét   |
| perimeter | number                                                                             | Chu vi của hình đa giác tạo ra bởi danh sách tọa độ. Đơn vị: mét          |
| area      | number                                                                             | Diện tích của hình đa giác tạo ra bởi danh sách tọa độ. Đơn vị: mét vuông |
| center    | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlng) | Tâm của đối tượng Measure                                                 |

Methods

| **Name** | **Parameters**                                                                           | **Return Value** | **Description**          |
| -------- | ---------------------------------------------------------------------------------------- | ---------------- | ------------------------ |
| setPath  | [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng) | none             | Đặt lại danh sách tọa độ |
| addPath  | [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng) | none             | Thêm danh sách tọa độ    |

## [1. Khởi tạo đối tượng Measure (path không cần khép kín)](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=_1-kh%e1%bb%9fi-t%e1%ba%a1o-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-measure-path-kh%c3%b4ng-c%e1%ba%a7n-kh%c3%a9p-k%c3%adn)

```
constructor(path: ILatLng[])
```



Ví dụ

```
let measure = new map4d.Measure([ [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], ])
```



## [2. Đặt lại danh sách tọa độ cho đối tượng Measure.](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=_2-%c4%90%e1%ba%b7t-l%e1%ba%a1i-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-cho-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-measure)

```
setPath(path: ILatLng[]): void
```



Ví dụ

```
let measure = new map4d.Measure([]) measure.setPath([ [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], ])
```



## [3. Thêm danh sách tọa độ cho đối tượng Measure](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=_3-th%c3%aam-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-cho-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-measure)

```
addPath(path: ILatLng[]): void
```



Ví dụ

```
let measure = new map4d.Measure([ [106.700147, 10.773201], [106.700763, 10.771783] ]) measure.addPath([ [106.701901, 10.772302], [106.701493, 10.773267], ])
```



## [4. Tính tổng độ dài của các đoạn thẳng tạo ra bởi danh sách tọa độ. Giá trị trả về tính bằng mét](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=_4-t%c3%adnh-t%e1%bb%95ng-%c4%91%e1%bb%99-d%c3%a0i-c%e1%bb%a7a-c%c3%a1c-%c4%91o%e1%ba%a1n-th%e1%ba%b3ng-t%e1%ba%a1o-ra-b%e1%bb%9fi-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-gi%c3%a1-tr%e1%bb%8b-tr%e1%ba%a3-v%e1%bb%81-t%c3%adnh-b%e1%ba%b1ng-m%c3%a9t)

```
get length(): number
```



Ví dụ

```
let measure = new map4d.Measure([ [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], ]) let length = measure.length
```



## [5. Tính chu vi của hình đa giác tạo ra bởi danh sách tọa độ. Giá trị trả về tính bằng mét](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=_5-t%c3%adnh-chu-vi-c%e1%bb%a7a-h%c3%acnh-%c4%91a-gi%c3%a1c-t%e1%ba%a1o-ra-b%e1%bb%9fi-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-gi%c3%a1-tr%e1%bb%8b-tr%e1%ba%a3-v%e1%bb%81-t%c3%adnh-b%e1%ba%b1ng-m%c3%a9t)

```
get perimeter(): number
```



Ví dụ

```
let measure = new map4d.Measure([ [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], ]) let perimeter = measure.perimeter
```



## [6. Tính diện tích của hình đa giác tạo ra bởi danh sách tọa độ. Giá trị trả về tính bằng mét vuông](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=_6-t%c3%adnh-di%e1%bb%87n-t%c3%adch-c%e1%bb%a7a-h%c3%acnh-%c4%91a-gi%c3%a1c-t%e1%ba%a1o-ra-b%e1%bb%9fi-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-gi%c3%a1-tr%e1%bb%8b-tr%e1%ba%a3-v%e1%bb%81-t%c3%adnh-b%e1%ba%b1ng-m%c3%a9t-vu%c3%b4ng)

```
get area(): number
```



Ví dụ

```
let measure = new map4d.Measure([ [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], ]) let area = measure.area
```



## [7. Lấy tâm của đối tượng Measure. Giá trị trả về là một LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=_7-l%e1%ba%a5y-t%c3%a2m-c%e1%bb%a7a-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-measure-gi%c3%a1-tr%e1%bb%8b-tr%e1%ba%a3-v%e1%bb%81-l%c3%a0-m%e1%bb%99t-latlng)

```
get center(): LatLng
```



Ví dụ

```
let measure = new map4d.Measure([ [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], ]) let center = measure.center
```



Ví dụ

```
let coordinateTransformer = new map4d.CoordinateTransformer([ [106.699380, 10.772431], [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], [106.702835, 10.773599] ]) let scale = 1.5 let latLngScaled = coordinateTransformer.scale(scale,[106.702835, 10.773599])
```
