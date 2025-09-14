# Zabbix Status Dashboard

A modern single-page application built with Vite that provides a clean, responsive interface for monitoring Zabbix hosts. Features Bootstrap 5 styling for an intuitive user experience. This has been created because I was looking for an simple way to publically display statistics about my infrastructure for everyone. Check out our running dashboard at https://status.kandru.de.

![Screenshot](screenshot.png)

## 🚀 Development

### Zabbix Configuration

This frontend needs a separate zabbix account which is READ ONLY for the given hosts you want to monitor. I recommend to create a new host group (e.g. Dashboard) and add an zabbix account which has READ ONLY permissions to this host group. Disable everything except the API access to prevent changes of the password etc.. Also make sure to ONLY expose hosts which can safely be exposed COMPLETELY. Because even the fronted may only shows a subset of the data - the API can still deliver all the other information of a host.

### Prerequisites
- Node.js and npm installed on your system

### Setup
1. **Configure the application**
    ```bash
    cp config.default.jsx config.jsx
    ```
    Edit `config.jsx` with your Zabbix server details.

2. **Install dependencies**
    ```bash
    cd ./zabbix-dashboard/
    npm install .
    ```

3. **Start development server**
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:3000`

## 📦 Building & Deployment

### Build for production
```bash
npm run build
```

### Deploy
Upload the contents of the `dist` folder to your web server's public directory.

## FAQ

### How to reduce the transfered data?

Enable compression on the server side. This example shows you how to configure NGINX properly to enable gzip compression.

```
server {
    # ... your existing configuration ...
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        application/json
        application/json-rpc
        text/plain
        text/css
        text/xml
        text/javascript
        application/xml+rss
        application/javascript
        application/atom+xml
        image/svg+xml;
    
    location / {
        # Your existing proxy settings
        proxy_pass http://your-zabbix-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Enable compression for proxied responses
        proxy_set_header Accept-Encoding gzip;
    }
}
```

---

*Ready to monitor your infrastructure with style! 📊*
