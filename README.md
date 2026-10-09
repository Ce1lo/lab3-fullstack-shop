# Lab 3 — Fullstack Shop

Fullstack integration lab using Next.js and Express.

## Structure

```text
lab3/
├── Lab3.pdf
└── fullstack-shop/
    ├── backend/   # Express API, JSON persistence, cart, orders
    └── frontend/  # Next.js App Router, TanStack Query UI
```

## Run locally

```bash
# terminal 1
cd fullstack-shop/backend
npm install
node server.js

# terminal 2
cd fullstack-shop/frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Phases

1. Workspace and dependency setup
2. Fullstack shop, product CRUD, cart and checkout UI
3. JSON persistence and API self-check
