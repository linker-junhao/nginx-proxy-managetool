## 用于简单管理nginx代理配置

### 后端（目录下）
* dev: `go run ./src/main.go`
* build: `go build ./src/main.go`
* flags: -p 服务监听端口，-c nginx配置所在路径

### 前端ui（./src/ui 目录下）
* dev启动：`vite`
* build: `vite build`

### 访问
* 启动: `sudo ./main -p=8999`
* ui: `http://localhost:8999/ui`
* api: `http://localhost:8999/api`