# Frontend (placeholder)
Use any stack you like (Next.js/Vite). The backend exposes /api endpoints and the contract address is provided during deployment. Suggested pages:
- Search / Browse organs
- Hospital dashboard to reserve & record transplants
- OPO dashboard to register donors & list organs

Security/PII: never put personal data on-chain; encrypt medical records and store off-chain (IPFS/S3) and reference only content hashes in the contract.
