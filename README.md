# Flow Funding

Visual interactive interface for threshold-based flow funding mechanisms.

## Concept

Flow funding enables continuous, threshold-based resource allocation where:
- Funds flow continuously rather than in discrete grants
- Thresholds determine when funding activates/deactivates
- Visual interfaces make the system intuitive and transparent

## Features (Planned)

- **Interactive Flow Visualization**: Real-time display of funding flows between sources and recipients
- **Threshold Configuration**: Visual tools to set and adjust funding thresholds
- **Flow Dynamics**: Animate how funds move when thresholds are met
- **Dashboard**: Overview of all active flows, thresholds, and balances

## Tech Stack

- Next.js 14 (App Router)
- React Flow / D3.js for flow visualizations
- Tailwind CSS for styling
- TypeScript

## Development

```bash
pnpm install
pnpm dev
```

## Deployment

Dockerized for deployment on Netcup RS 8000 via Traefik.

**URL**: `https://flowidity.io/tbff`

```bash
docker compose up -d --build
```

## License

MIT
