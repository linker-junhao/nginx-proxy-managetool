package serve

import (
	"encoding/json"
	"flag"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
)

const configFilePath string = "./config.json"
var nginxConfPath *string = flag.String("c", "/usr/local/etc/nginx/nginx-pmt.conf", "nginx config file path")
var servePort *string = flag.String("p", "8999", "serve listen port")

func read(file io.Reader, len int) ([]byte) {
  buf := make([]byte, 0)
  for count := 0; count < len; count++ {
    // 每行最大1024byte
    lineBuf := make([]byte, 1024)
    n, _ := file.Read(lineBuf)
    if 0 == n {
        break
    }
    log.Println("lineBuf", count, n, string(lineBuf[:n]))
    buf = append(buf, lineBuf[:n]...)
  }
  return buf
}

func readFileLinesN(path string, len int) ([]byte, error) {
  file, err := os.Open(path)
  if err != nil {
    log.Fatalln("open file:", path, "failed;", err)
    return nil, err
  }
  defer file.Close()
  return read(file, len), nil
}

func createFile(filePath string, content string) error {
  file, err := os.OpenFile(filePath, os.O_RDWR|os.O_CREATE, os.ModePerm)
  if err != nil {
    log.Fatalf("open file failed %v", err)
    return err
  } else {
    defer file.Close()
    file.Truncate(0)
    _, err := file.WriteString(string(content))
    if err != nil {
      log.Println("write failed: ", err)
      return err
    }
  }
  return nil
}

func baseConfigUpdate(config []byte) ([]byte, error) {
  err := createFile(configFilePath, string(config))
  if err != nil {
    return nil, err
  }
  return readFileLinesN(configFilePath, 100)
}

type locationCfg struct {
  Name      string `json:"name"`
  Location  string `json:"location"`
  ProxyPass string `json:"proxyPass"`
}
type serverCfg struct {
  Name       string `json:"name"`
  Servername string `json:"serverName"`
  Listen     string `json:"listen"`
  Locations  []locationCfg `json:"locations"`
}
type serversConfig []serverCfg

/*
server {
    listen       80; # 监听的端口号
    server_name  dev.boss.xtadmins.com; # 域名
    access_log logs/book.log;
    error_log logs/book.error;
    # location 代表请求路径
    location ^~ /boss {
        proxy_pass http://stage12-aliyunecs-hz.xtrfr.cn; # 代理地址
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        X-Forwarded-Proto $scheme;
        client_max_body_size    10m;
    }
*/
func genServerBlocks (serverConfigs []serverCfg) string {
  var ret string
  for i := 0; i < len(serverConfigs); i++ {
    server := serverConfigs[i]
    ret += `server {
      listen `+ server.Listen +`;
      server_name ` + server.Servername + `; # 域名
    ` + genLocationBlocks(server.Locations) + `
  }`;
  }
  return ret;
}

func genLocationBlocks (locationConfigs []locationCfg) string {
  var ret string
  for i := 0; i < len(locationConfigs); i++ {
    cfg := locationConfigs[i]
    ret += `
    # `+cfg.Name+`
    location `+cfg.Location+` {
      proxy_pass `+cfg.ProxyPass+`; # 代理地址
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header        X-Forwarded-Proto $scheme;
      client_max_body_size    10m;
    }`
  }
  return ret  
}

func genNginxConfFile (config []byte) {
  nginxServersCfg := serversConfig {};
  err := json.Unmarshal(config, &nginxServersCfg)
  if err != nil {
    log.Println("to nginx conf JSON fialed: ", err)
    return
  }
  pwd, _ := os.Getwd()
  ret := `
#user  nobody;
worker_processes  1;
# worker_processes: CPU数量 * 核数

error_log  `+ pwd +`/error.log;

events {
  worker_connections  1024; #c线程数
}

# http 请求会走下面的配置

http {
  include       mime.types;
  default_type  application/octet-stream;

  sendfile        on;
  #tcp_nopush     on;

  #keepalive_timeout  0;
  keepalive_timeout  65;
  #gzip  on;
  ` + genServerBlocks(nginxServersCfg) + `
}`
  err = createFile(*nginxConfPath, ret)
  if err != nil {
    log.Println("to nginx file failed: ", string(config))
    return
  }
}

func reloadNginx () {
  cmd := exec.Command("sudo", "nginx", "-c", *nginxConfPath, "-s", "reload")
  out, err := cmd.CombinedOutput()
  if err != nil {
		log.Println("cmd.Run() failed with", err)
	}
	log.Println("combined out:", string(out))
}

func Run() {
  flag.Parse()
  handler := http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
    rw.Header().Add("Access-Control-Allow-Origin", "*")
    rw.Header().Add("Access-Control-Allow-Headers", "content-type")
    rw.Header().Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    rw.Header().Add("Content-Type", "application/json")
    if r.URL.Path == "/api/base-config" {
      if r.Method == http.MethodPost {
        config, _ := baseConfigUpdate(read(r.Body, 10000))
        rw.Write([]byte(config))
      }
      if r.Method == http.MethodGet {
        config, _ := readFileLinesN(configFilePath, 10000)
        rw.Write([]byte(config))
      }
    }
    if r.URL.Path == "/api/use-config" {
      if r.Method == http.MethodPost {
        config := read(r.Body, 10000)
        genNginxConfFile(config)
        content, _ := readFileLinesN(*nginxConfPath, 10000)
        reloadNginx()
        rw.Write([]byte(content))
      }
    }
  })

  http.Handle("/ui/", http.StripPrefix("/ui/", http.FileServer(http.Dir("./ui/dist"))))
  http.Handle("/api/", handler)
  log.Println("127.0.0.1:" + *servePort)
  if err := http.ListenAndServe("127.0.0.1:" + *servePort, nil); err != nil {
    log.Fatalf("serve on 127.0.0.1:%v failed %v", *servePort, err)
  }
}