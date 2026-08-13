## [Coordinate Transformer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer "Coordinate Transformer")

## [CoordinateTransformer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=coordinatetransformer)

`map4d.CoordinateTransformer` class

Constructor

Tạo CoordinateTransformer với danh sách các tọa độ lat, lng được chỉ định

```
CoordinateTransformer(coordinates)
```



- Parameters:
  - coordinates: [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng) *required*

Properties

| **Name** | **Type**                                                                           | **Description**   |
| -------- | ---------------------------------------------------------------------------------- | ----------------- |
| center   | [LatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlng) | Tâm của đối tượng |

Methods

| **Name**       | **Parameters**                                                                                                                                                                                | **Return Value**                                                                       | **Description**                                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| setCoordinates | [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng)                                                                                                      | none                                                                                   | Đặt lại danh sách tọa độ                                                                                                                         |
| addCoordinates | [ILatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng)                                                                                                      | none                                                                                   | Thêm danh sách tọa độ                                                                                                                            |
| rotate         | degree: number<br>anchor?: [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng)                                                                               | [LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlng) | Xoay đối tượng một góc degree. Kết quả trả về là một [LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlng)      |
| translate      | target: [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng)<br>anchor?: [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng) | [LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latng)  | Dịch chuyển đối tượng đến một điểm. Kết quả trả về là một [LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latlng) |
| scale          | scale: number<br>anchor?: [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=ilatlng)                                                                                | [LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinates?id=latng)  | Thay đổi tỉ lệ đối tượng theo tâm                                                                                                                |


Lớp [CoordinateTransformer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=coordinatetransformer) dùng để lưu trữ một danh sách các vị trí tọa độ địa lý. Nó cho phép thực hiện các phép biến đổi danh sách các vị trí tọa độ địa lý đó như: Xoay, Dịch chuyển và thay đổi tỷ lệ.

## [1. Khởi tạo đối tượng CoordinateTransformer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer?id=_1-kh%e1%bb%9fi-t%e1%ba%a1o-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-coordinatetransformer)

```
constructor(coordinates: ILatLng[])
```



Ví dụ

```
let coordinateTransformer = new map4d.CoordinateTransformer([ [106.699380, 10.772431], [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], [106.702835, 10.773599] ])
```



## [2. Đặt lại danh sách tọa độ cho đối tượng CoordinateTransformer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer?id=_2-%c4%90%e1%ba%b7t-l%e1%ba%a1i-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-cho-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-coordinatetransformer)

```
setCoordinates(coordinates: ILatLng[]): void
```



Ví dụ

```
let coordinateTransformer = new map4d.CoordinateTransformer([]) coordinateTransformer.setCoordinates([ [106.699380, 10.772431], [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], [106.702835, 10.773599] ])
```



## [3. Thêm một danh sách tọa độ vào danh sách tọa độ hiện tại của đối tượng CoordinateTransformer](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer?id=_3-th%c3%aam-m%e1%bb%99t-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-v%c3%a0o-danh-s%c3%a1ch-t%e1%bb%8da-%c4%91%e1%bb%99-hi%e1%bb%87n-t%e1%ba%a1i-c%e1%bb%a7a-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-coordinatetransformer)

```
addCoordinates(coordinates: ILatLng[]): void
```



Ví dụ

```
let coordinateTransformer = new map4d.CoordinateTransformer([ [106.699380, 10.772431], [106.700147, 10.773201] ]) coordinateTransformer.addCoordinates([ [106.701901, 10.772302], [106.701493, 10.773267], [106.702835, 10.773599] ])
```



## [4. Lấy tâm của đối tượng CoordinateTransformer.](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer?id=_4-l%e1%ba%a5y-t%c3%a2m-c%e1%bb%a7a-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-coordinatetransformer)

```
get center(): LatLng
```



Ví dụ

```
let coordinateTransformer = new map4d.CoordinateTransformer([ [106.699380, 10.772431], [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], [106.702835, 10.773599] ]) let center = coordinateTransformer.center
```



## [5. Xoay đối tượng CoordinateTransformer một góc degree (tính bằng độ). Kết quả trả về một LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer?id=_5-xoay-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-coordinatetransformer-m%e1%bb%99t-g%c3%b3c-degree-t%c3%adnh-b%e1%ba%b1ng-%c4%91%e1%bb%99-k%e1%ba%bft-qu%e1%ba%a3-tr%e1%ba%a3-v%e1%bb%81-m%e1%bb%99t-latlng)

Xoay đối tượng CoordinateTransformer một góc so với điểm neo. Nếu anchor = null thì tâm đối tượng chính là điểm neo

```
rotate(degree: number, anchor?: ILatLng): LatLng[]
```



Ví dụ

```
let coordinateTransformer = new map4d.CoordinateTransformer([ [106.699380, 10.772431], [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], [106.702835, 10.773599] ]) let degree = 90 let latLngRotate = coordinateTransformer.rotate(degree, [106.702835, 10.773599]) // xoay đối tượng quay quanh điểm neo
```



## [6. Dịch chuyển đối tượng CoordinateTransformer tới một điểm target (LatLng hoặc ILatLng). Kết quả trả về là một LatLng\[\]](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer?id=_6-d%e1%bb%8bch-chuy%e1%bb%83n-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-coordinatetransformer-t%e1%bb%9bi-m%e1%bb%99t-%c4%91i%e1%bb%83m-target-latlng-ho%e1%ba%b7c-ilatlng-k%e1%ba%bft-qu%e1%ba%a3-tr%e1%ba%a3-v%e1%bb%81-l%c3%a0-m%e1%bb%99t-latlng)

Dịch chuyển đối tượng CoordinateTransformer tới 1 điểm so với điểm neo.

Nếu anchor = null thì tâm đối tượng chính là điểm neo.

```
translate(target: ILatLng, anchor?: ILatLng): LatLng[]
```



Ví dụ

```
let coordinateTransformer = new map4d.CoordinateTransformer([ [106.699380, 10.772431], [106.700147, 10.773201], [106.700763, 10.771783], [106.701901, 10.772302], [106.701493, 10.773267], [106.702835, 10.773599] ]) let target = new LatLng(10.6, 106.75) let latLngRotated = coordinateTransformer.translate(target,[106.702835, 10.773599])
```



## [7. Thay đổi tỉ lệ đối tượng CoordinateTransformer theo tâm.](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/coordinate-transformer?id=_7-thay-%c4%91%e1%bb%95i-t%e1%bb%89-l%e1%bb%87-%c4%91%e1%bb%91i-t%c6%b0%e1%bb%a3ng-coordinatetransformer-theo-t%c3%a2m)

Thay đổi tỷ lệ của đối tượng CoordinateTransformer so với điểm neo. Nếu anchor = null thì tâm đối tượng chính là điểm neo

```
scale(scale: number, anchor?: ILatLng): LatLng[]
```



[Measure](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/measure?id=measure)

Lớp [Measure](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=measure) dùng để tính toán khoảng cách, chu vi và diện tích theo danh sách tọa độ địa lý
