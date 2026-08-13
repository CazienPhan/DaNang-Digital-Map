## [WebGL Overlay View](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay "WebGL Overlay View")

Với WebGL Overlay View chúng ta có thể thêm đối tượng vào Map bằng các thư viện đồ họa phổ biến như Three.js. WebGL Overlay View cung cấp quyền truy cập trực tiếp vào cùng một WebGL context mà Map4D Map SDK sử dụng để render base map. Việc sử dụng chung WebGL context này cung cấp các lợi ích như vẽ chung các đối tượng 3D từ thư viện với các đối tượng 3D có sẵn trên map với các hiệu ứng chiều sâu và che lấp của hình học không gian, và khả năng đồng bộ các đối tượng 2D/3D với base map. Các đối tượng được render WebGL Overlay View cũng có thể được gắn với tạo độ kinh độ / vĩ độ, vì vậy chúng sẽ di chuyển khi chúng ta kéo, phóng to, xoay hoặc nghiêng map.

## [Add WebGL Overlay View](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=add-webgl-overlay-view)

Để thêm 1 WebGL Overlay View vào map cần tạo mới 1 đối tượng của lớp [WebGLOverlayView](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/webgl-overlay?id=webgloverlayview-class) sau đó set `map` cho WebGL Overlay View đó.
Hàm khởi tạo của lớp [WebGLOverlayView](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/webgl-overlay?id=webgloverlayview-class) nhận vào một đối tượng [WebGLOverlayViewOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/building-overlay?id=buildingoverlayoptions-interface)

### [Tạo mới WebGL Overlay View](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=t%e1%ba%a1o-m%e1%bb%9bi-webgl-overlay-view)

```
let options = { onAdd: (map, gl) => { // Thiết lập các đối tượng cần thiết để chuẩn bị render. }, onDraw: (gl) => { // Render tất cả các object }, onRemove: () => { // Remove tất cả các object } } let overlay = new map4d.WebGLOverlayView(options)
```



### [Add WebGL Overlay View lên Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=add-webgl-overlay-view-l%c3%aan-map)

Để add WebGL Overlay View lên map, ta set map cho WebGL Overlay View bằng hàm `setMap`

```
overlay.setMap(map)
```



### [Remove WebGL Overlay View](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=remove-webgl-overlay-view)

Để xóa WebGL Overlay View khỏi map, ta gọi hàm `setMap` và truyền vào giá trị `null`

```
overlay.setMap(null)
```



## [Lifecycle callback](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=lifecycle-callback)

WebGL Overlay View cung cấp 3 callback được gọi vào các thời điểm khác nhau trong lifecycle của đối tượng. Các lifecycle callback này là nơi chúng ta thiết lập, render và hủy bỏ bất cứ thứ gì chúng ta muốn hiển thị trong WebGL Overlay View.

- onAdd(map, gl) được gọi 1 lần khi overlay được thêm vào Map. Sử dụng callback này để khởi tạo các đối tượng cần thiết hoặc các dữ liệu trung gian trước khi overlay được render. Callback `onAdd()` có 2 parameters như sau:
  - map là đối tượng `Map4D`
  - gl là đối tượng WebGLRenderingContext được sử dụng bởi base map của `Map4D`
- onDraw(gl): được gọi sau callback onAdd(). Nó sẽ được gọi liên tục và đồng bộ với renderer của `Map4D` để render đối tượng `WebGLOverlayView` lên trên base map. Parameters duy nhất của callback onDraw() là đối tượng WebGLRenderingContext được sử dụng chung với base map của `Map4D`
- onRemove() được gọi khi overlay bị xóa khỏi bản đồ với WebGLOverlayView\.setMap(null), và đây là nơi chúng ta nên xóa tất cả các đối tượng trung gian.

## [Reset trạng thái của GL](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=reset-tr%e1%ba%a1ng-th%c3%a1i-c%e1%bb%a7a-gl)

WebGL Overlay View dùng chung WebGL rendering context của base map. Vì thế, điều cực kỳ quan trọng là chúng ta phải reset lại trạng thái GL về trạng thái ban đầu của nó khi bạn hoàn thành việc render các đối tượng. Việc không reset trạng thái GL có khả năng dẫn đến xung đột trạng thái GL, điều này sẽ gây ra lỗi khi render Map hay bất kể đối tượng nào.

Reset lại trạng thái GL thường được xử lý trong hàm `onDraw()` callback. Ví dụ, `Three.js` sẽ cung cấp một chức năng giúp xóa mọi thay đổi đối với trạng thái GL:

```
onDraw: (gl) => { // Chỉ định một đối tượng để render. renderer.render(scene, camera); renderer.resetState(); }
```



Nếu base map hoặc các đối tượng bị lỗi khi render hoặc không render, rất có khả năng trạng thái GL chưa được reset.

## [Biến đổi hệ tọa độ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=bi%e1%ba%bfn-%c4%91%e1%bb%95i-h%e1%bb%87-t%e1%bb%8da-%c4%91%e1%bb%99)

Vị trí của một đối tượng trên bản đồ được chỉ định bằng cách cung cấp một bộ data kết hợp giữa vĩ độ và kinh độ, độ cao, góc quay cũng như tỉ lệ scale của đối tượng đó. Tuy nhiên, trong đồ họa 3D vị trí đó được chỉ định bởi world space, camera space hoặc screen space. Để dễ dàng chuyển đổi tọa độ bản đồ thành các space được sử dụng phổ biến này, thì chúng ta có hàm `calculateProjectMatrixForWebGL(webGLPositionData)` cung cấp bởi đối tượng [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class) với param truyền vào là đối tượng [WebGLPositionData](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/webgl-overlay?id=webglpositiondata-interface) và trả về là một Float32Array.

