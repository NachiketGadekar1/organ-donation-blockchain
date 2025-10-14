import { Router } from 'express';
import { z } from 'zod';
import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';

export const router = Router();

const env = z.object({
  RPC_URL: z.string().min(1),
  CONTRACT_ADDRESS: z.string().min(1),
  MONGO_URL: z.string().min(1)
}).parse(process.env);

const client = new MongoClient(env.MONGO_URL);
const dbPromise = client.connect().then(() => client.db('organ_donation'));

const provider = new ethers.JsonRpcProvider(env.RPC_URL);
const abi = [
  "function HOSPITAL_ROLE() view returns (bytes32)",
  "function OPO_ROLE() view returns (bytes32)",
  "function grantRole(bytes32 role, address account)",
  "function registerDonor(bytes32 donorIdHash, bytes32 offchainHash)",
  "function registerRecipient(bytes32 recipientIdHash, bytes32 offchainHash)",
  "function listOrgan(uint8 organType, bytes32 donorIdHash, bytes32 bloodHlaHash) returns (uint256)",
  "function reserveOrgan(uint256 organId, bytes32 recipientIdHash)",
  "function recordTransplant(uint256 organId, bytes32 recipientIdHash)",
  "event OrganListed(uint256 indexed organId, uint8 organType, bytes32 indexed donorIdHash, bytes32 bloodHlaHash, address listedBy)"
];

router.get('/health', (_req, res) => res.json({ ok: true }));

router.post('/donors', async (req, res) => {
  const schema = z.object({ donorId: z.string(), offchainHash: z.string() });
  const body = schema.parse(req.body);
  const donorIdHash = ethers.keccak256(ethers.toUtf8Bytes(body.donorId));
  const offchainHash = body.offchainHash; // already a bytes-like hex or ipfs CID hash

  // Store the off-chain record pointer in Mongo for quick search/audits
  const db = await dbPromise;
  await db.collection('donors').updateOne(
    { donorId: body.donorId },
    { $set: { donorId: body.donorId, offchainHash: body.offchainHash, updatedAt: new Date() } },
    { upsert: true }
  );

  res.json({ donorIdHash, offchainHash });
});

router.get('/organs', async (_req, res) => {
  const db = await dbPromise;
  const organs = await db.collection('organs').find().limit(50).toArray();
  res.json(organs);
});
