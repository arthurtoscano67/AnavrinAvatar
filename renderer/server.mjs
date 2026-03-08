import http from "node:http";

const port = Number(process.env.PORT || 8788);

const skinTones = ["#f6d6c2", "#e8b899", "#c88c6c", "#915b42", "#5f392d"];
const hairColors = ["#151515", "#3a241c", "#694536", "#8b6148", "#e6c26b", "#c55d46", "#8f939f", "#d7dae2", "#4884ff", "#ff77be"];
const stylePalettes = [
  { bgA: "#0b1024", bgB: "#1c63b4", accent: "#57bcff", text: "Street" },
  { bgA: "#081116", bgB: "#286067", accent: "#64d7c7", text: "Tactical" },
  { bgA: "#120d1d", bgB: "#8d642f", accent: "#f5c067", text: "Luxury" },
  { bgA: "#111323", bgB: "#2d5fd6", accent: "#7ed7ff", text: "Sporty" },
  { bgA: "#071022", bgB: "#7239ff", accent: "#9ec0ff", text: "Futuristic" },
  { bgA: "#15151a", bgB: "#475067", accent: "#b7c5df", text: "Casual" },
];

const frameLabels = ["Masculine", "Feminine"];
const hairLabels = ["Bald", "Short", "Long", "Curly", "Braids", "Locs", "Ponytail", "Buzz", "Wavy"];
const toneLabels = ["Light Peach", "Peach", "Peach Brown", "Brown", "Dark Brown"];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function readAppearance(url) {
  const name = (url.searchParams.get("name") || "Anavrin Avatar").trim().slice(0, 32);
  const frameType = clamp(Number(url.searchParams.get("frameType") || 0) || 0, 0, 1);
  const skinTone = clamp(Number(url.searchParams.get("skinTone") || 0) || 0, 0, 4);
  const hairType = clamp(Number(url.searchParams.get("hairType") || 0) || 0, 0, 8);
  const hairColor = clamp(Number(url.searchParams.get("hairColor") || 0) || 0, 0, 9);
  const styleType = clamp(Number(url.searchParams.get("styleType") || 0) || 0, 0, 5);

  return {
    name: name || "Anavrin Avatar",
    frameType,
    skinTone,
    hairType,
    hairColor,
    styleType,
    frameLabel: frameLabels[frameType],
    skinLabel: toneLabels[skinTone],
    hairLabel: hairLabels[hairType],
    styleLabel: stylePalettes[styleType].text,
    skinHex: skinTones[skinTone],
    hairHex: hairColors[hairColor],
    palette: stylePalettes[styleType],
  };
}

function badge(x, y, width, text, fill) {
  return `
    <g transform="translate(${x} ${y})">
      <rect rx="18" ry="18" width="${width}" height="36" fill="${fill}" fill-opacity="0.16" stroke="${fill}" stroke-opacity="0.38" />
      <text x="${width / 2}" y="24" text-anchor="middle" fill="#f5f7fb" font-size="14" font-family="Inter, system-ui" font-weight="700">${escapeXml(text)}</text>
    </g>
  `;
}

