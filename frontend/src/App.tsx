import { useEffect, useMemo, useState } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";

import { Card } from "./components/Card";
import { Spinner } from "./components/Spinner";
import { useAvatarActions } from "./hooks/useAvatarActions";
import { useAvatarAdminState, useAvatarMintConfig } from "./hooks/useAvatarContract";
import { AVATAR_CONTRACT } from "./config/avatarContract";
import { parseError, shortAddress, toSui } from "./lib/format";

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong className={mono ? "mono" : undefined}>{value}</strong>
    </div>
  );
}

function MetricTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </div>
  );
}

export function App() {
  const account = useCurrentAccount();
  const mintConfig = useAvatarMintConfig();
  const adminState = useAvatarAdminState();
  const { pendingAction, pauseMint, resumeMint, setMintPrice } = useAvatarActions();
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    if (mintConfig.data?.mintPriceMist) {
      setPriceInput(mintConfig.data.mintPriceMist);
    }
  }, [mintConfig.data?.mintPriceMist]);

  const adminOwner = adminState.data?.ownerAddress ?? "Unknown";
  const canAdmin = Boolean(account && adminState.data?.connectedIsAdmin);
  const mintStatus = mintConfig.data?.mintEnabled ? "Enabled" : "Paused";
  const treasuryDisplay = useMemo(() => {
    const treasury = mintConfig.data?.treasuryBalanceMist;
    return treasury ? `${treasury} MIST` : "Unavailable";
  }, [mintConfig.data?.treasuryBalanceMist]);

  const refreshMintConfig = async () => {
    const result = await mintConfig.refetch();
    if (result.error) {
      toast.error(parseError(result.error));
      return;
    }
    toast.success("Mint config refreshed");
  };

  const handlePauseMint = async () => {
    try {
      await pauseMint();
      await Promise.all([mintConfig.refetch(), adminState.refetch()]);
    } catch {
      // Toast handled in useTxExecutor.
    }
  };

  const handleResumeMint = async () => {
    try {
      await resumeMint();
      await Promise.all([mintConfig.refetch(), adminState.refetch()]);
    } catch {
      // Toast handled in useTxExecutor.
    }
  };

  const handleSetPrice = async () => {
    try {
      await setMintPrice(priceInput);
      await mintConfig.refetch();
    } catch {
      // Toast handled in useTxExecutor.
    }
  };

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <main className="container">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">Sui Mainnet Dashboard</div>
            <h1>Anavrin Avatar</h1>
            <p>
              Read live contract state for <span className="mono">anavrin::avatar</span> and test
              the first admin mint controls with programmable transaction blocks.
            </p>
          </div>

          <div className="hero-panel">
            <div className="hero-chip">
              <span>Network</span>
              <strong>Sui Mainnet</strong>
            </div>
            <div className="hero-chip">
              <span>Connected Wallet</span>
              <strong>{shortAddress(account?.address)}</strong>
            </div>
            <ConnectButton />
          </div>
        </section>

        <section className="top-grid">
          <Card title="Admin State" eyebrow="Access" tone="amber">
            {adminState.isLoading ? (
              <div className="loading-row">
                <Spinner />
                <span>Reading AdminCap ownership...</span>
              </div>
            ) : (
              <div className="stack">
                <div className={`pill ${canAdmin ? "pill-success" : "pill-muted"}`}>
                  {canAdmin ? "Connected wallet can administer this contract" : "Read-only mode"}
                </div>
                <DetailRow label="AdminCap Owner" value={adminOwner} mono />
                <DetailRow
                  label="Connected Wallet"
                  value={account?.address ?? "Connect wallet to unlock write actions"}
                  mono
                />
              </div>
            )}
          </Card>

          <Card title="Contract Info" eyebrow="References" tone="sky">
            <div className="stack">
              <DetailRow label="Package ID" value={AVATAR_CONTRACT.packageId} mono />
              <DetailRow label="Module Name" value={AVATAR_CONTRACT.module} mono />
              <DetailRow label="Mint Config ID" value={AVATAR_CONTRACT.mintConfigId} mono />
              <DetailRow label="Transfer Policy ID" value={AVATAR_CONTRACT.transferPolicyId} mono />
            </div>
          </Card>
        </section>

        {!account ? (
          <section className="connect-banner">
            <div>
              <div className="eyebrow">Wallet Required</div>
              <h2>Connect a wallet to test admin actions</h2>
              <p>
                Reading chain state works without a wallet. Write calls require the wallet that owns
                the configured AdminCap.
              </p>
            </div>
            <ConnectButton />
          </section>
        ) : null}

        <section className="dashboard-grid">
          <Card
            title="Mint Config"
            eyebrow="On-Chain State"
            tone="sky"
            action={
              <button
                className="button button-ghost"
                onClick={refreshMintConfig}
                disabled={mintConfig.isFetching}
                type="button"
              >
                {mintConfig.isFetching ? "Refreshing..." : "Read Mint Config"}
              </button>
            }
          >
            {mintConfig.isLoading ? (
              <div className="loading-row">
                <Spinner />
                <span>Loading MintConfig object from chain...</span>
              </div>
            ) : mintConfig.error ? (
              <div className="error-box">{parseError(mintConfig.error)}</div>
            ) : (
              <div className="metric-grid">
                <MetricTile
                  label="mint_price_mist"
                  value={`${mintConfig.data?.mintPriceMist ?? "0"} MIST`}
                  helper={`≈ ${toSui(mintConfig.data?.mintPriceMist)} SUI`}
                />
                <MetricTile
                  label="mint_enabled"
                  value={mintStatus}
                  helper={
                    mintConfig.data?.ownerKind === "shared" ? "Shared object" : "Owner state unavailable"
                  }
                />
                <MetricTile
                  label="treasury balance"
                  value={treasuryDisplay}
                  helper={`≈ ${toSui(mintConfig.data?.treasuryBalanceMist)} SUI`}
                />
                <div className="status-box">
                  <span>Status</span>
                  <div className={`pill ${mintConfig.data?.mintEnabled ? "pill-success" : "pill-danger"}`}>
                    {mintStatus}
                  </div>
                  <small className="mono">{mintConfig.data?.objectId ?? AVATAR_CONTRACT.mintConfigId}</small>
                </div>
              </div>
            )}
          </Card>

          <Card title="Actions" eyebrow="First Controls" tone="neutral">
            <div className="action-layout">
              <div className="stack">
                <div className="info-box">
                  <h3>Mint Lifecycle</h3>
                  <p>
                    Toggle mint availability using the published AdminCap and shared MintConfig object.
                  </p>
                  <div className="button-row">
                    <button
                      className="button button-secondary"
                      onClick={handleResumeMint}
                      disabled={!canAdmin || pendingAction !== null}
                      type="button"
                    >
                      {pendingAction === "resume" ? "Resuming..." : "Resume Mint"}
                    </button>
                    <button
                      className="button button-danger"
                      onClick={handlePauseMint}
                      disabled={!canAdmin || pendingAction !== null}
                      type="button"
                    >
                      {pendingAction === "pause" ? "Pausing..." : "Pause Mint"}
                    </button>
                  </div>
                </div>

                <div className="info-box">
                  <h3>Permissions</h3>
                  <p>
                    Admin actions are enabled only when the connected wallet matches the on-chain
                    AdminCap owner.
                  </p>
                  <small className="mono">Expected owner: {adminOwner}</small>
                </div>
              </div>

              <div className="info-box price-box">
                <div className="price-header">
                  <div>
                    <h3>Set Mint Price</h3>
                    <p>
                      Enter a whole-number MIST value. This sends a programmable transaction block to
                      <span className="mono"> set_mint_price</span>.
                    </p>
                  </div>
                  <div className="pill pill-muted">PTB</div>
                </div>

                <div className="price-form">
                  <label>
                    <span>new_price_mist</span>
                    <input
                      className="input"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={priceInput}
                      onChange={(event) => setPriceInput(event.target.value.replace(/[^\d]/g, ""))}
                    />
                  </label>
                  <button
                    className="button button-primary"
                    onClick={handleSetPrice}
                    disabled={!canAdmin || pendingAction !== null || priceInput.trim().length === 0}
                    type="button"
                  >
                    {pendingAction === "set-price" ? "Saving..." : "Set Mint Price"}
                  </button>
                </div>

                <div className="metric-grid compact-grid">
                  <MetricTile
                    label="Current"
                    value={`${mintConfig.data?.mintPriceMist ?? "0"} MIST`}
                  />
                  <MetricTile
                    label="Preview"
                    value={`${priceInput.trim() || "0"} MIST`}
                    helper={`≈ ${toSui(priceInput || "0")} SUI`}
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
