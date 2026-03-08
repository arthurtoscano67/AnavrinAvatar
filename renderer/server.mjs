import http from "node:http";

const port = Number(process.env.PORT || 8788);
const OUTLINE = "#090812";

const skinTones = ["#f6d6c2", "#e8b899", "#c88c6c", "#915b42", "#5f392d"];
const hairColors = [
  "#151515",
  "#3a241c",
  "#694536",
  "#8b6148",
  "#e6c26b",
  "#c55d46",
  "#8f939f",
  "#d7dae2",
  "#4884ff",
  "#ff77be",
];

const stylePalettes = [
  {
    label: "Street",
    bg: "#7f86f4",
    bgSoft: "#6071d8",
    bubble: "#afbbff",
    hoodie: "#8c9098",
    hoodieShadow: "#6c7079",
    hoodieAccent: "#232530",
    stage: "#21234d",
    hairAccent: "#5ad3ff",
  },
  {
    label: "Tactical",
    bg: "#7cb5a6",
    bgSoft: "#4b7f76",
    bubble: "#b6ead4",
    hoodie: "#566458",
    hoodieShadow: "#404b42",
    hoodieAccent: "#101714",
    stage: "#152922",
    hairAccent: "#9decc8",
  },
  {
    label: "Luxury",
    bg: "#8f82b9",
    bgSoft: "#665182",
    bubble: "#d9c8ff",
    hoodie: "#2e2536",
    hoodieShadow: "#1c1422",
    hoodieAccent: "#f3c969",
    stage: "#23172f",
    hairAccent: "#f7d98c",
  },
  {
    label: "Sporty",
    bg: "#6a8df7",
    bgSoft: "#4366d2",
    bubble: "#b8d5ff",
    hoodie: "#c9ced7",
    hoodieShadow: "#9ca5b2",
    hoodieAccent: "#ef5d5d",
    stage: "#203475",
    hairAccent: "#ff9a72",
  },
  {
    label: "Futuristic",
    bg: "#8b7dff",
    bgSoft: "#5d4dca",
    bubble: "#d1c8ff",
    hoodie: "#22253a",
    hoodieShadow: "#171a2b",
    hoodieAccent: "#88f4ff",
    stage: "#1a1640",
    hairAccent: "#b6f8ff",
  },
  {
    label: "Casual",
    bg: "#8a87f5",
    bgSoft: "#6770dc",
    bubble: "#c2c8ff",
    hoodie: "#b7b8bf",
    hoodieShadow: "#8f9198",
    hoodieAccent: "#424b63",
    stage: "#2a2f62",
    hairAccent: "#f3dcc0",
  },
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
  const palette = stylePalettes[styleType];

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
    styleLabel: palette.label,
    skinHex: skinTones[skinTone],
    hairHex: hairColors[hairColor],
    palette,
    eyeTilt: frameType === 0 ? 0 : 4,
    mouthTilt: frameType === 0 ? 10 : -10,
  };
}

function highlightHairColor(appearance) {
  const { hairColor, palette } = appearance;

  if (hairColor === 0) return "#e8c97e";
  if (hairColor === 1) return "#d7b17c";
  if (hairColor === 2) return "#d9b48c";
  if (hairColor === 3) return "#e6c4a2";
  if (hairColor === 4) return "#fff1b9";
  if (hairColor === 5) return "#ffb79f";
  if (hairColor === 6) return "#dfe5ef";
  if (hairColor === 7) return "#ffffff";
  if (hairColor === 8) return "#96d8ff";
  if (hairColor === 9) return "#ffd0ef";

  return palette.hairAccent;
}

function outlinedPath(d, fill, strokeWidth = 12) {
  return `<path d="${d}" fill="${fill}" stroke="${OUTLINE}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" />`;
}

function outlinedCircle(cx, cy, r, fill, strokeWidth = 12) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${OUTLINE}" stroke-width="${strokeWidth}" />`;
}

