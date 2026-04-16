# Vue3 + Arco Design 医疗后台

## 启动

在 `d:\soft\移植项目\vue-arco-admin` 目录执行：

```bash
npm i
npm run dev
```

## 说明

- 使用 **Vite + Vue3 + Arco Design**，标准后台布局：左侧可折叠菜单、顶部导航栏、内容区。
- 菜单数据结构在 `src/menu/menu.ts`，字段保持：`groupKey/group/icon/items/key/label/icon`。
- 路由在 `src/router/index.ts`，根据菜单 `key` 自动生成路径（`.` → `/`）。
- `src/layouts/Layout.vue`：菜单渲染（分组、展开/收起、当前高亮、图标使用 Arco icon 映射）。

