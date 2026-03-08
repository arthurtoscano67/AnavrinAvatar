import type { SuiTransactionBlockResponse } from "@mysten/sui/client";

import { AVATAR_EVENTS, AVATAR_TYPES } from "../config/avatarContract";

type MintOption = {
  label: string;
  value: number;
};

export type AvatarMintFormValues = {
  name: string;
  description: string;
  frameType: number;
  skinTone: number;
  hairType: number;
  hairColor: number;
  facePreset: number;
  styleType: number;
};

export type AvatarRendererAssets = {
  imageUrl: string;
  portraitUri: string;
  baseModelUri: string;
  motionPreviewUrl: string;
};

type AvatarMintPayload = {
  name: string;
  description: string;
  imageUrl: string;
  baseModelUri: string;
  portraitUri: string;
  frameType: number;
  skinTone: number;
  hairType: number;
  hairColor: number;
  heightClass: number;
  bodyType: number;
  faceStyle: number;
  eyeColor: number;
  eyeStyle: number;
  mouthStyle: number;
  facialHair: number;
  expressionProfile: number;
  voiceType: number;
  styleType: number;
  idleStyle: number;
  walkStyle: number;
  baseEmotePack: number;
};

type FacePreset = MintOption & {
  faceStyle: number;
  eyeStyle: number;
  mouthStyle: number;
  expressionProfile: number;
};

export type AvatarMintResult = {
  avatarId: string | null;
  digest: string;
  owner: string | null;
};

export const MINT_LIMITS = {
  name: 32,
  description: 280,
  uri: 512,
} as const;

export const FRAME_OPTIONS: MintOption[] = [
  { label: "Masculine", value: 0 },
  { label: "Feminine", value: 1 },
];

export const SKIN_TONE_OPTIONS: MintOption[] = [
  { label: "Light Peach", value: 0 },
  { label: "Peach", value: 1 },
  { label: "Peach Brown", value: 2 },
  { label: "Brown", value: 3 },
  { label: "Dark Brown", value: 4 },
];

export const HAIR_TYPE_OPTIONS: MintOption[] = [
  { label: "Bald", value: 0 },
  { label: "Short", value: 1 },
  { label: "Long", value: 2 },
  { label: "Curly", value: 3 },
  { label: "Braids", value: 4 },
  { label: "Locs", value: 5 },
  { label: "Ponytail", value: 6 },
  { label: "Buzz", value: 7 },
  { label: "Wavy", value: 8 },
];

export const HAIR_COLOR_OPTIONS: MintOption[] = [
  { label: "Black", value: 0 },
  { label: "Dark Brown", value: 1 },
  { label: "Brown", value: 2 },
  { label: "Light Brown", value: 3 },
  { label: "Blonde", value: 4 },
  { label: "Red", value: 5 },
  { label: "Gray", value: 6 },
  { label: "White Silver", value: 7 },
  { label: "Blue", value: 8 },
  { label: "Pink", value: 9 },
];

export const FACE_PRESET_OPTIONS: FacePreset[] = [
  {
    label: "Sunny Smile",
    value: 0,
    faceStyle: 1,
    eyeStyle: 3,
    mouthStyle: 1,
    expressionProfile: 2,
  },
  {
    label: "Calm Dreamer",
    value: 1,
    faceStyle: 0,
    eyeStyle: 1,
    mouthStyle: 0,
    expressionProfile: 0,
  },
  {
    label: "Hero Focus",
    value: 2,
    faceStyle: 3,
    eyeStyle: 2,
    mouthStyle: 4,
    expressionProfile: 1,
  },
  {
    label: "Wink Mischief",
    value: 3,
    faceStyle: 4,
    eyeStyle: 5,
    mouthStyle: 1,
    expressionProfile: 2,
  },
  {
    label: "Sleepy Chill",
    value: 4,
    faceStyle: 2,
    eyeStyle: 4,
    mouthStyle: 5,
    expressionProfile: 5,
  },
];

export const STYLE_OPTIONS: MintOption[] = [
  { label: "Street", value: 0 },
  { label: "Tactical", value: 1 },
  { label: "Luxury", value: 2 },
  { label: "Sporty", value: 3 },
  { label: "Futuristic", value: 4 },
  { label: "Casual", value: 5 },
];

export const AVATAR_MINT_DEFAULTS: AvatarMintFormValues = {
  name: "",
  description: "Genesis avatar for the Anavrin world.",
  frameType: 0,
  skinTone: 1,
  hairType: 1,
  hairColor: 0,
  facePreset: 0,
  styleType: 5,
};

