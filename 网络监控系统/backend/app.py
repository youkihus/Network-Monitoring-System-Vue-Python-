from flask import Flask, jsonify, request
from flask_cors import CORS
import psutil
import time
import datetime
import threading
import socket
import requests

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 存储历史网络数据
network_history = []
max_history = 360  # 最多存储360个数据点（约1小时）
last_stats = None
last_time = None

# 获取系统网络接口信息
def get_network_interfaces():
    interfaces = []
    net_io = psutil.net_io_counters(pernic=True)
    net_addrs = psutil.net_if_addrs()
    net_stats = psutil.net_if_stats()
    
    for interface in net_io.keys():
        # 跳过本地回环接口和一些虚拟接口
        if interface.startswith('Loopback') or interface.startswith('lo') or interface.startswith('vEthernet'):
            continue
            
        interface_info = {
            'name': interface,
            'sent_bytes': net_io[interface].bytes_sent,
            'received_bytes': net_io[interface].bytes_recv,
            'packets_sent': net_io[interface].packets_sent,
            'packets_recv': net_io[interface].packets_recv,
            'errors_sent': net_io[interface].errout,
            'errors_recv': net_io[interface].errin,
            'drop_sent': net_io[interface].dropout,
            'drop_recv': net_io[interface].dropin,
            'is_up': net_stats.get(interface, {}).isup if hasattr(psutil.net_if_stats()[interface], 'isup') else False,
            'speed': net_stats.get(interface, {}).speed if hasattr(psutil.net_if_stats()[interface], 'speed') else 0
        }
        
        # 添加IP地址信息
        if interface in net_addrs:
            ip_addresses = []
            for addr in net_addrs[interface]:
                if addr.family == socket.AF_INET:  # IPv4
                    ip_addresses.append({
                        'type': 'IPv4',
                        'address': addr.address,
                        'netmask': addr.netmask
                    })
                elif addr.family == socket.AF_INET6:  # IPv6
                    ip_addresses.append({
                        'type': 'IPv6',
                        'address': addr.address,
                        'netmask': addr.netmask
                    })
            interface_info['ip_addresses'] = ip_addresses
        
        interfaces.append(interface_info)
    
    return interfaces

# 计算网络速度
def calculate_network_speed():
    global last_stats, last_time
    current_stats = psutil.net_io_counters()
    current_time = time.time()
    
    if last_stats is None or last_time is None:
        last_stats = current_stats
        last_time = current_time
        return {
            'upload_speed': 0,
            'download_speed': 0,
            'total_upload': current_stats.bytes_sent,
            'total_download': current_stats.bytes_recv
        }
    
    time_diff = current_time - last_time
    if time_diff <= 0:
        return {
            'upload_speed': 0,
            'download_speed': 0,
            'total_upload': current_stats.bytes_sent,
            'total_download': current_stats.bytes_recv
        }
    
    upload_speed = (current_stats.bytes_sent - last_stats.bytes_sent) / time_diff
    download_speed = (current_stats.bytes_recv - last_stats.bytes_recv) / time_diff
    
    last_stats = current_stats
    last_time = current_time
    
    # 保存到历史数据
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    network_history.append({
        'timestamp': timestamp,
        'upload_speed': upload_speed,
        'download_speed': download_speed
    })
    
    # 限制历史数据长度
    if len(network_history) > max_history:
        network_history.pop(0)
    
    return {
        'upload_speed': upload_speed,
        'download_speed': download_speed,
        'total_upload': current_stats.bytes_sent,
        'total_download': current_stats.bytes_recv
    }

# 检查互联网连接
def check_internet_connection():
    try:
        # 尝试连接到几个公共DNS服务器
        dns_servers = ['8.8.8.8', '1.1.1.1', '208.67.222.222']
        for server in dns_servers:
            socket.create_connection((server, 53), timeout=2)
            return True
        return False
    except:
        return False

# 获取公网IP地址
def get_public_ip():
    try:
        # 使用多个服务获取公网IP，增加可靠性
        services = [
            'https://api.ipify.org',
            'https://ipinfo.io/ip',
            'https://checkip.amazonaws.com'
        ]
        
        for service in services:
            try:
                response = requests.get(service, timeout=2)
                if response.status_code == 200:
                    return response.text.strip()
            except:
                continue
        return '无法获取公网IP'
    except:
        return '无法获取公网IP'

# API端点：获取网络状态
@app.route('/api/network/status', methods=['GET'])
def get_network_status():
    try:
        speed_data = calculate_network_speed()
        
        return jsonify({
            'status': 'success',
            'internet_connected': check_internet_connection(),
            'public_ip': get_public_ip(),
            'network_speed': speed_data,
            'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# API端点：获取网络接口信息
@app.route('/api/network/interfaces', methods=['GET'])
def get_interfaces():
    try:
        interfaces = get_network_interfaces()
        return jsonify({
            'status': 'success',
            'interfaces': interfaces
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# API端点：获取历史网络速度数据
@app.route('/api/network/history', methods=['GET'])
def get_network_history():
    try:
        # 获取查询参数，设置时间范围
        hours = request.args.get('hours', default=1, type=int)
        minutes = hours * 60
        data_points_needed = min(minutes, max_history)
        
        # 返回最近的历史数据
        recent_history = network_history[-data_points_needed:] if len(network_history) >= data_points_needed else network_history
        
        return jsonify({
            'status': 'success',
            'history': recent_history
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 定时更新网络状态（每分钟）
def update_network_status():
    while True:
        try:
            calculate_network_speed()
        except:
            pass
        time.sleep(1)

if __name__ == '__main__':
    # 启动后台线程定时更新网络状态
    threading.Thread(target=update_network_status, daemon=True).start()
    
    # 启动Flask服务器
    print("网络监控后端服务已启动")
    print("访问 http://localhost:5000/api/network/status 获取网络状态")
    print("访问 http://localhost:5000/api/network/interfaces 获取网络接口信息")
    print("访问 http://localhost:5000/api/network/history 获取历史数据")
    app.run(host='0.0.0.0', port=5000, debug=False)