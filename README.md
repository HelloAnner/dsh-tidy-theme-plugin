# dsh-tidy-theme-plugin

一个面向 **DeepSeek Harness (DSH)** Web 客户端的轻量前端改造插件。

## 当前效果

1. **隐藏侧边栏左上角的 DeepSeek 品牌组合**（鱼形 mark + `deepseek HARNESS` 字标）。
2. **把「新会话」按钮提升到最顶部**，与右侧折叠按钮同一行；导航列表紧接其后，不再保留空品牌行。

实现上分成两层：

- 用 DSH 侧边栏的正式插槽 `sidebar.brand.mark` / `sidebar.brand.name` 注册空 occupant，以 `priority: -1` 遮蔽官方 `ui-brand-official` 的默认 occupant（priority `0`）。官方插件仍可正常工作，只是不再渲染；未来官方换字标也不会失效。
- 用一小段带作用域的 CSS 把真实的 `button.newSession` 上移进品牌行，并隐藏已经变空的品牌按钮。因为移动的是真实按钮，双语标签、悬停时显示的快捷键提示和点击行为都原样保留。

## 安装

DSH 的 Web profile 位于 `$DSH_HOME/profiles/web`（通常是 `~/.dsh/profiles/web`）。

```sh
dsh plugin --profile web add /Volumes/d/Users/anner/dsh-tidy-theme-plugin
```

然后在 profile 的 `cordis.patch.yml` 末尾追加一个 `insert` 列表。注意：新增 entry 必须放在 `insert:` 下；直接写 `id` + `name` 会被当成对已有 entry 的覆盖而报 `entry "..." not found`。

```yaml
- insert:
    - id: tidy-theme
      name: "dsh-tidy-theme-plugin"
```

插件通过 `link:` 依赖安装到 profile 的 `node_modules`，所以本仓库中的 `lib/client.js` 就是运行时实际加载的文件。

## 热更新

DSH Web 组合默认启用两层 HMR：

1. **配置热更新**：`dsh-hmr` 监听 profile 的 `cordis.patch.yml`，修改后自动重组 Loader 树。
2. **浏览器 bundle 热更新**：`dsh-client-hmr` 每 500ms 轮询已加载插件的 `lib/client.js` 元数据；文件变化后通过 `/plugins/events` 推送 `rebuilt`，页面会直接替换该插件，不需要刷新。

因此改完 `lib/client.js`，保存即可在已打开的 GUI 里看到效果。如果页面处于断线或浏览器缓存异常状态，刷新一次即可。

## 结构

```text
.
├── lib/
│   ├── index.js    # Host 半边：空 apply，给 Loader 一个宿主座位
│   └── client.js   # 浏览器半边：Loader bundle + 品牌插槽 + 顶栏布局 CSS
└── package.json    # dsh.client 声明 + ./client 导出
```

`lib/client.js` 直接以 DSH 的 `window.__ModuleLoader__.load({ id, factory })` 形式编写，没有额外构建步骤，便于快速迭代主题。

### 顶栏布局说明

侧边栏原来的结构是：60px 的 `logoRow`（品牌 + 折叠按钮）→ 38px 的「新会话」按钮 → 导航。品牌清空后，`logoRow` 只剩折叠按钮，因此用负 margin 把真实「新会话」按钮上移 49px：

- `margin-top: -49px`：60px 行高减去 38px 按钮高度后，按钮在其中垂直居中，并扣掉 6px 的列内边距。
- `margin-bottom: 11px`：抵消上移后按钮在文档流中占用的高度，让导航正好从品牌行底边开始。
- `margin-right: 40px`：给右侧 28px 折叠按钮 + 8px 间距留位。

选择器使用 CSS Module 的稳定后缀（`_logoRow`、`_newSession`、`_brand`、`_collapsed`），不使用哈希前缀。桌面窗口外壳（macOS 的 `data-platform="darwin"`、Windows 的 `data-windows-titlebar`）有另一套行几何，因此这套提升规则只作用于浏览器端。

## 后续

后续 UI 调整继续加在 `lib/client.js` 的 `apply` 里，或在其中追加主题 CSS。
