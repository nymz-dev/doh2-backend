# Doh1 - backend

[![Node.js CI](https://github.com/nymz-dev/doh2-backend/actions/workflows/node.js.yml/badge.svg?branch=main&event=push)](https://github.com/nymz-dev/doh2-backend/actions/workflows/node.js.yml)

The backend for doh1 application.

## Installation

The installation instructions may be found [here](https://github.com/nymz-dev/doh2-backend/blob/main/INSTALLATION.md).

## Logs

For debugging the production environment, look for access and error log files in the following locations:

```bash
/home/backend/backend/log/*access.log # express access log
/home/backend/backend/doh1.err.log # server.js stderr
/home/backend/backend/doh1.out.log # server.js stdout
/home/backend/backend/queue.err.log # queue.js stderr
/home/backend/backend/queue.out.log # queue.js stdout
/var/log/nginx/access.log # nginx access log
/var/log/nginx/error.log # nginx error log
/var/log/syslog # use 'grep CRON /var/log/syslog' to list only crontab logs
```
