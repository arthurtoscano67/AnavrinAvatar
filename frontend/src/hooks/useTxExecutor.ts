import { useCallback } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { Transaction } from "@mysten/sui/transactions";
import { toast } from "sonner";

import { parseError } from "../lib/format";

export function useTxExecutor() {
  const { mutateAsync } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const execute = useCallback(
    async (tx: Transaction, successMessage?: string) => {
      const loadingId = toast.loading("Awaiting wallet signature...");

      try {
        const result = (await mutateAsync({ transaction: tx })) as { digest?: string };
        const digest = result.digest;
        if (!digest) {
          throw new Error("Missing transaction digest.");
        }

        toast.loading("Transaction submitted...", { id: loadingId });
        await client.waitForTransaction({ digest });
        toast.success(successMessage ?? "Transaction succeeded", { id: loadingId });
        return digest;
      } catch (error) {
        toast.error(parseError(error), { id: loadingId });
        throw error;
      }
    },
    [client, mutateAsync]
  );

  return { execute };
}
