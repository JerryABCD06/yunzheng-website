# yunzheng-website

王云正的静态作品集。只陈列作品，没有个人介绍；没有后端、没有构建步骤、没有第三方运行时请求。

## 页面

```text
/                                  首页（中英双语）
/localization/pvz-steam/           Steam 版汉化（仅中文）
/localization/pvz-dlc/             DLC 版中文（仅中文）
/localization/pvz-better-expansion/ Better Expansion 中文（仅中文）
/software/no-uninstall-icon/       No Uninstall Icon（中英双语）
/software/media-cast/              Media Cast（中英双语）
/404.html
```

汉化详情页固定为中文，顶栏以“仅中文”徽标代替语言切换；在其它页面切到英文后，再回到汉化页不会丢失英文偏好。

## 本地预览

从仓库根目录起一个静态服务器：

```powershell
python -m http.server 8000
```

然后打开 `http://localhost:8000/`。不要直接双击 HTML，页面使用根路径引用资源。

## 要改什么

### 网盘链接

编辑 `assets/js/links.js`。留空字符串会让按钮保持禁用状态，页面上会显示“链接待补”。

```js
window.WYZ_LINKS = {
  steam: { baidu: "…", quark: "…" },
  dlc: { baidu: "…", quark: "…" },
  "better-expansion": { baidu: "…", quark: "…" }
};
```

按钮在拿到链接后会自动变成可点击链接，并隐藏“链接待补”提示。

### 截图

目前所有截图位置都是 CSS/SVG 占位框，没有假装成真实截图的素材。

- 首页汉化卡片：16:9
- 汉化详情页：16:9
- 软件页：16:9，两处

替换时保留外框，把占位框内容换成 `<img>` 即可；建议提供 1920×1080 或更高分辨率的 WebP/AVIF。截图应加 `loading="lazy"`（首屏图除外）和 `alt`。

### 文案

直接改对应 `index.html` 里的文本。双语页面用 `.lang-zh` 和 `.lang-en` 成对包住，块级内容再加 `.lang-block`。汉化页只有中文，不需要成对。

### 标题字体

顶栏的“王云正”来自本机 `MiSans VF` 转出的矢量轮廓，不使用 webfont 请求：

- `assets/img/wordmark-light.svg`
- `assets/img/wordmark-dark.svg`
- 两者用 `<img>` 输出；鼠标流光由 `assets/img/wordmark-light.svg` 作为 CSS mask 叠上去。
- 隐藏的可访问文本仍是“王云正”。

这样不依赖字体文件加载，不会 FOUT、不会因为设备缺字体而变形。字体本身不随仓库分发。

MiSans 由小米提供，按官方许可免费商用；本项目在页脚标注了字体来源。使用前请遵守 [MiSans 官方许可](https://hyperos.mi.com/font/)。

## 主题与语言

- 主题：跟随系统 / 浅色 / 深色，默认“跟随系统”。手动选择后写入 `localStorage`（键名 `wyz.theme`）。
- 语言：首次按浏览器语言选择中文或英文；切换后写入 `localStorage`（键名 `wyz.lang`）。
- 没有 cookie，也没有服务端。所有页面共用同一份偏好，不需要请求头传递。
- 首屏前由 `assets/js/boot.js` 同步读取偏好，避免明暗或语言闪烁。

## 设计说明

- Fluent 2 的基础形状规范是控件 4px、浮层 8px；这里按需求放大到控件 8px、卡片 16px、面板 22px，其余间距、1px 描边、焦点环和动效节奏尽量贴近 Fluent。
- Mica 作为页面底层氛围，顶栏使用 Acrylic；卡片不再叠多层模糊，避免材质堆叠。
- 交互元素有基于鼠标位置的边缘流光；主按钮、网盘按钮和卡片使用同一套指针变量。
- 额外动画（滚动进入、章节浮现、主题圆形揭开、窗口轻微倾斜）都会在 `prefers-reduced-motion: reduce` 下关闭。
- 顶栏固定不自动隐藏；Tab 顺序遵循 DOM 顺序，主题菜单和移动端导航都支持 Esc 关闭并回到触发按钮。

## 部署

Cloudflare Pages 直接部署仓库根目录，不需要构建命令。推送到 `main` 后按现有 Pages 配置自动发布。

## 字体与素材许可

- 字标：MiSans（小米），已转为轮廓，不再分发字体文件。页脚有来源标注。
- 截图占位与界面装饰：项目自有 CSS/SVG，不含游戏或第三方截图。
- 游戏名称与商标归各自权利人所有。
