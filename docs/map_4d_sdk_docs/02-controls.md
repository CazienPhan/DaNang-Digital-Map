## [Controls](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-controls "Controls")

## [Các thao tác trên bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-controls?id=c%c3%a1c-thao-t%c3%a1c-tr%c3%aan-b%e1%ba%a3n-%c4%91%e1%bb%93)

### [Thao tác với chuột](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-controls?id=thao-t%c3%a1c-v%e1%bb%9bi-chu%e1%bb%99t)

- Chọn đối tượng hay một vị trí bất kỳ trên map
  - *Click chuột trái để chọn đối tượng hay một vị trí bất kỳ trên map.*
- Di chuyển map
  - *Giữ và di chuyển chuột trái để di chuyển map.*
- Xoay map
  - *Giữ và di chuyển chuột phải sang trái sang phải để xoay map.*
- Nghiêng map
  - *Giữ và di chuyển chuột phải lên xuống để nghiêng map.*
- Phóng to 1 mức zoom
  - *Click đúp chuột trái để tăng 1 mức zoom.*
- Thu phóng map
  - *Cuộn (scroll hoặc wheel) lên cuộn xuống để thay đổi mức zoom.*

### [Thao tác bằng touch](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-controls?id=thao-t%c3%a1c-b%e1%ba%b1ng-touch)

- Chọn đối tượng hay một vị trí bất kỳ trên map
  - *Touch để chọn đối tượng hay một vị trí bất kỳ trên map.*
- Di chuyển map
  - *Touch và di chuyển ngón tay để di chuyển map.*
- Xoay map
  - *Dùng hai ngón tay di chuyển theo đường tròn để xoay map.*
- Nghiêng map
  - *Dùng 2 ngón tay đẩy lên xuống để nghiêng map.*
- Phóng to 1 mức zoom
  - *Touch 2 lần để tăng 1 mức zoom.*
- Thu phóng map
  - *Dùng 2 ngón tay di chuyển trái chiều để di chuyển map.*

### [Thao tác bằng bàn phím (keyboard)](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-controls?id=thao-t%c3%a1c-b%e1%ba%b1ng-b%c3%a0n-ph%c3%adm-keyboard)

- Di chuyển map
  - *Sử dụng các phím mũi tên để di chuyển map.*
- Xoay map
  - *Shift+⇢: Xoay map sang trái.*
  - *Shift+⇠: Xoay map sang phải.*
- Nghiêng map
  - *Shift+⇡: Tăng độ nghiêng của map thêm 10 độ.*
  - *Shift+⇣: Giảm độ nghiêng của map xuống 10 độ.*
- Thu phóng map
  - *= / +: Tăng mức thu phóng map lên 1 mức.*
  - *Shift-= / Shift-+: Tăng mức thu phóng map lên 2 mức.*
  - *-: Giảm mức thu phóng map xuống 1 mức.*
  - *Shift--: Giảm mức thu phóng map xuống 2 mức.*

## [Các phần tử điều khiển trên bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-controls?id=c%c3%a1c-ph%e1%ba%a7n-t%e1%bb%ad-%c4%91i%e1%bb%81u-khi%e1%bb%83n-tr%c3%aan-b%e1%ba%a3n-%c4%91%e1%bb%93)

Bản đồ được hiển thị thông qua Map4D Web SDK có chứa các phần tử cho phép người dùng tương tác với bản đồ.
Các phần tử này có thể được ẩn/hiện thông qua [options](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=mapoptions-interface) khi khởi tạo bản đồ.
Mặc định các phần tử này sẽ không được hiển thị

Dưới đây là bản đồ hiển thị bảng điều khiển nằm ở vị trí phía dưới bên trái của bản đồ:

Các phần tử điều khiển được cung cấp sẵn của Map4D:

- zoom: thay đổi mức zoom của map, gồm zoom in  và zoom out 
- direction: hiển thị hướng của bản đồ đang hiển thị 
- geolocate: lấy vị trí hiện tại của người dùng 

### [Hiển thị bảng điều khiển trên bản đồ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-controls?id=hi%e1%bb%83n-th%e1%bb%8b-b%e1%ba%a3ng-%c4%91i%e1%bb%81u-khi%e1%bb%83n-tr%c3%aan-b%e1%ba%a3n-%c4%91%e1%bb%93)

- Để hiển thị bẳng điều khiển *(bao gồm zoom, direction, 3D button)* ta set thuộc tính `controls` là `true` khi khởi tạo map
- Để hiển thị `geolocate`, ta set thuộc tính `geolocate` là `true`
- Để thiết lập vị trí hiển thị của bảng điều khiển, ta set giá trị cho thuộc tính `controlOptions`. Map4D Web SDK cung cấp 4 vị trí hiển thị là: `TOP_LEFT`, `TOP_RIGHT`, `BOTTOM_LEFT`, `BOTTOM_RIGHT`. Tham khảo: [ControlOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=controloptions-enum)

```
let options = { center: {lat: 16.051158793373546, lng: 108.22926387306055}, zoom: 15, controls: true, geolocate: true, controlOptions: map4d.ControlOptions.BOTTOM_LEFT }
```

## [ControlOptions enum](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=controloptions-enum)

Để thiết lập vị trí của bảng điều khiển ta sử dụng ControlOptions

`map4d.ControlOptions` enum

```
enum ControlOptions { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT }
```




| **No** | **Name**      | **Description**                              |
| ------ | ------------- | -------------------------------------------- |
| 1      | TOP\_LEFT     | Hiển thị bảng điều khiển ở góc trên bên trái |
| 2      | TOP\_RIGHT    | Hiển thị bảng điều khiển ở góc trên bên phải |
| 3      | BOTTOM\_LEFT  | Hiển thị bảng điều khiển ở góc dưới bên trái |
| 4      | BOTTOM\_RIGHT | Hiển thị bảng điều khiển ở góc dưới bên phải |