function hairShape(appearance) {
  const { hairType, hairHex, frameType } = appearance;

  if (hairType === 0) {
    return "";
  }

  const offset = frameType === 0 ? 0 : -8;

  if (hairType === 6) {
    return `
      <path d="M365 ${192 + offset} C 440 92, 594 116, 654 ${188 + offset} L 646 ${252 + offset} C 590 ${214 + offset}, 430 ${210 + offset}, 372 ${252 + offset} Z" fill="${hairHex}" />
      <path d="M620 ${164 + offset} C 690 188, 698 274, 640 ${312 + offset}" stroke="${hairHex}" stroke-width="22" stroke-linecap="round" />
    `;
  }

  if (hairType === 4 || hairType === 5) {
    return `
      <path d="M350 ${198 + offset} C 420 88, 606 102, 676 ${218 + offset} L 664 ${274 + offset} C 598 ${228 + offset}, 424 ${228 + offset}, 360 ${276 + offset} Z" fill="${hairHex}" />
      <circle cx="368" cy="${316 + offset}" r="16" fill="${hairHex}" />
      <circle cx="410" cy="${338 + offset}" r="14" fill="${hairHex}" />
      <circle cx="628" cy="${330 + offset}" r="16" fill="${hairHex}" />
      <circle cx="584" cy="${352 + offset}" r="14" fill="${hairHex}" />
    `;
  }

  if (hairType === 2 || hairType === 8) {
    return `
      <path d="M344 ${204 + offset} C 402 94, 618 100, 678 ${226 + offset} L 664 ${360 + offset} C 612 ${326 + offset}, 430 ${326 + offset}, 360 ${364 + offset} Z" fill="${hairHex}" />
    `;
  }

  return `
    <path d="M344 ${204 + offset} C 420 86, 608 96, 678 ${224 + offset} L 658 ${284 + offset} C 582 ${248 + offset}, 452 ${244 + offset}, 360 ${288 + offset} Z" fill="${hairHex}" />
  `;
}

