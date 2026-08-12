## [Area Focuser](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/area-focuser "Area Focuser")

Cho phép di chuyển bản đồ đến một vùng cụ thể và hiển thị nổi bật khu vực đó

## [Focus tỉnh/thành](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/area-focuser?id=focus-t%e1%bb%89nhth%c3%a0nh)

```
map.areaFocuser.focusProvince({ name: string, highlight: boolean }) : Promise<void>
```

Trong đó:

- name: tên tỉnh/thành muốn hiển thị
- highlight: set true nếu muốn hiển thị nổi bật tỉnh/thành

Ví dụ:

```
map.areaFocuser.focusProvince({name: "Hà Nội", highlight: true})
```



### [Bỏ focus](https://docs-cdtqg.map4d.vn/map4d-map/web/#/guides/area-focuser?id=b%e1%bb%8f-focus)

Truyền null nếu muốn bỏ focus

```
map.areaFocuser.focusProvince(null)
```
