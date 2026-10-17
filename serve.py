#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""涟帆祈雨手写生成器 · 本地预览服务器
运行后会自动打开浏览器（默认 http://127.0.0.1:8080/）。
如果端口被占用，会自动顺延到下一个可用端口。
"""
import http.server
import os
import socket
import socketserver
import threading
import webbrowser

BASE_PORT = 8080
MAX_PORT = 8099
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # 避免开发时缓存旧文件
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


def find_free_port():
    for port in range(BASE_PORT, MAX_PORT + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise SystemExit("没有找到可用端口（%d-%d 都被占用）" % (BASE_PORT, MAX_PORT))


def open_browser(url):
    try:
        webbrowser.open(url)
    except Exception:
        pass


def main():
    port = find_free_port()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
        url = "http://127.0.0.1:%d/" % port
        print("=" * 56)
        print("  涟帆祈雨手写生成器  Lianfan Qiyu Writing Studio")
        print("  已启动：%s" % url)
        print("  关闭此窗口即可停止服务（Ctrl + C）")
        print("=" * 56)
        threading.Timer(0.8, lambda: open_browser(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n已停止。")


if __name__ == "__main__":
    main()
