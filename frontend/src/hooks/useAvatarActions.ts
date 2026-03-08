import { useCallback, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";

import {
  extractMintedAvatar,
  type AvatarMintFormValues,
} from "../lib/avatarMint";
import {
  buildMintAvatarTx,
  buildPauseMintTx,
  buildResumeMintTx,
  buildSetMintPriceTx,
} from "../lib/avatarTransactions";
import { parseError } from "../lib/format";
import { useTxExecutor } from "./useTxExecutor";

type PendingAction = "mint" | "pause" | "resume" | "set-price" | null;

export function useAvatarActions() {
  const account = useCurrentAccount();
  const { execute, executeAndFetchBlock } = useTxExecutor();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const requireWallet = useCallback(() => {
    if (!account) {
      throw new Error("Connect wallet first.");
    }
  }, [account]);

  const pauseMint = useCallback(async () => {
    requireWallet();
    setPendingAction("pause");

    try {
      await execute(buildPauseMintTx(), "Mint paused");
    } finally {
      setPendingAction(null);
    }
  }, [execute, requireWallet]);

  const resumeMint = useCallback(async () => {
    requireWallet();
    setPendingAction("resume");

    try {
      await execute(buildResumeMintTx(), "Mint resumed");
    } finally {
      setPendingAction(null);
    }
  }, [execute, requireWallet]);

  const setMintPrice = useCallback(
    async (newPriceMist: string) => {
      requireWallet();
      setPendingAction("set-price");

      try {
        await execute(buildSetMintPriceTx(newPriceMist), "Mint price updated");
      } finally {
        setPendingAction(null);
      }
    },
    [execute, requireWallet]
  );

  const mintAvatar = useCallback(
    async (formValues: AvatarMintFormValues, mintPriceMist: string) => {
      requireWallet();
      let tx;

      try {
        tx = buildMintAvatarTx(formValues, mintPriceMist);
      } catch (error) {
        toast.error(parseError(error));
        throw error;
      }

      setPendingAction("mint");

      try {
        const successMessage =
          mintPriceMist.trim() === "0" ? "Avatar minted" : "Avatar minted successfully";
        const { block, digest } = await executeAndFetchBlock(tx, successMessage);
        return extractMintedAvatar(block, digest);
      } finally {
        setPendingAction(null);
      }
    },
    [executeAndFetchBlock, requireWallet]
  );

  return {
    pendingAction,
    mintAvatar,
    pauseMint,
    resumeMint,
    setMintPrice,
  };
}