function outlinedEllipse(cx, cy, rx, ry, fill, strokeWidth = 12) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${OUTLINE}" stroke-width="${strokeWidth}" />`;
}

function outlinedRect(x, y, width, height, rx, fill, strokeWidth = 12) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" stroke="${OUTLINE}" stroke-width="${strokeWidth}" />`;
}

function outlinedStroke(d, color, width) {
  return `
    <path d="${d}" fill="none" stroke="${OUTLINE}" stroke-width="${width + 12}" stroke-linecap="round" stroke-linejoin="round" />
    <path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" />
  `;
}

function simplePath(d, fill, opacity = 1) {
  return `<path d="${d}" fill="${fill}" fill-opacity="${opacity}" />`;
}

function badge(x, y, text, fill) {
  const width = Math.max(112, text.length * 11 + 32);
  return `
    <g transform="translate(${x} ${y})">
      <rect width="${width}" height="38" rx="19" fill="${fill}" fill-opacity="0.16" stroke="${fill}" stroke-opacity="0.4" />
      <text x="${width / 2}" y="25" text-anchor="middle" fill="#f7f8fb" font-size="15" font-family="Inter, system-ui" font-weight="700">${escapeXml(text)}</text>
    </g>
  `;
}

function hoodieMarkup(appearance) {
  const { palette } = appearance;

  return `
    ${outlinedPath("M322 1018 L322 760 C322 690 358 642 422 614 L470 594 L512 650 L554 594 L602 614 C666 642 702 690 702 760 L702 1018 Z", palette.hoodie)}
    ${simplePath("M326 1018 L326 784 C326 722 354 684 402 660 C454 700 572 700 624 660 C670 686 698 724 698 784 L698 1018 Z", palette.hoodieShadow)}
    ${outlinedPath("M390 632 C414 574 458 546 512 544 C566 546 610 574 634 632 L600 700 C574 674 546 660 512 660 C478 660 450 674 424 700 Z", palette.hoodie)}
    ${outlinedPath("M420 622 C450 646 474 672 492 722", palette.hoodieShadow, 10)}
    ${outlinedPath("M604 622 C574 646 550 672 532 722", palette.hoodieShadow, 10)}
    ${outlinedStroke("M494 694 L478 808", palette.hoodieAccent, 10)}
    ${outlinedStroke("M530 694 L546 824", palette.hoodieAccent, 10)}
    ${outlinedCircle(478, 812, 10, palette.hoodieAccent, 8)}
    ${outlinedCircle(546, 828, 10, palette.hoodieAccent, 8)}
    ${outlinedStroke("M512 650 L512 1016", palette.hoodieAccent, 12)}
  `;
}

function bangPath(startX, startY, controlX, controlY, endX, endY) {
  return `M ${startX} ${startY} C ${controlX} ${controlY}, ${controlX} ${controlY + 40}, ${endX} ${endY}`;
}

function locStrands(appearance) {
  const { hairHex } = appearance;
  const highlight = highlightHairColor(appearance);
  const strands = [
    [362, 300, 334, 382, 354, 494, false],
    [406, 292, 394, 378, 412, 510, false],
    [452, 286, 452, 368, 452, 522, false],
    [508, 282, 510, 370, 516, 534, true],
    [564, 286, 558, 370, 562, 522, false],
    [616, 294, 606, 380, 612, 506, false],
    [660, 304, 676, 390, 652, 492, false],
  ];

  return strands
    .map(([sx, sy, cx, cy, ex, ey, highlight], index) => {
      const d = `M ${sx} ${sy} C ${cx} ${cy}, ${cx + (index % 2 === 0 ? -18 : 18)} ${cy + 90}, ${ex} ${ey}`;
      const fill = highlight ? highlightHairColor(appearance) : hairHex;
      return outlinedStroke(d, fill, 24);
    })
    .join("");
}

