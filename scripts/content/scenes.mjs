// Authored SVG scenes for the example stories (flat "woodcut" style, viewBox 320×272).
// Each scene uses its own small palette; they are illustrations, not UI colors.

const frame = (body, sky) =>
  `<svg viewBox="0 0 320 272" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${sky}${body}</svg>`;

const gradient = (id, top, bottom) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="320" height="272" fill="url(#${id})"/>`;

export const scenes = {
  // Old peasant in a wheat field, 1350 France: cottage, sunset, birds.
  plague: frame(
    `<circle cx="236" cy="96" r="34" fill="#f8e3b0"/>
    <path d="M0 176 C60 150 120 162 180 156 C240 150 290 140 320 146 V272 H0Z" fill="#c9893b"/>
    <path d="M0 206 C70 186 150 200 220 190 C270 184 300 186 320 182 V272 H0Z" fill="#8e5a23"/>
    <g fill="#e7b54a">${Array.from({ length: 22 }, (_, i) => `<path d="M${8 + i * 14} 272 L${12 + i * 14} ${222 - (i % 4) * 6} L${16 + i * 14} 272Z"/>`).join('')}</g>
    <path d="M52 168 L52 128 L82 106 L112 128 L112 168Z" fill="#5a3a22"/>
    <path d="M46 132 L82 98 L118 132 L110 132 L82 108 L54 132Z" fill="#3a2516"/>
    <rect x="74" y="142" width="14" height="26" fill="#f2c770"/>
    <g fill="#2a2233"><circle cx="150" cy="168" r="7"/><path d="M141 214 L146 178 Q150 172 154 178 L159 214Z"/><path d="M158 186 L178 160" stroke="#2a2233" stroke-width="3"/></g>
    <g fill="none" stroke="#3a2516" stroke-width="2" stroke-linecap="round"><path d="M170 70 q6 -6 12 0 q6 -6 12 0"/><path d="M200 52 q5 -5 10 0 q5 -5 10 0"/></g>`,
    gradient('sky-plague', '#f3c98b', '#f7e7c4'),
  ),
  // Pompeii, 79: Vesuvius smoking, a boat escaping with bread.
  pompeii: frame(
    `<path d="M40 190 L130 70 L150 78 L168 66 L260 190Z" fill="#6b3f35"/>
    <path d="M118 86 L130 70 L150 78 L168 66 L180 82 L160 92 L140 86Z" fill="#e2683c"/>
    <g fill="#8d8597" opacity="0.9"><circle cx="150" cy="44" r="22"/><circle cx="176" cy="30" r="18"/><circle cx="128" cy="30" r="16"/><circle cx="160" cy="14" r="14"/></g>
    <rect y="186" width="320" height="86" fill="#2f6f8f"/>
    <g fill="#9ed0dc" opacity="0.7"><rect x="20" y="210" width="40" height="3" rx="1.5"/><rect x="220" y="232" width="56" height="3" rx="1.5"/><rect x="110" y="250" width="34" height="3" rx="1.5"/></g>
    <path d="M150 226 L250 226 L234 246 L166 246Z" fill="#7a4a2a"/>
    <path d="M200 226 L200 168 L232 214 L200 214" fill="#f6efe2"/>
    <g fill="#2a2233"><circle cx="180" cy="208" r="6"/><path d="M172 226 L176 214 Q180 210 184 214 L188 226Z"/></g>
    <g fill="#e7b54a"><circle cx="216" cy="222" r="5"/><circle cx="226" cy="222" r="5"/><circle cx="221" cy="216" r="5"/></g>`,
    gradient('sky-pompeii', '#f2a35c', '#f7d9a6'),
  ),
  // Paris, 1889: the Eiffel Tower and a hatmaker waving.
  paris: frame(
    `<path d="M0 214 H320 V272 H0Z" fill="#3d4f7a"/>
    <g fill="#1f2a4a"><path d="M160 30 L166 30 L196 214 L182 214 L163 96 L144 214 L130 214Z"/><path d="M140 140 L186 140 L188 150 L138 150Z"/><path d="M128 190 L198 190 L200 200 L126 200Z"/><path d="M146 96 L180 96 L181 104 L145 104Z"/></g>
    <path d="M144 214 Q163 176 182 214" fill="#f6d2c4"/>
    <g fill="#f6efe2"><rect x="20" y="170" width="34" height="44"/><rect x="250" y="160" width="46" height="54"/><rect x="60" y="184" width="26" height="30"/></g>
    <g fill="#c96b5a"><path d="M16 170 L37 154 L58 170Z"/><path d="M246 160 L273 142 L300 160Z"/></g>
    <g fill="#2a2233"><circle cx="232" cy="190" r="7"/><path d="M222 236 L228 200 Q232 194 236 200 L242 236Z"/><path d="M238 204 L250 186" stroke="#2a2233" stroke-width="3" stroke-linecap="round"/></g>
    <path d="M222 184 Q232 172 244 184Z" fill="#c2361f"/>`,
    gradient('sky-paris', '#f7c6a8', '#fbe6cf'),
  ),
  // Edo, 1780: wooden workshop, cherry branch, river waves.
  edo: frame(
    `<g fill="none" stroke="#3a6a8a" stroke-width="3" stroke-linecap="round">${Array.from({ length: 6 }, (_, i) => `<path d="M${-10 + i * 60} 236 q15 -18 30 0 q15 18 30 0"/>`).join('')}</g>
    <rect y="240" width="320" height="32" fill="#2e5470"/>
    <path d="M60 210 L60 140 L170 140 L170 210Z" fill="#8a5a35"/>
    <path d="M40 146 L115 104 L190 146 L178 146 L115 114 L52 146Z" fill="#3a2a22"/>
    <g fill="#f3e4c6"><rect x="74" y="156" width="26" height="40"/><rect x="128" y="156" width="26" height="40"/></g>
    <path d="M100 196 L100 160 M128 196 L128 160" stroke="#3a2a22" stroke-width="2"/>
    <g fill="#2a2233"><circle cx="230" cy="176" r="7"/><path d="M220 224 L226 188 Q230 182 234 188 L240 224Z"/><rect x="242" y="196" width="22" height="16" rx="2" fill="#c9a06a"/></g>
    <path d="M320 40 Q260 60 236 92" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g fill="#f1a7b5"><circle cx="270" cy="62" r="7"/><circle cx="250" cy="76" r="6"/><circle cx="294" cy="50" r="6"/><circle cx="240" cy="90" r="5"/></g>`,
    gradient('sky-edo', '#f4e1c1', '#fbf0dd'),
  ),
  // Mali, 1324: salt caravan on the dunes, Timbuktu mud mosque.
  mali: frame(
    `<circle cx="64" cy="70" r="26" fill="#fff1c8"/>
    <path d="M190 176 L190 110 L206 96 L222 110 L222 176Z" fill="#a8693a"/>
    <path d="M222 176 L222 128 L270 128 L270 176Z" fill="#b97a45"/>
    <g stroke="#6f4123" stroke-width="3">${[118, 134, 150, 166].map((y) => `<path d="M186 ${y} H194 M218 ${y} H226"/>`).join('')}</g>
    <path d="M0 196 C80 170 160 190 240 176 C280 170 300 172 320 168 V272 H0Z" fill="#e2a85a"/>
    <path d="M0 230 C90 210 200 236 320 214 V272 H0Z" fill="#c9843e"/>
    <g fill="#2a2233"><path d="M70 206 q10 -16 24 -8 q8 -10 16 0 l0 4 l-6 0 l0 18 l-4 0 l0 -14 l-18 0 l0 14 l-4 0 l0 -16 q-6 2 -8 2Z"/><circle cx="118" cy="186" r="5"/><path d="M112 226 L115 194 Q118 190 121 194 L124 226Z"/></g>
    <g fill="#f6efe2"><rect x="78" y="190" width="10" height="7"/><rect x="90" y="190" width="10" height="7"/></g>`,
    gradient('sky-mali', '#f7b267', '#fbe1b0'),
  ),
  // Wild West, 1875: mesa, railroad, chuck wagon cook.
  west: frame(
    `<path d="M150 150 L170 104 L262 104 L280 150Z" fill="#b5532f"/>
    <path d="M0 160 H320 V272 H0Z" fill="#d9a066"/>
    <g stroke="#6f4123" stroke-width="3"><path d="M0 200 H320 M0 212 H320"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${10 + i * 28} 196 V216"/>`).join('')}</g>
    <path d="M30 188 L30 160 Q60 140 90 160 L90 188Z" fill="#f6efe2"/>
    <g fill="#2a2233"><circle cx="40" cy="194" r="9"/><circle cx="82" cy="194" r="9"/><circle cx="130" cy="172" r="7"/><path d="M120 222 L126 184 Q130 178 134 184 L140 222Z"/></g>
    <path d="M122 172 Q130 162 140 172Z" fill="#6f4123"/>
    <path d="M300 60 v40 M290 72 v20 M310 80 v16" stroke="#3f6b3a" stroke-width="6" stroke-linecap="round"/>`,
    gradient('sky-west', '#f6b67a', '#fbe2c0'),
  ),
  // Viking Iceland, 1000: longship under the aurora.
  viking: frame(
    `<path d="M0 90 C80 50 160 120 320 60" stroke="#7fe0b8" stroke-width="18" fill="none" opacity="0.45"/>
    <path d="M0 120 C100 80 200 140 320 96" stroke="#9fb7ff" stroke-width="10" fill="none" opacity="0.4"/>
    <path d="M0 180 L60 120 L110 170 L170 110 L230 176Z" fill="#3a4a6b"/>
    <rect y="196" width="320" height="76" fill="#1f3a5a"/>
    <path d="M70 214 Q160 236 250 214 L238 230 Q160 246 82 230Z" fill="#7a4a2a"/>
    <path d="M250 214 q14 -6 10 -26" stroke="#7a4a2a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M158 214 V146" stroke="#3a2516" stroke-width="4"/>
    <path d="M128 152 H188 L184 200 H132Z" fill="#c2361f"/>
    <path d="M128 168 H188 M128 184 H188" stroke="#f6efe2" stroke-width="4"/>`,
    gradient('sky-viking', '#1a2550', '#41507f'),
  ),
  // Industrial Manchester, 1830: mill chimneys and a worker.
  mill: frame(
    `<g fill="#8d8597" opacity="0.8"><circle cx="76" cy="46" r="18"/><circle cx="98" cy="32" r="14"/><circle cx="224" cy="56" r="16"/><circle cx="244" cy="42" r="12"/></g>
    <g fill="#5c3b30"><rect x="66" y="64" width="18" height="120"/><rect x="214" y="72" width="16" height="112"/></g>
    <path d="M30 184 L30 120 L290 120 L290 184Z" fill="#8a4b38"/>
    <g fill="#f2c770">${[50, 90, 130, 170, 210, 250].map((x) => `<rect x="${x}" y="134" width="20" height="16"/><rect x="${x}" y="158" width="20" height="16"/>`).join('')}</g>
    <rect y="184" width="320" height="88" fill="#5b5763"/>
    <g fill="#2a2233"><circle cx="160" cy="206" r="7"/><path d="M150 252 L156 216 Q160 210 164 216 L170 252Z"/></g>`,
    gradient('sky-mill', '#c9b8a8', '#e7ddd2'),
  ),
};
