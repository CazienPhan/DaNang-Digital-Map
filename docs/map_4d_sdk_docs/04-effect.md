## [Effect](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-effects "Effect")

Map4D Web SDK cung cấp các hiệu ứng 3D khi map ở chế độ 3D, bao gồm:

- Hiệu ứng mặt nước
- Hiệu ứng thời tiết
- Hiệu ứng thời gian trong ngày

## [Hiệu ứng mặt nước](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-effects?id=hi%e1%bb%87u-%e1%bb%a9ng-m%e1%ba%b7t-n%c6%b0%e1%bb%9bc)

Hiệu ứng mặt nước sẽ tạo các gợn sóng lăn tăn tại những nơi là sông hoặc biển. Ở chế độ mặc định, Map4D sẽ tắt chức năng này

Để bật/ tắt hiệu ứng mặt nước, ta gọi phương thức `setWaterEffect` từ đối tượng `Map`

```
map.setWaterEffect(enabled: boolean)
```



Example:

## [Hiệu ứng thời tiết](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-effects?id=hi%e1%bb%87u-%e1%bb%a9ng-th%e1%bb%9di-ti%e1%ba%bft)

Map4dMap JavaScript SDK cho phép người dùng cài đặt các hiệu ứng theo thời gian thực hoặc thủ công.

Các loại thời tiết:

| **Name** | **TypeScript** | **Description**                                                                                   |
| -------- | -------------- | ------------------------------------------------------------------------------------------------- |
| none     | Weather.None   | Không có hiệu ứng thời tiết                                                                       |
| rainy    | Weather.Rainy  | Hiệu ứng mưa                                                                                      |
| snowy    | Weather.Snowy  | Hiệu ứng tuyết rơi                                                                                |
| sunny    | Weather.Sunny  | Hiệu ứng thời tiết có nắng                                                                        |
| cloudy   | Weather.Cloudy | Hiệu ứng thời tiết có mây                                                                         |
| live     | Weather.Live   | Hiệu ứng thời tiết tự động cập nhật theo thời gian thực bằng hệ thống cảm biến đã có ở một số nơi |

Để cài đặt hiệu ứng thời tiết trên bản đồ, ta gọi phương thức `setWeather` từ đối tượng `Map`
Phương thức `setWeather` nhận vào giá trị là tên thời tiết hoặc giá trị enum [Weather](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=weather-enum) và một interface [WeatherProvider](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=weatherprovider-interface)

```
map.setWeather(weather)
```

Example:

Set thời tiết với kiểu thời tiết cụ thể thì ta có thể set như sau (không cần tham số `WeatherProvider`):

```
map.setWeather("rainy") map.setWeather(map4d.Weather.Snowy)
```

Nếu bạn muốn set kiểu thời tiết `Live` thì phải cung cấp thêm tham số `WeatherProvider`:

```
let weatherProvider: map4d.WeatherProvider = { refreshTime: 120,//second getWeather: function(location, callback) { // Source code xử lý lấy thời tiết từ server của bạn let weather = map4d.Weather.Snowy // Ex: server trả về là snowy // Sau đó Gọi hàm callback với giá trị thời tiết trả về từ server callback(weather); } } map.setWeather(map4d.Weather.Live, weatherProvider)
```

## [Hiệu ứng thời gian trong ngày](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map-effects?id=hi%e1%bb%87u-%e1%bb%a9ng-th%e1%bb%9di-gian-trong-ng%c3%a0y)

Map4dMap JavaScript SDK cho phép thay đổi hiệu ứng theo thời gian trong ngày của bản đồ thành sáng, trưa, chiều, tối...
Tùy thuộc thời gian trong ngày mà vị trí đổ bóng sẽ khác nhau và màu sắc của ánh sáng sẽ khác nhau.

Các loại hiệu ứng thời gian:

| **Name**  | **TypeScript**       | **Description**                     |
| --------- | -------------------- | ----------------------------------- |
| none      | TimeEffect.None      | Không có hiệu ứng thời gian         |
| live      | TimeEffect.Live      | Hiệu ứng thời gian được lấy tự động |
| morning   | TimeEffect.Morning   | Hiệu ứng buổi sáng                  |
| noon      | TimeEffect.Noon      | Hiệu ứng buổi trưa                  |
| afternoon | TimeEffect.Afternoon | Hiệu ứng buổi chiều                 |
| evening   | TimeEffect.Evening   | Hiệu ứng buổi tối                   |

Để cài đặt hiệu ứng thời gian trên bản đồ, ta gọi phương thức `setTimeEffect` từ đối tượng `Map`
Phương thức `setTimeEffect` nhận vào giá trị là tên hiệu ứng thời gian hoặc giá trị enum [TimeEffect](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=timeeffect-enum)

```
map.setTimeEffect(effect)
```

Example:

```
map.setTimeEffect("morning") map.setTimeEffect(map4d.TimeEffect.Evening)
```

## [Weather enum](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=weather-enum)

Định nghĩa các kiểu thời tiết để thiết lập cho Map.

`map4d.Weather` enum

```
enum Weather { Rainy = 0, Snowy, Sunny, Cloudy, Live, None }
```




## [WeatherProvider interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=weatherprovider-interface)

Định nghĩa interface để lấy dữ liệu thời tiết từ server khi thiết lập kiểu thời tiết `Live`. Các kiểu thời tiết khác thì không cần đến interface này.

`map4d.WeatherProvider` interface

```
interface WeatherProvider { refreshDistance?: number,//metter refreshTime?: number,//seconds getWeather: (location: LatLng, callback: (weather: number | string | Weather) => void) => void }
```




| **No** | **Name**        | **Description**                                                                    |
| ------ | --------------- | ---------------------------------------------------------------------------------- |
| 1      | refreshDistance | Khoảng cách mà thời tiết được cập nhật khi người dùng di chuyển Map, đơn vị là mét |
| 2      | refreshTime     | Khoảng thời gian mà thời tiết được cập nhật, đơn vị là giây                        |
| 3      | getWeather      | Là hàm trả về giá trị thời tiết mà bạn có thể tùy chọn xử lý                       |

## [TimeEffect enum](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=timeeffect-enum)

Định nghĩa các kiểu thời gian để thiết lập cho Map.

`map4d.TimeEffect` enum

```
enum TimeEffect { Live, Morning, Noon, AfterNoon, Evening, None }
```




## [MapType](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/map?id=maptype)

`map4d.MapType` enum

Định nghĩa các kiểu của bản đồ

```
enum MapType { roadmap = "roadmap", satellite = "satellite", hybrid = "hybrid", }
```