function trimField(value: string, field: string, maxLength: number) {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} is required.`);
  }
  if (normalized.length > maxLength) {
    throw new Error(`${field} must be ${maxLength} characters or fewer.`);
  }
  return normalized;
}

function readString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  return null;
}

function optionLabel(options: MintOption[], value: number) {
  return options.find((option) => option.value === value)?.label ?? String(value);
}

function resolveFacePreset(value: number) {
  return FACE_PRESET_OPTIONS.find((preset) => preset.value === value) ?? FACE_PRESET_OPTIONS[0];
}

function buildRendererQuery(form: AvatarMintFormValues) {
  const params = new URLSearchParams({
    name: form.name.trim() || "Anavrin Avatar",
    frameType: String(form.frameType),
    skinTone: String(form.skinTone),
    hairType: String(form.hairType),
    hairColor: String(form.hairColor),
    facePreset: String(form.facePreset),
    styleType: String(form.styleType),
  });

  return params.toString();
}

export function hasRequiredMintFields(form: AvatarMintFormValues) {
  return Boolean(form.name.trim() && form.description.trim());
}

export function buildMintChoiceSummary(form: AvatarMintFormValues) {
  return [
    optionLabel(FRAME_OPTIONS, form.frameType),
    optionLabel(SKIN_TONE_OPTIONS, form.skinTone),
    optionLabel(HAIR_TYPE_OPTIONS, form.hairType),
    optionLabel(HAIR_COLOR_OPTIONS, form.hairColor),
    optionLabel(FACE_PRESET_OPTIONS, form.facePreset),
    optionLabel(STYLE_OPTIONS, form.styleType),
  ];
}

export function buildAvatarRendererAssets(
  rendererBaseUrl: string,
  form: AvatarMintFormValues
): AvatarRendererAssets {
  const normalizedBaseUrl = rendererBaseUrl.trim().replace(/\/+$/, "");
  if (!normalizedBaseUrl) {
    throw new Error("Renderer URL is not configured.");
  }

  const query = buildRendererQuery(form);

  return {
    imageUrl: `${normalizedBaseUrl}/api/avatar/image.svg?${query}`,
    portraitUri: `${normalizedBaseUrl}/api/avatar/portrait.svg?${query}`,
    baseModelUri: `${normalizedBaseUrl}/api/avatar/model.json?${query}`,
    motionPreviewUrl: `${normalizedBaseUrl}/api/avatar/motion.svg?${query}`,
  };
}

export function buildAvatarMintPayload(
  form: AvatarMintFormValues,
  assets: AvatarRendererAssets
): AvatarMintPayload {
  const facePreset = resolveFacePreset(form.facePreset);

  return {
    name: trimField(form.name, "Name", MINT_LIMITS.name),
    description: trimField(form.description, "Description", MINT_LIMITS.description),
    imageUrl: trimField(assets.imageUrl, "Image URL", MINT_LIMITS.uri),
    baseModelUri: trimField(assets.baseModelUri, "Base model URI", MINT_LIMITS.uri),
    portraitUri: trimField(assets.portraitUri, "Portrait URI", MINT_LIMITS.uri),
    frameType: form.frameType,
    skinTone: form.skinTone,
    hairType: form.hairType,
    hairColor: form.hairColor,
    heightClass: 1,
    bodyType: 1,
    faceStyle: facePreset.faceStyle,
    eyeColor: 0,
    eyeStyle: facePreset.eyeStyle,
    mouthStyle: facePreset.mouthStyle,
    facialHair: 0,
    expressionProfile: facePreset.expressionProfile,
    voiceType: 0,
    styleType: form.styleType,
    idleStyle: 0,
    walkStyle: 0,
    baseEmotePack: 0,
  };
}

export function extractMintedAvatar(
  block: SuiTransactionBlockResponse,
  digest: string
): AvatarMintResult {
  for (const event of block.events ?? []) {
    if (event.type === AVATAR_EVENTS.avatarMinted) {
      const parsed = (event.parsedJson ?? {}) as Record<string, unknown>;
      return {
        avatarId: readString(parsed.avatar_id),
        digest,
        owner: readString(parsed.owner),
      };
    }
  }

  for (const change of block.objectChanges ?? []) {
    if (change.type === "created" && change.objectType === AVATAR_TYPES.avatar) {
      return {
        avatarId: change.objectId,
        digest,
        owner: null,
      };
    }
  }

  return {
    avatarId: null,
    digest,
    owner: null,
  };
}
