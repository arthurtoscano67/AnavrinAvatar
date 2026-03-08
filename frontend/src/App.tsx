import { useEffect, useMemo, useState } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";

import { Card } from "./components/Card";
import { Spinner } from "./components/Spinner";
import { AVATAR_CONTRACT } from "./config/avatarContract";
import { AVATAR_RENDERER } from "./config/avatarRenderer";
import { useAvatarActions } from "./hooks/useAvatarActions";
import { useAvatarAdminState, useAvatarMintConfig } from "./hooks/useAvatarContract";
import {
  AVATAR_MINT_DEFAULTS,
  FACE_PRESET_OPTIONS,
  FRAME_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_TYPE_OPTIONS,
  MINT_LIMITS,
  SKIN_TONE_OPTIONS,
  STYLE_OPTIONS,
  buildAvatarRendererAssets,
  buildMintChoiceSummary,
  hasRequiredMintFields,
  type AvatarMintFormValues,
  type AvatarMintResult,
  type AvatarRendererAssets,
} from "./lib/avatarMint";
import { parseError, shortAddress, toSui } from "./lib/format";

type AppView = "dashboard" | "mint";
type PreviewState = "idle" | "loading" | "ready" | "error";

function getViewFromHash(): AppView {
  if (typeof window === "undefined") {
    return "dashboard";
  }

  return window.location.hash === "#mint" ? "mint" : "dashboard";
}

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

function FieldLabel({
  label,
  helper,
}: {
  label: string;
  helper?: string;
}) {
  return (
    <div className="field-head">
      <span>{label}</span>
      {helper ? <small>{helper}</small> : null}
    </div>
  );
}

