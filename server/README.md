# Baby Care API

The public Mini Program API is served at `https://baby.20350720.xyz:8888`.
Node listens only on `127.0.0.1:8899`; Nginx terminates HTTPS on the public
port and proxies requests inward.

## Private configuration

Copy `.env.example` to `/opt/baby-care/.env` on the VPS and set a long
`JWT_SECRET` plus `WECHAT_APP_SECRET`. Never commit that file.

## Health check

`GET /health` returns a small health response without exposing user data.