function braidEnds(appearance) {
  const { hairHex } = appearance;
  const highlight = highlightHairColor(appearance);

  return `
    ${outlinedStroke("M 352 382 C 302 456, 296 560, 344 620", hairHex, 28)}
    ${outlinedStroke("M 672 382 C 722 456, 728 560, 680 620", hairHex, 28)}
    ${outlinedStroke("M 344 618 C 332 658, 336 690, 358 718", highlight, 18)}
    ${outlinedStroke("M 680 618 C 692 658, 688 690, 666 718", highlight, 18)}
  `;
}

function curlyClusters(appearance) {
  const { hairHex, palette } = appearance;
  const bubbles = [
    [330, 336, 48],
    [384, 286, 58],
    [458, 256, 66],
    [538, 256, 62],
    [612, 286, 56],
    [676, 334, 48],
  ];

  return bubbles
    .map(([cx, cy, r], index) =>
      outlinedCircle(cx, cy, r, index === 2 ? palette.hairAccent : hairHex, 12)
    )
    .join("");
}

function wavyFringe(appearance) {
  const { hairHex } = appearance;
  const highlight = highlightHairColor(appearance);
  const fringe = [
    "M 354 324 C 372 302, 388 314, 402 342 C 414 368, 424 386, 430 424",
    "M 418 306 C 446 286, 456 302, 458 344 C 460 382, 456 420, 460 462",
    "M 492 298 C 512 284, 526 294, 532 340 C 536 378, 532 418, 540 468",
    "M 566 308 C 590 292, 602 304, 604 348 C 606 388, 598 430, 600 462",
    "M 634 326 C 658 310, 672 326, 676 362 C 680 402, 674 438, 676 464",
  ];

  return fringe
    .map((d, index) => outlinedStroke(d, index === 2 ? highlight : hairHex, 24))
    .join("");
}

function hairMarkup(appearance) {
  const { hairType, hairHex } = appearance;
  const highlight = highlightHairColor(appearance);

  if (hairType === 0) {
    return "";
  }

  if (hairType === 7) {
    return outlinedPath(
      "M 370 356 C 376 272, 452 218, 512 214 C 572 218, 648 272, 654 356 C 614 330, 566 316, 512 316 C 458 316, 410 330, 370 356 Z",
      hairHex,
      12
    );
  }

  const base = outlinedPath(
    "M 320 382 C 318 256, 432 178, 512 178 C 592 178, 706 256, 704 382 C 658 338, 592 312, 512 312 C 432 312, 366 338, 320 382 Z",
    hairHex,
    12
  );

  const sideTufts = `
    ${outlinedPath("M 320 382 C 282 396, 260 426, 268 460 C 274 492, 302 514, 334 512 L 336 454 C 314 448, 306 430, 320 382 Z", hairHex, 10)}
    ${outlinedPath("M 704 382 C 742 396, 764 426, 756 460 C 750 492, 722 514, 690 512 L 688 454 C 710 448, 718 430, 704 382 Z", hairHex, 10)}
  `;

  if (hairType === 3) {
    return `${curlyClusters(appearance)}${base}`;
  }

  if (hairType === 4) {
    return `${base}${sideTufts}${locStrands(appearance)}${braidEnds(appearance)}`;
  }

  if (hairType === 5) {
    return `${base}${sideTufts}${locStrands(appearance)}${outlinedStroke("M 318 406 C 292 454, 298 536, 334 592", hairHex, 28)}${outlinedStroke("M 706 406 C 732 454, 726 536, 690 592", hairHex, 28)}`;
  }

  if (hairType === 6) {
    return `
      ${base}
      ${sideTufts}
      ${outlinedStroke("M 650 254 C 734 308, 748 430, 680 526", hairHex, 26)}
      ${outlinedStroke(bangPath(390, 314, 404, 346, 396, 420), hairHex, 24)}
      ${outlinedStroke(bangPath(456, 300, 458, 342, 458, 446), highlight, 22)}
      ${outlinedStroke(bangPath(520, 298, 522, 342, 520, 472), hairHex, 24)}
      ${outlinedStroke(bangPath(586, 308, 592, 348, 590, 450), hairHex, 24)}
    `;
  }

  if (hairType === 2) {
    return `
      ${outlinedPath("M 316 380 C 314 246, 430 164, 512 164 C 594 164, 710 246, 708 380 C 706 468, 690 536, 656 610 C 618 566, 564 544, 512 544 C 460 544, 406 566, 368 610 C 334 536, 318 468, 316 380 Z", hairHex, 12)}
      ${wavyFringe(appearance)}
    `;
  }

  if (hairType === 8) {
    return `${base}${wavyFringe(appearance)}${simplePath("M 370 290 C 422 248, 590 248, 654 298", palette.hairAccent, 0.18)}`;
  }

  if (hairType === 1) {
    return `
      ${base}
      ${outlinedStroke(bangPath(384, 316, 396, 342, 388, 402), hairHex, 24)}
      ${outlinedStroke(bangPath(450, 304, 460, 338, 452, 424), highlight, 22)}
      ${outlinedStroke(bangPath(520, 302, 520, 338, 516, 444), hairHex, 24)}
      ${outlinedStroke(bangPath(592, 308, 596, 346, 588, 432), hairHex, 24)}
    `;
  }

  return `${base}${sideTufts}`;
}

