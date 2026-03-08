import { Transaction } from "@mysten/sui/transactions";

import { AVATAR_CONTRACT, AVATAR_TARGETS, AVATAR_TYPES } from "../config/avatarContract";
import { buildAvatarMintPayload, type AvatarMintFormValues } from "./avatarMint";

export function buildPauseMintTx() {
  const tx = new Transaction();
  tx.moveCall({
    target: AVATAR_TARGETS.pauseMint,
    arguments: [tx.object(AVATAR_CONTRACT.adminCapId), tx.object(AVATAR_CONTRACT.mintConfigId)],
  });
  return tx;
}

export function buildResumeMintTx() {
  const tx = new Transaction();
  tx.moveCall({
    target: AVATAR_TARGETS.resumeMint,
    arguments: [tx.object(AVATAR_CONTRACT.adminCapId), tx.object(AVATAR_CONTRACT.mintConfigId)],
  });
  return tx;
}

export function buildSetMintPriceTx(newPriceMist: string) {
  const normalized = newPriceMist.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error("Mint price must be a whole MIST value.");
  }

  const tx = new Transaction();
  tx.moveCall({
    target: AVATAR_TARGETS.setMintPrice,
    arguments: [
      tx.object(AVATAR_CONTRACT.adminCapId),
      tx.object(AVATAR_CONTRACT.mintConfigId),
      tx.pure.u64(normalized),
    ],
  });
  return tx;
}

function normalizeMistValue(mist: string) {
  const normalized = mist.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error("Mint price must be a whole MIST value.");
  }
  return normalized;
}

function buildSharedMintArguments(
  tx: Transaction,
  formValues: AvatarMintFormValues
) {
  const payload = buildAvatarMintPayload(formValues);

  return [
    tx.pure.string(payload.name),
    tx.pure.string(payload.description),
    tx.pure.string(payload.imageUrl),
    tx.makeMoveVec({ type: AVATAR_TYPES.attribute, elements: [] }),
    tx.pure.u8(payload.frameType),
    tx.pure.u8(payload.skinTone),
    tx.pure.u8(payload.hairType),
    tx.pure.u8(payload.hairColor),
    tx.pure.u8(payload.heightClass),
    tx.pure.u8(payload.bodyType),
    tx.pure.u8(payload.faceStyle),
    tx.pure.u8(payload.eyeColor),
    tx.pure.u8(payload.eyeStyle),
    tx.pure.u8(payload.mouthStyle),
    tx.pure.u8(payload.facialHair),
    tx.pure.u8(payload.expressionProfile),
    tx.pure.u8(payload.voiceType),
    tx.pure.u8(payload.styleType),
    tx.pure.u8(payload.idleStyle),
    tx.pure.u8(payload.walkStyle),
    tx.pure.u8(payload.baseEmotePack),
    tx.pure.string(payload.baseModelUri),
    tx.pure.string(payload.portraitUri),
  ];
}

export function buildMintAvatarTx(
  formValues: AvatarMintFormValues,
  mintPriceMist: string
) {
  const normalizedPrice = normalizeMistValue(mintPriceMist);
  const tx = new Transaction();
  const sharedArguments = buildSharedMintArguments(tx, formValues);

  if (normalizedPrice === "0") {
    tx.moveCall({
      target: AVATAR_TARGETS.mintAvatarFree,
      arguments: [tx.object(AVATAR_CONTRACT.mintConfigId), ...sharedArguments],
    });
    return tx;
  }

  const [payment] = tx.splitCoins(tx.gas, [normalizedPrice]);
  tx.moveCall({
    target: AVATAR_TARGETS.mintAvatar,
    arguments: [tx.object(AVATAR_CONTRACT.mintConfigId), payment, ...sharedArguments],
  });

  return tx;
}
