# 用于简单管理nginx代理配置

## 后端（目录下）
* dev: `go run ./src/main.go`
* build: `go build ./src/main.go`
* flags: -p 服务监听端口，-c nginx配置所在路径

## 前端ui（./src/ui 目录下）
* dev启动：`vite`
* build: `vite build`

## 使用
* 启动nginx: `sudo nginx -c /usr/local/etc/nginx/nginx-pmt.conf`
* 启动工具: `sudo ./main -p=8999`
* ui: `http://localhost:8999/ui`
* api: `http://localhost:8999/api`