function faceMarkup(appearance) {
  const { eyeTilt, mouthTilt, frameType, skinHex } = appearance;
  const blush = frameType === 1 ? "#f8b8b8" : "#c18363";

  return `
    ${outlinedCircle(348, 472, 24, skinHex, 10)}
    ${outlinedCircle(676, 472, 24, skinHex, 10)}
    ${outlinedEllipse(442, 456, 74, 88, "#ffffff", 12)}
    ${outlinedEllipse(582, 456, 74, 88, "#ffffff", 12)}
    <ellipse cx="448" cy="${468 + eyeTilt}" rx="20" ry="24" fill="#111111" />
    <ellipse cx="588" cy="${468 + eyeTilt}" rx="20" ry="24" fill="#111111" />
    <ellipse cx="452" cy="${458 + eyeTilt}" rx="6" ry="8" fill="#ffffff" />
    <ellipse cx="592" cy="${458 + eyeTilt}" rx="6" ry="8" fill="#ffffff" />
    ${outlinedStroke("M 388 390 C 422 366, 458 366, 488 382", OUTLINE, 8)}
    ${outlinedStroke("M 536 382 C 566 366, 602 366, 636 390", OUTLINE, 8)}
    ${outlinedEllipse(514, 534, 18, 12, "#6a4537", 8)}
    ${outlinedStroke(`M 472 590 C 500 ${612 + mouthTilt}, 548 ${612 + mouthTilt}, 576 586`, "#1a1214", 10)}
    ${outlinedStroke("M 504 546 C 512 562, 514 576, 506 588", "#8d6148", 8)}
    <ellipse cx="386" cy="532" rx="22" ry="14" fill="${blush}" fill-opacity="0.18" />
    <ellipse cx="640" cy="532" rx="22" ry="14" fill="${blush}" fill-opacity="0.18" />
  `;
}

