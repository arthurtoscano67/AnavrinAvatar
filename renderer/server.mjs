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
const facePresetLabels = [
  "Sunny Smile",
  "Calm Dreamer",
  "Hero Focus",
  "Wink Mischief",
  "Sleepy Chill",
];

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
  const facePreset = clamp(Number(url.searchParams.get("facePreset") || 0) || 0, 0, 4);
  const styleType = clamp(Number(url.searchParams.get("styleType") || 0) || 0, 0, 5);
  const palette = stylePalettes[styleType];

  return {
    name: name || "Anavrin Avatar",
    frameType,
    skinTone,
    hairType,
    hairColor,
    facePreset,
    styleType,
    frameLabel: frameLabels[frameType],
    skinLabel: toneLabels[skinTone],
    hairLabel: hairLabels[hairType],
    faceLabel: facePresetLabels[facePreset],
    styleLabel: palette.label,
    skinHex: skinTones[skinTone],
    hairHex: hairColors[hairColor],
    palette,
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

function solidStroke(d, color, width, opacity = 1) {
  return `
    <path
      d="${d}"
      fill="none"
      stroke="${color}"
      stroke-width="${width}"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-opacity="${opacity}"
    />
  `;
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
  const { palette, frameType } = appearance;

  if (frameType === 1) {
    return `
      ${outlinedPath("M350 1018 L350 772 C350 700 382 650 438 620 L478 600 L512 652 L546 600 L586 620 C642 650 674 700 674 772 L674 1018 Z", palette.hoodie)}
      ${simplePath("M354 1018 L354 794 C354 734 380 696 422 674 C462 704 562 704 602 674 C644 696 670 734 670 794 L670 1018 Z", palette.hoodieShadow)}
      ${outlinedPath("M410 630 C432 584 468 554 512 552 C556 554 592 584 614 630 L584 694 C560 672 536 662 512 662 C488 662 464 672 440 694 Z", palette.hoodie)}
      ${outlinedPath("M430 626 C452 648 470 672 482 716", palette.hoodieShadow, 10)}
      ${outlinedPath("M594 626 C572 648 554 672 542 716", palette.hoodieShadow, 10)}
      ${outlinedStroke("M492 694 L482 804", palette.hoodieAccent, 10)}
      ${outlinedStroke("M532 694 L542 816", palette.hoodieAccent, 10)}
      ${outlinedCircle(482, 808, 9, palette.hoodieAccent, 8)}
      ${outlinedCircle(542, 820, 9, palette.hoodieAccent, 8)}
      ${outlinedStroke("M512 654 L512 1016", palette.hoodieAccent, 10)}
    `;
  }

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
  const strands = [
    [384, 302, 374, 344, 382, 414, false, 20],
    [444, 294, 442, 338, 444, 402, false, 18],
    [510, 288, 512, 336, 512, 406, true, 18],
    [578, 294, 580, 338, 580, 402, false, 18],
    [638, 302, 648, 344, 640, 414, false, 20],
    ];

  return strands
    .map(([sx, sy, cx, cy, ex, ey, highlight, width], index) => {
      const d = `M ${sx} ${sy} C ${cx} ${cy}, ${cx + (index % 2 === 0 ? -10 : 10)} ${cy + 42}, ${ex} ${ey}`;
      const fill = highlight ? highlightHairColor(appearance) : hairHex;
      return outlinedStroke(d, fill, width);
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
    "M 372 326 C 388 306, 404 314, 416 340 C 424 360, 430 374, 432 394",
    "M 438 314 C 454 296, 470 304, 476 338 C 480 364, 476 388, 474 406",
    "M 546 314 C 530 296, 514 304, 508 338 C 504 364, 508 388, 510 406",
    "M 612 326 C 596 306, 580 314, 568 340 C 560 360, 554 374, 552 394",
  ];

  return fringe
    .map((d, index) => outlinedStroke(d, index === 1 ? highlight : hairHex, 20))
    .join("");
}

function hairMarkup(appearance) {
  const { hairType, hairHex, palette, frameType } = appearance;
  const highlight = highlightHairColor(appearance);

  if (hairType === 0) {
    return "";
  }

  if (hairType === 7) {
    return frameType === 1
      ? outlinedPath(
          "M 388 354 C 394 284, 454 236, 512 232 C 570 236, 630 284, 636 354 C 602 334, 560 322, 512 322 C 464 322, 422 334, 388 354 Z",
          hairHex,
          12
        )
      : outlinedPath(
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
    return `
      ${base}
      ${outlinedStroke("M 404 320 C 430 300, 446 308, 448 356", hairHex, 18)}
      ${outlinedStroke("M 620 320 C 594 300, 578 308, 576 356", highlight, 18)}
      ${outlinedStroke("M 352 388 C 304 476, 300 606, 360 734", hairHex, 24)}
      ${outlinedStroke("M 672 388 C 720 476, 724 606, 664 734", hairHex, 24)}
      ${braidEnds(appearance)}
    `;
  }

  if (hairType === 5) {
    return `
      ${base}
      ${sideTufts}
      ${locStrands(appearance)}
      ${outlinedStroke("M 330 402 C 300 470, 302 558, 340 636", hairHex, 24)}
      ${outlinedStroke("M 694 402 C 724 470, 722 558, 684 636", hairHex, 24)}
    `;
  }

  if (hairType === 6) {
    return `
      ${base}
      ${sideTufts}
      ${outlinedStroke("M 648 248 C 734 306, 742 430, 676 544", hairHex, 24)}
      ${outlinedStroke("M 410 324 C 434 300, 450 310, 448 356", hairHex, 18)}
      ${outlinedStroke("M 614 324 C 590 300, 574 310, 576 356", highlight, 18)}
      ${outlinedStroke("M 338 404 C 308 454, 310 534, 350 592", hairHex, 20)}
      ${outlinedStroke("M 686 404 C 716 454, 714 534, 674 592", hairHex, 20)}
    `;
  }

  if (hairType === 2) {
    return `
      ${base}
      ${sideTufts}
      ${outlinedStroke("M 406 322 C 432 300, 448 308, 450 360", hairHex, 18)}
      ${outlinedStroke("M 618 322 C 592 300, 576 308, 574 360", highlight, 18)}
      ${outlinedStroke("M 344 404 C 310 520, 326 648, 396 760", hairHex, 28)}
      ${outlinedStroke("M 680 404 C 714 520, 698 648, 628 760", hairHex, 28)}
      ${outlinedStroke("M 378 398 C 356 500, 370 612, 422 714", hairHex, 20)}
      ${outlinedStroke("M 646 398 C 668 500, 654 612, 602 714", hairHex, 20)}
    `;
  }

  if (hairType === 8) {
    return `${base}${wavyFringe(appearance)}${simplePath("M 370 290 C 422 248, 590 248, 654 298", palette.hairAccent, 0.18)}`;
  }

  if (hairType === 1) {
    return `
      ${base}
      ${outlinedStroke(bangPath(398, 320, 406, 340, 402, 392), hairHex, 20)}
      ${outlinedStroke(bangPath(458, 312, 464, 336, 462, 386), highlight, 18)}
      ${outlinedStroke(bangPath(566, 312, 560, 336, 562, 386), hairHex, 18)}
      ${outlinedStroke(bangPath(626, 320, 618, 340, 622, 392), hairHex, 20)}
    `;
  }

  return `${base}${sideTufts}`;
}

function animeOpenEye(cx, cy, rx = 64, ry = 74) {
  return `
    ${outlinedEllipse(cx, cy, rx, ry, "#ffffff", 12)}
    <ellipse cx="${cx}" cy="${cy + 14}" rx="${Math.max(18, rx - 42)}" ry="${Math.max(20, ry - 48)}" fill="#111111" />
    <ellipse cx="${cx + 10}" cy="${cy - 2}" rx="7" ry="9" fill="#ffffff" />
  `;
}

function animeAlmondEye(cx, cy, width = 142, height = 84) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const d = `
    M ${cx - halfWidth} ${cy}
    C ${cx - halfWidth * 0.42} ${cy - halfHeight}, ${cx + halfWidth * 0.42} ${cy - halfHeight}, ${cx + halfWidth} ${cy}
    C ${cx + halfWidth * 0.42} ${cy + halfHeight}, ${cx - halfWidth * 0.42} ${cy + halfHeight}, ${cx - halfWidth} ${cy}
    Z
  `;

  return `
    ${outlinedPath(d, "#ffffff", 10)}
    <ellipse cx="${cx}" cy="${cy + 12}" rx="18" ry="22" fill="#111111" />
    <ellipse cx="${cx + 10}" cy="${cy - 3}" rx="7" ry="8" fill="#ffffff" />
  `;
}

function animeSmileEye(cx, cy, width = 92, rise = 24) {
  return solidStroke(
    `M ${cx - width / 2} ${cy} C ${cx - width / 5} ${cy - rise}, ${cx + width / 5} ${cy - rise}, ${cx + width / 2} ${cy}`,
    OUTLINE,
    10
  );
}

function animeSleepyEye(cx, cy) {
  return `
    ${outlinedEllipse(cx, cy, 58, 44, "#ffffff", 10)}
    <ellipse cx="${cx}" cy="${cy + 10}" rx="18" ry="18" fill="#111111" />
    ${solidStroke(`M ${cx - 58} ${cy - 8} C ${cx - 24} ${cy - 20}, ${cx + 24} ${cy - 20}, ${cx + 58} ${cy - 8}`, OUTLINE, 10)}
  `;
}

function animeBlush(frameType, x, y, opacity = 0.18) {
  const blush = frameType === 1 ? "#f7adb9" : "#c48364";
  return `<ellipse cx="${x}" cy="${y}" rx="24" ry="14" fill="${blush}" fill-opacity="${opacity}" />`;
}

function headMarkup(appearance, headY) {
  const { frameType, skinHex } = appearance;

  if (frameType === 1) {
    return outlinedPath(
      `M 512 ${headY - 176}
       C 428 ${headY - 176}, 360 ${headY - 106}, 358 ${headY}
       C 356 ${headY + 112}, 424 ${headY + 198}, 512 ${headY + 224}
       C 600 ${headY + 198}, 668 ${headY + 112}, 666 ${headY}
       C 664 ${headY - 106}, 596 ${headY - 176}, 512 ${headY - 176} Z`,
      skinHex
    );
  }

  return outlinedPath(
    `M 512 ${headY - 180}
     C 414 ${headY - 180}, 338 ${headY - 100}, 342 ${headY + 8}
     C 346 ${headY + 108}, 394 ${headY + 190}, 454 ${headY + 220}
     C 492 ${headY + 242}, 532 ${headY + 242}, 570 ${headY + 220}
     C 630 ${headY + 190}, 678 ${headY + 108}, 682 ${headY + 8}
     C 686 ${headY - 100}, 610 ${headY - 180}, 512 ${headY - 180} Z`,
    skinHex
  );
}

function faceMarkup(appearance) {
  const { facePreset, frameType, skinHex } = appearance;
  const leftEyeX = frameType === 1 ? 444 : 438;
  const rightEyeX = frameType === 1 ? 580 : 586;
  const earLeftX = frameType === 1 ? 352 : 346;
  const earRightX = frameType === 1 ? 672 : 678;
  const browLeft = frameType === 1 ? [394, 478] : [382, 494];
  const browRight = frameType === 1 ? [546, 630] : [530, 642];
  const eyeYOffset = frameType === 1 ? -4 : 2;

  let eyes = "";
  let brows = "";
  let mouth = "";
  let cheeks = "";

  if (facePreset === 0) {
    eyes = `${animeSmileEye(leftEyeX, 454 + eyeYOffset)}${animeSmileEye(rightEyeX, 454 + eyeYOffset)}`;
    brows = `
      ${solidStroke(`M ${browLeft[0]} 402 C 420 382, 452 380, ${browLeft[1]} 392`, OUTLINE, frameType === 1 ? 8 : 9)}
      ${solidStroke(`M ${browRight[0]} 392 C 572 380, 604 382, ${browRight[1]} 402`, OUTLINE, frameType === 1 ? 8 : 9)}
    `;
    mouth = solidStroke("M 464 578 C 496 604, 538 604, 568 578", OUTLINE, 8);
    cheeks = `${animeBlush(frameType, 390, 534, frameType === 1 ? 0.28 : 0.18)}${animeBlush(frameType, 634, 534, frameType === 1 ? 0.28 : 0.18)}`;
  } else if (facePreset === 1) {
    eyes = `${animeOpenEye(leftEyeX, 458 + eyeYOffset, frameType === 1 ? 68 : 60, frameType === 1 ? 78 : 68)}${animeOpenEye(rightEyeX, 458 + eyeYOffset, frameType === 1 ? 68 : 60, frameType === 1 ? 78 : 68)}`;
    brows = `
      ${solidStroke(`M ${browLeft[0]} 394 C 424 378, 456 378, ${browLeft[1]} 390`, OUTLINE, frameType === 1 ? 7 : 8)}
      ${solidStroke(`M ${browRight[0]} 390 C 568 378, 600 378, ${browRight[1]} 394`, OUTLINE, frameType === 1 ? 7 : 8)}
    `;
    mouth = solidStroke("M 474 582 C 502 596, 540 596, 566 578", OUTLINE, 7);
    cheeks = `${animeBlush(frameType, 392, 538, frameType === 1 ? 0.2 : 0.1)}${animeBlush(frameType, 632, 538, frameType === 1 ? 0.2 : 0.1)}`;
  } else if (facePreset === 2) {
    eyes = `${animeAlmondEye(leftEyeX, 454 + eyeYOffset, frameType === 1 ? 146 : 134, frameType === 1 ? 88 : 78)}${animeAlmondEye(rightEyeX, 454 + eyeYOffset, frameType === 1 ? 146 : 134, frameType === 1 ? 88 : 78)}`;
    brows = `
      ${solidStroke(`M ${frameType === 1 ? 390 : 382} 402 C 420 372, 462 368, ${frameType === 1 ? 494 : 500} 380`, OUTLINE, frameType === 1 ? 8 : 10)}
      ${solidStroke(`M ${frameType === 1 ? 530 : 524} 380 C 562 368, 604 372, ${frameType === 1 ? 634 : 642} 402`, OUTLINE, frameType === 1 ? 8 : 10)}
    `;
    mouth = solidStroke("M 474 584 C 504 594, 544 590, 576 576", OUTLINE, 8);
  } else if (facePreset === 3) {
    eyes = `${animeSmileEye(leftEyeX - 2, 456 + eyeYOffset, 84, 20)}${animeOpenEye(rightEyeX + 2, 458 + eyeYOffset, frameType === 1 ? 66 : 58, frameType === 1 ? 76 : 66)}`;
    brows = `
      ${solidStroke(`M ${frameType === 1 ? 396 : 388} 398 C 422 384, 452 386, ${frameType === 1 ? 486 : 484} 396`, OUTLINE, 8)}
      ${solidStroke(`M ${frameType === 1 ? 548 : 540} 388 C 572 374, 602 374, ${frameType === 1 ? 628 : 632} 384`, OUTLINE, frameType === 1 ? 8 : 9)}
    `;
    mouth = solidStroke("M 468 580 C 500 602, 542 598, 572 572", OUTLINE, 8);
    cheeks = `${animeBlush(frameType, 392, 538, frameType === 1 ? 0.22 : 0.14)}${animeBlush(frameType, 636, 538, frameType === 1 ? 0.22 : 0.14)}`;
  } else {
    eyes = `${animeSleepyEye(leftEyeX, 462 + eyeYOffset)}${animeSleepyEye(rightEyeX, 462 + eyeYOffset)}`;
    brows = `
      ${solidStroke(`M ${frameType === 1 ? 398 : 392} 396 C 426 388, 454 388, ${frameType === 1 ? 486 : 488} 394`, OUTLINE, 7)}
      ${solidStroke(`M ${frameType === 1 ? 538 : 536} 394 C 570 388, 598 388, ${frameType === 1 ? 626 : 632} 396`, OUTLINE, 7)}
    `;
    mouth = solidStroke("M 486 586 C 508 592, 532 592, 552 586", OUTLINE, 6);
    cheeks = `${animeBlush(frameType, 394, 540, frameType === 1 ? 0.16 : 0.08)}${animeBlush(frameType, 630, 540, frameType === 1 ? 0.16 : 0.08)}`;
  }

  return `
    ${outlinedCircle(earLeftX, 472, frameType === 1 ? 22 : 24, skinHex, 10)}
    ${outlinedCircle(earRightX, 472, frameType === 1 ? 22 : 24, skinHex, 10)}
    ${brows}
    ${eyes}
    ${outlinedEllipse(514, frameType === 1 ? 538 : 544, frameType === 1 ? 6 : 7, frameType === 1 ? 4 : 5, "#8f624d", 4)}
    ${mouth}
    ${cheeks}
  `;
}

function avatarSvg(appearance, { animated = false, portrait = false, debug = false }) {
  const { name, frameLabel, skinLabel, hairLabel, faceLabel, styleLabel, palette, skinHex, frameType } = appearance;
  const headY = portrait ? 420 : 432;
  const bodyTranslateY = portrait ? 24 : 40;
  const badgeY = portrait ? 98 : 112;
  const neckX = frameType === 1 ? 486 : 474;
  const neckWidth = frameType === 1 ? 52 : 76;
  const neckHeight = frameType === 1 ? 78 : 84;
  const neckRadius = frameType === 1 ? 20 : 24;

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
            ${outlinedRect(neckX, 586, neckWidth, neckHeight, neckRadius, skinHex, 10)}
            ${headMarkup(appearance, headY)}
            ${faceMarkup(appearance)}
            ${hairMarkup(appearance)}
          </g>
      </g>

      <rect x="84" y="84" width="856" height="856" rx="44" stroke="#ffffff" stroke-opacity="0.08" />
      ${
        debug
          ? `
            ${badge(96, badgeY, frameLabel, "#ffffff")}
            ${badge(96, badgeY + 52, faceLabel, palette.hairAccent)}
            ${badge(96, badgeY + 104, styleLabel, palette.bubble)}
            <text x="96" y="892" fill="#f8fafc" font-size="${portrait ? 42 : 48}" font-family="Inter, system-ui" font-weight="800">${escapeXml(name)}</text>
            <text x="96" y="926" fill="#dbe5f3" font-size="18" font-family="Inter, system-ui">${escapeXml(skinLabel)} · ${escapeXml(hairLabel)} · ${escapeXml(faceLabel)}</text>
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
        facePreset: appearance.facePreset,
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