export function App() {
  const account = useCurrentAccount();
  const mintConfig = useAvatarMintConfig();
  const adminState = useAvatarAdminState();
  const { pendingAction, mintAvatar, pauseMint, resumeMint, setMintPrice } = useAvatarActions();
  const [view, setView] = useState<AppView>(() => getViewFromHash());
  const [priceInput, setPriceInput] = useState("");
  const [mintForm, setMintForm] = useState<AvatarMintFormValues>(() => ({ ...AVATAR_MINT_DEFAULTS }));
  const [mintResult, setMintResult] = useState<AvatarMintResult | null>(null);
  const [lastMintAssets, setLastMintAssets] = useState<AvatarRendererAssets | null>(null);
  const [imagePreviewState, setImagePreviewState] = useState<PreviewState>("idle");
  const [motionPreviewState, setMotionPreviewState] = useState<PreviewState>("idle");
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (mintConfig.data?.mintPriceMist) {
      setPriceInput(mintConfig.data.mintPriceMist);
    }
  }, [mintConfig.data?.mintPriceMist]);

  useEffect(() => {
    const handleHashChange = () => setView(getViewFromHash());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const rendererAssets = useMemo(() => {
    if (!AVATAR_RENDERER.isConfigured) {
      return null;
    }

    return buildAvatarRendererAssets(AVATAR_RENDERER.baseUrl, mintForm);
  }, [mintForm]);

  useEffect(() => {
    if (!rendererAssets) {
      setImagePreviewState("idle");
      setMotionPreviewState("idle");
      setPreviewError(null);
      return;
    }

    setImagePreviewState("loading");
    setMotionPreviewState("loading");
    setPreviewError(null);
  }, [rendererAssets?.imageUrl, rendererAssets?.motionPreviewUrl]);

  const adminOwner = adminState.data?.ownerAddress ?? "Unknown";
  const canAdmin = Boolean(account && adminState.data?.connectedIsAdmin);
  const mintStatus = mintConfig.data?.mintEnabled ? "Enabled" : "Paused";
  const mintPriceMist = mintConfig.data?.mintPriceMist ?? "0";
  const isFreeMint = mintPriceMist === "0";
  const mintModeLabel = isFreeMint ? "Free Mint" : `${mintPriceMist} MIST`;
  const mintChoiceSummary = useMemo(() => buildMintChoiceSummary(mintForm), [mintForm]);
  const treasuryDisplay = useMemo(() => {
    const treasury = mintConfig.data?.treasuryBalanceMist;
    return treasury ? `${treasury} MIST` : "Unavailable";
  }, [mintConfig.data?.treasuryBalanceMist]);

  const mintGuardMessage = useMemo(() => {
    if (!account) {
      return "Connect a wallet to mint your first avatar.";
    }

    if (mintConfig.isLoading) {
      return "Reading live MintConfig before minting.";
    }

    if (mintConfig.error) {
      return "MintConfig could not be read from chain.";
    }

    if (!mintConfig.data?.mintEnabled) {
      return "Mint is currently paused.";
    }

    if (!AVATAR_RENDERER.isConfigured) {
      return "Set VITE_AVATAR_RENDERER_URL so Railway can generate image and motion previews.";
    }

    if (!hasRequiredMintFields(mintForm)) {
      return "Fill in name and description, then Railway will handle the media automatically.";
    }

    if (!rendererAssets) {
      return "Preparing Railway render URLs.";
    }

    if (previewError) {
      return previewError;
    }

    if (imagePreviewState !== "ready") {
      return "Waiting for the Railway image preview to load.";
    }

    if (pendingAction !== null) {
      return "Wait for the current transaction to finish.";
    }

    return null;
  }, [
    account,
    imagePreviewState,
    mintConfig.data?.mintEnabled,
    mintConfig.error,
    mintConfig.isLoading,
    mintForm,
    pendingAction,
    previewError,
    rendererAssets,
  ]);

  const switchView = (nextView: AppView) => {
    if (nextView === view) {
      return;
    }

    window.location.hash = nextView === "mint" ? "mint" : "dashboard";
    window.scrollTo({ top: 0, behavior: "smooth" });
    setView(nextView);
  };

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

  const handleMintAvatar = async () => {
    if (!mintConfig.data) {
      toast.error("MintConfig is not ready yet.");
      return;
    }

    if (!rendererAssets) {
      toast.error("Railway renderer URLs are not ready.");
      return;
    }

    try {
      const result = await mintAvatar(mintForm, mintConfig.data.mintPriceMist, rendererAssets);
      setMintResult(result);
      setLastMintAssets(rendererAssets);
      await mintConfig.refetch();
    } catch {
      // Toast handled in useTxExecutor or action hook.
    }
  };

  const updateMintField = <Field extends keyof AvatarMintFormValues>(
    field: Field,
    value: AvatarMintFormValues[Field]
  ) => {
    setMintForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <main className="container">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">{view === "mint" ? "Railway-Powered Mint" : "Sui Mainnet Dashboard"}</div>
            <h1>Anavrin Avatar</h1>
            <p>
              {view === "mint"
                ? "Users customize once, Railway generates the artwork automatically, and the mint writes those media URLs into the NFT."
                : "Read live contract state, adjust mint controls, and verify admin access for anavrin::avatar."}
            </p>
          </div>

          <div className="hero-panel">
            <div className="view-tabs" role="tablist" aria-label="Anavrin Avatar sections">
              <button
                className={`view-tab ${view === "dashboard" ? "view-tab-active" : ""}`}
                onClick={() => switchView("dashboard")}
                type="button"
              >
                Dashboard
              </button>
              <button
                className={`view-tab ${view === "mint" ? "view-tab-active" : ""}`}
                onClick={() => switchView("mint")}
                type="button"
              >
                Mint Avatar
              </button>
            </div>

            <div className="hero-chip-row">
              <div className="hero-chip">
                <span>Network</span>
                <strong>Sui Mainnet</strong>
              </div>
              <div className="hero-chip">
                <span>Renderer</span>
                <strong>{AVATAR_RENDERER.isConfigured ? "Railway Connected" : "Not configured"}</strong>
              </div>
              <div className="hero-chip">
                <span>Connected Wallet</span>
                <strong>{shortAddress(account?.address)}</strong>
              </div>
              <div className="hero-chip">
                <span>Mint Mode</span>
                <strong>{mintModeLabel}</strong>
              </div>
            </div>

            <ConnectButton />
          </div>
        </section>

        {!account ? (
          <section className="connect-banner">
            <div>
              <div className="eyebrow">Wallet Required</div>
              <h2>Connect a wallet to write to chain</h2>
              <p>
                Reads work without a wallet. Minting and admin actions require a connected Sui wallet.
              </p>
            </div>
            <ConnectButton />
          </section>
        ) : null}

        {view === "dashboard" ? (
          <>
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
                      value={`${mintPriceMist} MIST`}
                      helper={`≈ ${toSui(mintPriceMist)} SUI`}
                    />
                    <MetricTile
                      label="mint_enabled"
                      value={mintStatus}
                      helper={
                        mintConfig.data?.ownerKind === "shared"
                          ? "Shared object"
                          : "Owner state unavailable"
                      }
                    />
                    <MetricTile
                      label="treasury balance"
                      value={treasuryDisplay}
                      helper={`≈ ${toSui(mintConfig.data?.treasuryBalanceMist)} SUI`}
                    />
                    <div className="status-box">
                      <span>Status</span>
                      <div
                        className={`pill ${
                          mintConfig.data?.mintEnabled ? "pill-success" : "pill-danger"
                        }`}
                      >
                        {mintStatus}
                      </div>
                      <small className="mono">
                        {mintConfig.data?.objectId ?? AVATAR_CONTRACT.mintConfigId}
                      </small>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Actions" eyebrow="Admin Controls" tone="neutral">
                <div className="stack">
                  <div className="info-box">
                    <h3>Mint Lifecycle</h3>
                    <p>
                      Toggle mint availability using the published AdminCap and shared MintConfig
                      object.
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
                    <div className="section-heading">
                      <div>
                        <h3>Set Mint Price</h3>
                        <p>
                          Send a programmable transaction block to <span className="mono">set_mint_price</span>.
                        </p>
                      </div>
                      <div className="pill pill-muted">PTB</div>
                    </div>

                    <div className="price-form">
                      <label className="field">
                        <FieldLabel label="new_price_mist" />
                        <input
                          className="input"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={priceInput}
                          onChange={(event) =>
                            setPriceInput(event.target.value.replace(/[^\d]/g, ""))
                          }
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
                      <MetricTile label="Current" value={`${mintPriceMist} MIST`} />
                      <MetricTile
                        label="Preview"
                        value={`${priceInput.trim() || "0"} MIST`}
                        helper={`≈ ${toSui(priceInput || "0")} SUI`}
                      />
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
              </Card>
            </section>
          </>
        ) : (
          <section className="mint-layout">
            <Card title="Customize Avatar" eyebrow="User Input" tone="sky">
              <div className="stack">
                <div className="info-box">
                  <h3>Automatic Railway Media</h3>
                  <p>
                    Users only customize traits and metadata here. The image, portrait, and model
                    URLs are generated automatically from the Railway renderer.
                  </p>
                  <small className="mono">
                    Renderer base: {AVATAR_RENDERER.baseUrl || "VITE_AVATAR_RENDERER_URL not set"}
                  </small>
                </div>

                <div className="mint-form-grid">
                  <label className="field field-span-2">
                    <FieldLabel label="Name" helper={`${mintForm.name.length}/${MINT_LIMITS.name}`} />
                    <input
                      className="input"
                      maxLength={MINT_LIMITS.name}
                      placeholder="Genesis Runner"
                      value={mintForm.name}
                      onChange={(event) => updateMintField("name", event.target.value)}
                    />
                  </label>

                  <label className="field field-span-2">
                    <FieldLabel
                      label="Description"
                      helper={`${mintForm.description.length}/${MINT_LIMITS.description}`}
                    />
                    <textarea
                      className="textarea"
                      maxLength={MINT_LIMITS.description}
                      rows={4}
                      value={mintForm.description}
                      onChange={(event) => updateMintField("description", event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <FieldLabel label="Frame Type" />
                    <select
                      className="select"
                      value={mintForm.frameType}
                      onChange={(event) => updateMintField("frameType", Number(event.target.value))}
                    >
                      {FRAME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel label="Skin Tone" />
                    <select
                      className="select"
                      value={mintForm.skinTone}
                      onChange={(event) => updateMintField("skinTone", Number(event.target.value))}
                    >
                      {SKIN_TONE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel label="Hair Type" />
                    <select
                      className="select"
                      value={mintForm.hairType}
                      onChange={(event) => updateMintField("hairType", Number(event.target.value))}
                    >
                      {HAIR_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel label="Hair Color" />
                    <select
                      className="select"
                      value={mintForm.hairColor}
                      onChange={(event) => updateMintField("hairColor", Number(event.target.value))}
                    >
                      {HAIR_COLOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel label="Anime Face Preset" />
                    <select
                      className="select"
                      value={mintForm.facePreset}
                      onChange={(event) => updateMintField("facePreset", Number(event.target.value))}
                    >
                      {FACE_PRESET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field field-span-2">
                    <FieldLabel label="Style Type" />
                    <select
                      className="select"
                      value={mintForm.styleType}
                      onChange={(event) => updateMintField("styleType", Number(event.target.value))}
                    >
                      {STYLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </Card>

            <Card title="Railway Preview" eyebrow="Auto-Generated Media" tone="amber">
              <div className="stack">
                <div className="preview-grid">
                  <div className="preview-panel">
                    <div className="preview-label">Marketplace Image</div>
                    <div className="preview-frame">
                      {!rendererAssets ? (
                        <div className="preview-empty">Configure the Railway renderer to load the preview.</div>
                      ) : (
                        <>
                          {imagePreviewState === "loading" ? (
                            <div className="preview-loading">
                              <Spinner />
                              <span>Loading Railway image...</span>
                            </div>
                          ) : null}
                          <img
                            alt="Avatar preview"
                            className={`preview-image ${imagePreviewState === "ready" ? "preview-image-ready" : ""}`}
                            key={rendererAssets.imageUrl}
                            src={rendererAssets.imageUrl}
                            onLoad={() => setImagePreviewState("ready")}
                            onError={() => {
                              setImagePreviewState("error");
                              setPreviewError("Railway image preview failed to load.");
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="preview-panel">
                    <div className="preview-label">Motion Scene</div>
                    <div className="preview-frame">
                      {!rendererAssets ? (
                        <div className="preview-empty">Animated SVG preview appears here.</div>
                      ) : (
                        <>
                          {motionPreviewState === "loading" ? (
                            <div className="preview-loading">
                              <Spinner />
                              <span>Loading motion scene...</span>
                            </div>
                          ) : null}
                          <img
                            alt="Avatar motion preview"
                            className={`preview-image ${motionPreviewState === "ready" ? "preview-image-ready" : ""}`}
                            key={rendererAssets.motionPreviewUrl}
                            src={rendererAssets.motionPreviewUrl}
                            onLoad={() => setMotionPreviewState("ready")}
                            onError={() => setMotionPreviewState("error")}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="info-box">
                  <h3>Generated Media Endpoints</h3>
                  <p>
                    These are filled automatically and used during mint. Users do not edit them.
                  </p>
                  <div className="stack">
                    <DetailRow
                      label="image_url"
                      value={rendererAssets?.imageUrl ?? "Waiting for Railway renderer"}
                      mono
                    />
                    <DetailRow
                      label="portrait_uri"
                      value={rendererAssets?.portraitUri ?? "Waiting for Railway renderer"}
                      mono
                    />
                    <DetailRow
                      label="base_model_uri"
                      value={rendererAssets?.baseModelUri ?? "Waiting for Railway renderer"}
                      mono
                    />
                  </div>
                </div>

                <div className="info-box">
                  <h3>Mint Summary</h3>
                  <p>
                    Users customize traits here. Railway turns that into preview media, and the mint
                    transaction writes those renderer URLs into the NFT.
                  </p>

                  <div className="metric-grid compact-grid">
                    <MetricTile label="Mint Mode" value={mintModeLabel} />
                    <MetricTile label="Mint Status" value={mintStatus} />
                  </div>

                  <div className="token-row">
                    {mintChoiceSummary.map((choice) => (
                      <span className="token-pill" key={choice}>
                        {choice}
                      </span>
                    ))}
                  </div>

                  <small>Level 1 start, 10 base points in every stat, calm voice, relaxed idle.</small>
                </div>

                <div
                  className={`notice-box ${mintGuardMessage ? "notice-box-warning" : "notice-box-success"}`}
                >
                  {mintGuardMessage ?? "Preview ready. Mint will use the Railway-generated media URLs."}
                </div>

                {mintResult ? (
                  <div className="info-box">
                    <h3>Latest Mint</h3>
                    <div className="minted-result-grid">
                      <div className="minted-thumb">
                        {lastMintAssets ? (
                          <img alt="Minted avatar" className="preview-image preview-image-ready" src={lastMintAssets.imageUrl} />
                        ) : null}
                      </div>
                      <div className="stack">
                        <DetailRow label="Avatar ID" value={mintResult.avatarId ?? "Unavailable"} mono />
                        <DetailRow label="Digest" value={mintResult.digest} mono />
                        <DetailRow label="Owner" value={mintResult.owner ?? account?.address ?? "Unknown"} mono />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="action-button-stack">
                  <button
                    className="button button-ghost"
                    onClick={() => setMintForm({ ...AVATAR_MINT_DEFAULTS })}
                    type="button"
                  >
                    Reset Form
                  </button>
                  <button
                    className="button button-primary"
                    onClick={handleMintAvatar}
                    disabled={mintGuardMessage !== null}
                    type="button"
                  >
                    {pendingAction === "mint"
                      ? "Minting..."
                      : isFreeMint
                        ? "Mint First Avatar"
                        : `Mint Avatar for ${mintPriceMist} MIST`}
                  </button>
                </div>
              </div>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
