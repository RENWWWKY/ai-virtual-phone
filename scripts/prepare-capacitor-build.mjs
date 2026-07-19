import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const disabled = path.join(root, ".capacitor-disabled");
fs.rmSync(disabled, { recursive: true, force: true });
fs.mkdirSync(disabled, { recursive: true });

function moveIfExists(from, to) {
  const source = path.join(root, from);
  const target = path.join(disabled, to);
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.renameSync(source, target);
  console.log(`CI-only move: ${from}`);
}

// Next.js 静态导出不能编译 Route Handlers 和 Middleware。
// 这里只在 Actions 临时工作区移动，仓库源码及功能文件不会被删除。
moveIfExists("app/api", "app/api");
moveIfExists("app/manifest.webmanifest", "app/manifest.webmanifest");
moveIfExists("middleware.ts", "middleware.ts");

const nextConfig = `/** Capacitor APK 专用临时配置（仅在 Actions 工作区生成） */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        module: false,
      };
    }
    return config;
  },
};
export default nextConfig;
`;
fs.writeFileSync(path.join(root, "next.config.mjs"), nextConfig);
console.log("Prepared static Capacitor build without deleting repository features.");