function avatarSvg(appearance, { animated = false, portrait = false, debug = false }) {
  const { name, frameLabel, skinLabel, hairLabel, styleLabel, palette, skinHex } = appearance;
  const headY = portrait ? 420 : 432;
  const bodyTranslateY = portrait ? 24 : 40;
  const badgeY = portrait ? 98 : 112;

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none">
    <defs>
      <linearGradient id="bg" x1="144" y1="120" x2="920" y2="1008" gradientUnits="userSpaceOnUse">
        <stop stop-color="${palette.bg}" />
        <stop offset="1" stop-color="${palette.bgSoft}" />
      </linearGradient>
      <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(210 184) rotate(90) scale(240 280)">
        <stop stop-color="#ffffff" stop-opacity="0.24" />
        <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="rim" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(512 540) rotate(90) scale(360 420)">
        <stop stop-color="${palette.hairAccent}" stop-opacity="0.1" />
        <stop offset="1" stop-color="${palette.hairAccent}" stop-opacity="0" />
      </radialGradient>
      <filter id="softShadow" x="212" y="168" width="610" height="764" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#17111e" flood-opacity="0.28" />
      </filter>
      <clipPath id="frameClip">
        <rect x="84" y="84" width="856" height="856" rx="44" />
      </clipPath>
    </defs>

    <g clip-path="url(#frameClip)">
      <rect width="1024" height="1024" fill="url(#bg)" />
      <rect width="1024" height="1024" fill="url(#glow)" />
      <rect width="1024" height="1024" fill="url(#rim)" />
      <circle cx="806" cy="176" r="108" fill="${palette.bubble}" fill-opacity="0.12" />
      <circle cx="184" cy="188" r="26" fill="#ffffff" fill-opacity="0.12" />
      <circle cx="862" cy="302" r="12" fill="#ffffff" fill-opacity="0.16" />
      <circle cx="160" cy="334" r="10" fill="#ffffff" fill-opacity="0.16" />
      <path d="M0 862 C 224 762, 782 768, 1024 894 V 1024 H 0 Z" fill="${palette.stage}" />
      ${
        animated
          ? `<g>
              <circle cx="210" cy="250" r="22" fill="#ffffff" fill-opacity="0.14">
                <animate attributeName="cy" values="250;220;250" dur="5.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="828" cy="228" r="16" fill="${palette.hairAccent}" fill-opacity="0.22">
                <animate attributeName="cy" values="228;202;228" dur="4.6s" repeatCount="indefinite" />
              </circle>
              <g>
                <animateTransform attributeName="transform" type="translate" values="0 0; 0 -16; 0 0" dur="4.8s" repeatCount="indefinite" />
            `
          : "<g>"
      }
          <g transform="translate(0 ${bodyTranslateY})" filter="url(#softShadow)">
            <ellipse cx="512" cy="902" rx="${portrait ? 150 : 196}" ry="46" fill="#09111f" fill-opacity="0.24" />
            ${hoodieMarkup(appearance)}
            ${outlinedRect(476, 586, 72, 82, 24, skinHex, 10)}
            ${outlinedCircle(512, headY, 176, skinHex)}
            ${faceMarkup(appearance)}
            ${hairMarkup(appearance)}
          </g>
      </g>

      <rect x="84" y="84" width="856" height="856" rx="44" stroke="#ffffff" stroke-opacity="0.08" />
      ${
        debug
          ? `
            ${badge(96, badgeY, frameLabel, "#ffffff")}
            ${badge(96, badgeY + 52, styleLabel, palette.hairAccent)}
            <text x="96" y="892" fill="#f8fafc" font-size="${portrait ? 42 : 48}" font-family="Inter, system-ui" font-weight="800">${escapeXml(name)}</text>
            <text x="96" y="926" fill="#dbe5f3" font-size="18" font-family="Inter, system-ui">${escapeXml(skinLabel)} · ${escapeXml(hairLabel)}</text>
            <text x="96" y="952" fill="#ffffff" fill-opacity="0.52" font-size="15" font-family="Inter, system-ui">Generated by Railway renderer</text>
          `
          : `
            <text x="864" y="942" text-anchor="end" fill="#ffffff" fill-opacity="0.32" font-size="14" font-family="Inter, system-ui">anavrin</text>
          `
      }
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
    svgResponse(res, avatarSvg(readAppearance(url), {
      animated: false,
      portrait: false,
      debug: url.searchParams.get("debug") === "1",
    }));
    return;
  }

  if (url.pathname === "/api/avatar/portrait.svg") {
    svgResponse(res, avatarSvg(readAppearance(url), {
      animated: false,
      portrait: true,
      debug: url.searchParams.get("debug") === "1",
    }));
    return;
  }

  if (url.pathname === "/api/avatar/motion.svg") {
    svgResponse(res, avatarSvg(readAppearance(url), {
      animated: true,
      portrait: false,
      debug: url.searchParams.get("debug") === "1",
    }));
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
