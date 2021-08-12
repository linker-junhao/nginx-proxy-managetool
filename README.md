## 用于简单管理nginx代理配置

### 后端（目录下）
* dev: `go run ./src/main.go`
* build: `go build ./src/main.go`
* flags: -p 服务监听端口，-c nginx配置所在路径

### 前端ui（./src/ui 目录下）
* dev启动：`vite`
* build: `vite build`

### 访问地址
* ui的地址: `http://localhost:8999/ui`
* api的地址: `http://localhost:8999/api`
### 使用
* 打包: `sh ./build.sh`
* 启动: 到dist目录下，`sudo ./main -p=8999`
* 首次使用，在ui界面上选中一个配置项后点击应用，这是为了生成`nginx-pmt.conf`配置文件。然后使用命令`sudo nginx -c /usr/local/etc/nginx/nginx-pmt.conf`启动nginx。
* 后续就可以直接使用ui界面控制配置了。