function avatarSvg(appearance, { width, height, animated = false, portrait = false }) {
  const { name, frameLabel, skinLabel, hairLabel, styleLabel, palette, skinHex, hairHex } = appearance;
  const title = portrait ? "Portrait" : "Avatar";
  const badgeFill = palette.accent;
  const shoulderWidth = portrait ? 300 : 370;
  const torsoY = portrait ? 560 : 600;

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1024 1024" fill="none">
    <defs>
      <linearGradient id="bg" x1="80" y1="64" x2="944" y2="960" gradientUnits="userSpaceOnUse">
        <stop stop-color="${palette.bgA}" />
        <stop offset="1" stop-color="${palette.bgB}" />
      </linearGradient>
      <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(512 264) rotate(90) scale(440 500)">
        <stop stop-color="${palette.accent}" stop-opacity="0.42" />
        <stop offset="1" stop-color="${palette.accent}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="body" x1="304" y1="${torsoY}" x2="720" y2="${torsoY + 220}" gradientUnits="userSpaceOnUse">
        <stop stop-color="#111827" />
        <stop offset="1" stop-color="#1f2937" />
      </linearGradient>
      <filter id="softShadow" x="144" y="96" width="736" height="784" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#020617" flood-opacity="0.5" />
      </filter>
      <clipPath id="frameClip">
        <rect x="88" y="88" width="848" height="848" rx="40" />
      </clipPath>
    </defs>

    <g clip-path="url(#frameClip)">
      <rect width="1024" height="1024" fill="url(#bg)" />
      <rect width="1024" height="1024" fill="url(#glow)" />
      <path d="M0 876 C 244 744, 796 756, 1024 906 V 1024 H 0 Z" fill="#060b16" fill-opacity="0.9" />
      <circle cx="188" cy="178" r="2.5" fill="${palette.accent}" fill-opacity="0.42" />
      <circle cx="836" cy="212" r="2.5" fill="${palette.accent}" fill-opacity="0.42" />
      <circle cx="162" cy="298" r="1.8" fill="#ffffff" fill-opacity="0.22" />
      <circle cx="780" cy="148" r="1.8" fill="#ffffff" fill-opacity="0.18" />
      ${
        animated
          ? `<g>
              <circle cx="808" cy="260" r="120" fill="${palette.accent}" fill-opacity="0.08">
                <animate attributeName="r" values="120;142;120" dur="6s" repeatCount="indefinite" />
              </circle>
              <g>
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -12; 0 0" dur="4.5s" repeatCount="indefinite" />
            `
          : `<g>`
      }
          <g filter="url(#softShadow)">
            <ellipse cx="512" cy="${torsoY + 148}" rx="${shoulderWidth / 2}" ry="${portrait ? 188 : 204}" fill="url(#body)" />
            <ellipse cx="512" cy="438" rx="168" ry="202" fill="${skinHex}" />
            <rect x="468" y="592" width="88" height="96" rx="38" fill="${skinHex}" />
            <path d="M466 670 C 526 696, 612 696, 676 670" stroke="${palette.accent}" stroke-width="18" stroke-linecap="round" />
            <circle cx="442" cy="436" r="24" fill="#ffffff" fill-opacity="0.8" />
            <circle cx="582" cy="436" r="24" fill="#ffffff" fill-opacity="0.8" />
            <circle cx="442" cy="436" r="10" fill="#111827" />
            <circle cx="582" cy="436" r="10" fill="#111827" />
            <path d="M470 520 C 506 548, 546 548, 584 520" stroke="#111827" stroke-width="14" stroke-linecap="round" />
            <path d="M506 468 C 514 484, 514 496, 504 506" stroke="#8b5b4a" stroke-width="10" stroke-linecap="round" />
            ${hairShape(appearance)}
          </g>
      </g>

      <rect x="88" y="88" width="848" height="848" rx="40" stroke="#ffffff" stroke-opacity="0.08" />
      <text x="128" y="152" fill="#f8fafc" font-size="26" font-family="Inter, system-ui" font-weight="700">${escapeXml(title)}</text>
      <text x="128" y="190" fill="${palette.accent}" font-size="60" font-family="Inter, system-ui" font-weight="800">${escapeXml(name)}</text>
      <text x="128" y="868" fill="#dce3f2" font-size="22" font-family="Inter, system-ui">${escapeXml(frameLabel)} · ${escapeXml(skinLabel)} · ${escapeXml(hairLabel)}</text>
      <text x="128" y="904" fill="#94a3b8" font-size="18" font-family="Inter, system-ui">Generated by Railway renderer</text>
      ${badge(128, 220, 164, styleLabel, badgeFill)}
    </g>
  </svg>`;
}

function jsonResponse(res, status, payload) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function svgResponse(res, svg) {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300",
    "Content-Type": "image/svg+xml; charset=utf-8",
  });
  res.end(svg);
}

const server = http.createServer((req, res) => {
  const method = req.method || "GET";
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (url.pathname === "/health") {
    jsonResponse(res, 200, { ok: true, service: "anavrin-avatar-renderer" });
    return;
  }

  if (url.pathname === "/api/avatar/image.svg") {
    svgResponse(res, avatarSvg(readAppearance(url), { width: 1024, height: 1024 }));
    return;
  }

  if (url.pathname === "/api/avatar/portrait.svg") {
    svgResponse(res, avatarSvg(readAppearance(url), { width: 768, height: 768, portrait: true }));
    return;
  }

  if (url.pathname === "/api/avatar/motion.svg") {
    svgResponse(res, avatarSvg(readAppearance(url), { width: 1024, height: 1024, animated: true }));
    return;
  }

  if (url.pathname === "/api/avatar/model.json") {
    const appearance = readAppearance(url);
    const qs = url.searchParams.toString();
    const origin = `${url.protocol}//${url.host}`;

    jsonResponse(res, 200, {
      kind: "anavrin-avatar-render-model",
      version: 1,
      name: appearance.name,
      appearance: {
        frameType: appearance.frameType,
        skinTone: appearance.skinTone,
        hairType: appearance.hairType,
        hairColor: appearance.hairColor,
        styleType: appearance.styleType,
      },
      image: `${origin}/api/avatar/image.svg?${qs}`,
      portrait: `${origin}/api/avatar/portrait.svg?${qs}`,
      animation_url: `${origin}/api/avatar/motion.svg?${qs}`,
    });
    return;
  }

  jsonResponse(res, 404, {
    ok: false,
    message: "Route not found",
    availableRoutes: [
      "/health",
      "/api/avatar/image.svg",
      "/api/avatar/portrait.svg",
      "/api/avatar/motion.svg",
      "/api/avatar/model.json",
    ],
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`anavrin-avatar-renderer listening on http://0.0.0.0:${port}`);
});
