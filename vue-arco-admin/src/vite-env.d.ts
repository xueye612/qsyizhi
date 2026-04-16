/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 设为 true 时使用 Hash 路由，无需服务器配置 SPA 回退 */
  readonly VITE_ROUTER_HASH?: string;
  /** 生产构建且已配置 Nginx/OSS 等 SPA 回退时，可设 true 强制使用 History（与默认行为一致） */
  readonly VITE_ROUTER_HISTORY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