Khi đối tượng overlay không nằm trong camera của base map `Map4D` thì hàm `calculateProjectMatrixForWebGL(webGLPositionData)` sẽ trả về một Float32Array rỗng.

Ví dụ sau đây sử dụng hàm `calculateProjectMatrixForWebGL()` để tạo projection matrix cho camera trong `Three.js`:

```
const camera = new THREE.PerspectiveCamera(); let matrix = this.map.calculateProjectMatrixForWebGL({ position: [106.704497, 10.769589], elevation: 20, scale: 0.1, bearing: 22 }) camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
```



## [Ví dụ](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=v%c3%ad-d%e1%bb%a5)

Sau đây là một ví dụ về việc sử dụng `Three.js`, một thư viện WebGL mã nguồn mở phổ biến, để đặt một đối tượng 3D lên map.

```
import * as THREE from 'three' import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js' let scene, renderer, camera, loader; let webGLOverlay = new map4d.WebGLOverlayView({ onAdd: (map, gl) => { // Set up the Three.js scene. camera = new THREE.PerspectiveCamera() scene = new THREE.Scene() // create two three.js lights to illuminate the model let directionalLight = new THREE.DirectionalLight(0xffffff); directionalLight.position.set(0, -70, 100).normalize(); scene.add(directionalLight); let directionalLight2 = new THREE.DirectionalLight(0xffffff); directionalLight2.position.set(0, 70, 100).normalize(); scene.add(directionalLight2); // Load the 3D model with GLTF Loader from Three.js. let loader = new GLTFLoader() loader.load( 'model.gltf', gltf => { scene.add(gltf.scene) map.requestRender() } ) renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true }) renderer.autoClear = false }, onDraw: (gl) => { if (this.map.getMapType() != map4d.MapType.satellite) { // Update camera matrix to ensure the model is georeferenced correctly on the map. let projectMatrix = this.map.calculateProjectMatrixForWebGL({ position: [106.704497, 10.769589], }) let m = new THREE.Matrix4().fromArray(projectMatrix) camera.projectionMatrix = m renderer.render(scene, camera) // Request a redraw and render the scene. // Call this method when no need limit FPS by Map4D. webGLOverlay.requestRedraw() } // Always reset the GL state. renderer.resetState() } }) // Add the overlay to the map. webGLOverlay.setMap(this.map)
```



### [Samples](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=samples)

Xem thêm các ví dụ sử dụng WebGL Overlay View tại: [https://github.com/map4d/js-samples](https://github.com/map4d/js-samples)

## [Reference](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=reference)

### [WebGLOverlayView class](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=webgloverlayview-class)

`map4d.WebGLOverlayView` class

Constructor

Tạo WebGLOverlayView với các options được chỉ định

```
WebGLOverlayView(options)
```



- Parameters:
  - options: [WebGLOverlayViewOptions](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/webgl-overlay?id=webgloverlayviewoptions-interface) *required*

Methods

| **Name**      | **Parameters**                                                                     | **Return Value** | **Description**                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| setMap        | map: [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class) | none             | Set WebGL Overlay View lên map, nếu set map là null thì WebGL Overlay View sẽ bị xóa khỏi map                            |
| requestRedraw | none                                                                               | none             | Request vẽ lại đối tượng WebGL Overlay View để không bị hạn chế FPS bởi Map4D, phù hợp khi render các model có animation |

### [WebGLOverlayViewOptions interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=webgloverlayviewoptions-interface)

`map4d.WebGLOverlayViewOptions` interface

Đối tượng WebGLOverlayViewOptions dùng để xác định các thuộc tính dùng cho WebGLOverlayView.

Properties

| **Name**            | **Type** | **args**                                                                                                        | **Description**                                                                               |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| onAdd *optional*    | function | map: [Map](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/map?id=map-class), gl: `WebGLRenderingContext` | Callback được gọi khi WebGLOverlayView được thêm vào Map                                      |
| onDraw *optional*   | function | gl: `WebGLRenderingContext`                                                                                     | Callback được gọi để render WebGLOverlayView lên base map                                     |
| onRemove *optional* | function | none                                                                                                            | Callback được gọi khi WebGLOverlayView bị remove khỏi map với `WebGLOverlayView.setMap(null)` |

### [WebGLPositionData interface](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/webgl-overlay?id=webglpositiondata-interface)

`map4d.WebGLPositionData` interface

Đối tượng WebGLPositionData dùng để xác định các thuộc tính vị trí của đối tượng WebGLOverlayView

Properties

| **Name**             | **Type**                                                                                | **Description**                                                                 |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| position *required*  | [ILatLng](https://docs-cdtqg.map4d.vn/map4d-map/web/#/reference/coordinates?id=ilatlng) | Vị trí hiển thị của đối tượng WebGLOverlayView trên bản đồ                      |
| scale *optional*     | number                                                                                  | Tỉ lệ hiển thị của đối tượng WebGLOverlayView so với kích thước thực tế         |
| bearing *optional*   | number                                                                                  | Góc quay của đối tượng WebGLOverlayView khi được vẽ ra trên bản đồ (đơn vị: độ) |
| elevation *optional* | number                                                                                  | Độ cao của đối tượng WebGLOverlayView so với mực nước biển (đơn vị: mét)        |
