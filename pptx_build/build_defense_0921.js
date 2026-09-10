/**
 * build_defense_0921.js — Slides « architecture des modèles » pour la soutenance ESME (21 sept. 2026).
 *
 * Trois slides sobres (charbon/navy) à insérer dans le deck de soutenance :
 *   1. ST-EEGFormer : un ViT sur le signal brut (figure du papier, panneau b)
 *   2. LaBraM : d'abord un vocabulaire, ensuite un modèle de langue masqué (schéma natif)
 *   3. Les deux modèles point à point sur nos données (figure 3.2 du rapport)
 * Notes orateur en français dans chaque slide.
 *
 * Toutes les valeurs sont lues dans le code du dépôt (models_vit_eeg.py, models_mae_eeg.py, labram.py, utils.py)
 * et dans le chapitre 3 du rapport ESME (docs/rapport-esme-inge3/03_etat_de_lart.md).
 *
 * Run :  cd pptx_build && node build_defense_0921.js
 * Out :  presentations/ST-EEGFormer_soutenance_ESME_2026-09-21_architectures.pptx
 */

const pptxgen = require("pptxgenjs");
const path = require("path");

const INK = "1F2733";
const NAVY = "1F3A5F";
const ACCENT = "2E6F9E";
const RED = "A23B2B";
const RED_L = "F7E7E3";
const GREY = "5C6672";
const LIGHT = "EEF2F6";
const LINE = "C9D3DC";
const WHITE = "FFFFFF";

const ROOT = path.resolve(__dirname, "..");
const FIG_DIR = path.join(ROOT, "docs", "rapport-esme-inge3", "figures");
const OUT = path.join(ROOT, "presentations", "ST-EEGFormer_soutenance_ESME_2026-09-21_architectures.pptx");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Maxime Lacombe";
pres.title = "Soutenance ESME — architectures ST-EEGFormer / LaBraM";

function titleBand(slide, title, subtitle) {
  slide.background = { color: WHITE };
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.05, fill: { color: INK } });
  slide.addText(title, {
    x: 0.5, y: 0.12, w: 12.3, h: 0.5, fontFace: "Georgia", fontSize: 24, bold: true, color: WHITE,
  });
  slide.addText(subtitle, {
    x: 0.5, y: 0.6, w: 12.3, h: 0.35, fontFace: "Calibri", fontSize: 13, color: "C7D2DD",
  });
}

function footer(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 7.05, w: 12.3, h: 0.3, fontFace: "Calibri", fontSize: 9, color: GREY, italic: true,
  });
}

function stepBox(slide, x, y, w, h, num, label, body, opts = {}) {
  const edge = opts.red ? RED : ACCENT;
  const fill = opts.red ? RED_L : LIGHT;
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: edge, width: 1 },
  });
  slide.addText(String(num), {
    x: x + 0.12, y: y + 0.1, w: 0.42, h: 0.42, fontFace: "Georgia", fontSize: 16, bold: true,
    color: WHITE, align: "center", valign: "middle", fill: { color: edge }, shape: pres.ShapeType.ellipse,
  });
  slide.addText(label.toUpperCase(), {
    x: x + 0.62, y: y + 0.1, w: w - 0.75, h: 0.3, fontFace: "Calibri", fontSize: 10, bold: true,
    color: edge, charSpacing: 1,
  });
  slide.addText(body, {
    x: x + 0.15, y: y + 0.55, w: w - 0.3, h: h - 0.65, fontFace: "Calibri", fontSize: 11.5,
    color: INK, valign: "top", paraSpaceAfter: 2,
  });
}

// ---------------------------------------------------------------------------
// Slide 1 — ST-EEGFormer
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  titleBand(s, "ST-EEGFormer : un Vision Transformer sur le signal EEG brut",
    "Yang, Sun, Li & Van Hulle (ICLR 2026) — patches continus, pré-entraînement par auto-encodeur masqué (MAE)");

  // Panneau (b) de la figure 1 du papier (crop du bas de l'image).
  // pptxgenjs : w/h = taille de l'image complète mise à l'échelle ; sizing = rectangle affiché.
  const imgW = 12.3, imgH = imgW * (1859 / 3168); // 7.22
  const cropY = imgH * 0.43;
  s.addImage({
    path: path.join(FIG_DIR, "fig_steegformer_overview.png"),
    x: 0.5, y: 1.2, w: imgW, h: imgH,
    sizing: { type: "crop", x: 0, y: cropY, w: imgW, h: imgH - cropY },
  });

  const y0 = 5.4, h = 1.55, w = 2.95, gap = 0.17;
  stepBox(s, 0.5, y0, w, h, 1, "Découper",
    "Chaque canal est coupé en patches de 16 échantillons (125 ms à 128 Hz), sans recouvrement.\n8 s × 64 canaux → 4 096 patches.");
  stepBox(s, 0.5 + (w + gap), y0, w, h, 2, "Plonger + situer",
    "Une couche linéaire 16 → 1 024. On ajoute un codage temporel sinusoïdal (quand) et un plongement d’électrode appris, 145 slots (où).");
  stepBox(s, 0.5 + 2 * (w + gap), y0, w, h, 3, "Pré-entraîner (MAE)",
    "75 % des patches masqués ; l’encodeur ne voit que le reste ; un décodeur léger prédit les 16 amplitudes ; MSE sur les patches masqués.", { red: true });
  stepBox(s, 0.5 + 3 * (w + gap), y0, w, h, 4, "Adapter",
    "Décodeur jeté. Encodeur large : 24 blocs, D = 1 024, ≈ 302 M paramètres. Moyenne des tokens → tête linéaire (gauche / droite).");

  footer(s, "Figure : Yang et al., ICLR 2026, fig. 1(b) — © KU Leuven. Valeurs lues dans le code du dépôt (models_vit_eeg.py, models_mae_eeg.py).");

  s.addNotes(
    "ST-EEGFormer applique la recette du Vision Transformer au signal EEG, sans rien d’autre. " +
    "Quatre étapes. Un : on découpe chaque canal en petits morceaux de 16 échantillons, soit 125 millisecondes à 128 hertz ; sur notre fenêtre de 8 secondes à 64 canaux, cela fait 4 096 morceaux. " +
    "Deux : chaque morceau passe par une seule couche linéaire qui en fait un vecteur de dimension 1 024 — il n’y a aucun dictionnaire, la représentation reste continue — et on ajoute deux informations de position : quand, par un codage sinusoïdal, et où, par une table apprise qui identifie l’électrode. " +
    "Trois, le pré-entraînement : c’est un auto-encodeur masqué. On cache 75 % des morceaux, l’encodeur ne voit que le reste, et un petit décodeur doit reconstituer les amplitudes des morceaux cachés. La perte est une simple erreur quadratique, calculée uniquement sur ce qui a été caché. La cible est le signal lui-même. " +
    "Quatre, l’adaptation : on jette le décodeur, on garde l’encodeur — 24 blocs, environ 302 millions de paramètres pour la variante large — on moyenne tous les tokens de sortie et une couche linéaire décide gauche ou droite. " +
    "Le point à retenir : tout le modèle est standard ; ce qui est spécifique à l’EEG tient dans le découpage par canal et le plongement d’électrode."
  );
}

// ---------------------------------------------------------------------------
// Slide 2 — LaBraM
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  titleBand(s, "LaBraM : un vocabulaire appris, puis un modèle de langue masqué",
    "Jiang, Zhao & Lu (ICLR 2024) — tokens discrets (quantification vectorielle), prédiction des codes masqués");

  // Colonne gauche : flux encodeur (commun aux deux temps)
  const xL = 0.5, wL = 5.9;
  s.addText("ENCODEUR (identique en pré-entraînement et en aval)", {
    x: xL, y: 1.25, w: wL, h: 0.3, fontFace: "Calibri", fontSize: 10, bold: true, color: ACCENT, charSpacing: 1,
  });
  const flow = [
    ["Entrée", "64 canaux × 8 s, rééchantillonnés à 200 Hz"],
    ["Découpage", "patches de 200 échantillons = 1 s → 64 × 8 = 512 patches"],
    ["Plongement", "3 convolutions temporelles (GroupNorm, GELU) → vecteur de 200\n+ plongement d’électrode appris (128 slots) + plongement temporel appris (16 slots)"],
    ["Transformeur", "base : 12 blocs, 10 têtes, D = 200 — ≈ 5,8 M paramètres"],
    ["Aval", "moyenne des tokens → tête linéaire (gauche / droite)"],
  ];
  let y = 1.6;
  const hs = [0.62, 0.62, 1.0, 0.62, 0.62];
  flow.forEach((f, i) => {
    const h = hs[i];
    s.addShape(pres.ShapeType.roundRect, { x: xL, y, w: wL, h, rectRadius: 0.05,
      fill: { color: LIGHT }, line: { color: ACCENT, width: 1 } });
    s.addText(f[0].toUpperCase(), { x: xL + 0.15, y: y + 0.06, w: 1.6, h: 0.25, fontFace: "Calibri",
      fontSize: 9.5, bold: true, color: ACCENT, charSpacing: 1 });
    s.addText(f[1], { x: xL + 0.15, y: y + 0.28, w: wL - 0.3, h: h - 0.32, fontFace: "Calibri",
      fontSize: 11, color: INK, valign: "top" });
    y += h;
    if (i < flow.length - 1) {
      s.addShape(pres.ShapeType.downArrow, { x: xL + wL / 2 - 0.12, y: y + 0.02, w: 0.24, h: 0.2,
        fill: { color: GREY }, line: { color: GREY, width: 0 } });
      y += 0.26;
    }
  });

  // Colonne droite : pré-entraînement en deux temps
  const xR = 6.85, wR = 5.98;
  s.addText("PRÉ-ENTRAÎNEMENT EN DEUX TEMPS (ce qui diffère de ST-EEGFormer)", {
    x: xR, y: 1.25, w: wR, h: 0.3, fontFace: "Calibri", fontSize: 10, bold: true, color: RED, charSpacing: 1,
  });
  stepBox(s, xR, 1.6, wR, 2.35, "①", "Apprendre le tokeniseur (VQ)",
    "Un dictionnaire de plusieurs milliers de vecteurs (8 192 dans la configuration publiée). Chaque patch de 1 s est remplacé par le vecteur le plus proche : il devient un indice entier.\n" +
    "Le dictionnaire est appris en reconstruisant non pas le signal brut mais son spectre de Fourier (amplitude + phase).", { red: true });
  stepBox(s, xR, 4.1, wR, 2.05, "②", "Modélisation d’EEG masqué",
    "Tokeniseur gelé. 50 % des patches sont masqués ; le transformeur prédit l’indice du code manquant.\n" +
    "Perte : entropie croisée — une classification, pas une régression d’amplitudes.", { red: true });
  s.addShape(pres.ShapeType.roundRect, { x: xR, y: 6.3, w: wR, h: 0.65, rectRadius: 0.05,
    fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addText("Pré-entraîné sur ≈ 2 500 h d’EEG (≈ 20 jeux publics). En aval, le tokeniseur est jeté : LaBraM devient, comme ST-EEGFormer, un encodeur continu surmonté d’une couche linéaire.", {
    x: xR + 0.12, y: 6.32, w: wR - 0.24, h: 0.62, fontFace: "Calibri", fontSize: 10.5, color: INK, valign: "middle",
  });

  footer(s, "Valeurs de l’encodeur lues dans benchmark/neural_networks/models/labram.py (copie du dépôt officiel) ; pré-entraînement d’après Jiang et al., ICLR 2024.");

  s.addNotes(
    "LaBraM est le modèle étudié en parallèle par Liz, et c’est notre point de comparaison. Son idée : traiter l’EEG comme un texte. " +
    "À gauche, l’encodeur. Le signal est rééchantillonné à 200 hertz et découpé en patches de une seconde — donc sur nos 8 secondes et 64 canaux, 512 patches au lieu de 4 096. " +
    "Chaque patch passe par trois petites convolutions temporelles qui produisent un vecteur de 200, auquel on ajoute un plongement d’électrode et un plongement temporel, tous deux appris. Le transformeur base fait 12 blocs et environ 5,8 millions de paramètres : cinquante fois moins que ST-EEGFormer large. " +
    "À droite, ce qui fait la différence : le pré-entraînement se fait en deux temps. D’abord on apprend un vocabulaire : un dictionnaire de codes, et chaque patch est remplacé par l’indice du code le plus proche. Ce dictionnaire est appris en reconstruisant le spectre de Fourier du patch, pas le signal brut — les auteurs jugeaient le signal brut trop bruité pour être reconstruit directement. " +
    "Ensuite, on gèle ce tokeniseur, on masque la moitié des patches, et le transformeur doit prédire l’indice du code manquant, avec une entropie croisée. C’est une classification, comme un modèle de langue masqué. " +
    "En aval, tout cela est jeté : LaBraM devient, exactement comme ST-EEGFormer, un encodeur suivi d’une moyenne et d’une couche linéaire. C’est ce qui rend la comparaison des deux modèles loyale."
  );
}

// ---------------------------------------------------------------------------
// Slide 3 — Point à point
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  titleBand(s, "Les deux modèles point à point, sur nos données",
    "Même fenêtre 8 s × 64 canaux — en rouge, la seule différence de fond : l’objectif de pré-entraînement");

  // Figure 3.2 du rapport (ratio 12.5 x 9.6)
  const fh = 5.75, fw = fh * (12.5 / 9.6); // 7.49
  s.addImage({ path: path.join(FIG_DIR, "fig_architectures_comparees.png"), x: 0.4, y: 1.2, w: fw, h: fh });

  const xR = 8.2, wR = 4.65;
  const cards = [
    ["Identique", "La logique ViT : patch par canal, plongement, position, attention plate, moyenne, tête linéaire. En aval, les deux sont des encodeurs continus + une couche linéaire.", ACCENT],
    ["Diffère vraiment", "La cible du pré-entraînement. ST-EEGFormer régresse les 16 amplitudes du patch (MSE, 75 % masqués). LaBraM classe l’indice d’un code appris sur le spectre (entropie croisée, 50 % masqués).", RED],
    ["Diffère en échelle", "≈ 302 M vs ≈ 5,8 M paramètres ; 4 096 vs 512 tokens ; patches de 125 ms vs 1 s. Deux régimes de résolution temporelle et de coût.", ACCENT],
    ["Ce que ça implique", "Sur notre tâche, les deux arrivent à ≈ 62 % en population : cohérent avec Yang et al. — le fine-tuning efface une grande part de la spécialisation du pré-entraînement.", NAVY],
  ];
  let y = 1.2;
  const ch = [1.3, 1.5, 1.25, 1.45];
  cards.forEach((c, i) => {
    const h = ch[i];
    s.addShape(pres.ShapeType.roundRect, { x: xR, y, w: wR, h, rectRadius: 0.05,
      fill: { color: c[2] === RED ? RED_L : LIGHT }, line: { color: c[2], width: 1 } });
    s.addText(c[0].toUpperCase(), { x: xR + 0.15, y: y + 0.07, w: wR - 0.3, h: 0.26, fontFace: "Calibri",
      fontSize: 10, bold: true, color: c[2], charSpacing: 1 });
    s.addText(c[1], { x: xR + 0.15, y: y + 0.33, w: wR - 0.3, h: h - 0.38, fontFace: "Calibri",
      fontSize: 10.5, color: INK, valign: "top" });
    y += h + 0.1;
  });

  footer(s, "Figure 3.2 du rapport ESME (docs/rapport-esme-inge3/make_fig_architectures.py). Population 43 sujets : ST-EEGFormer 61,66 %, LaBraM ≈ 62 % (Liz), hasard 50 %.");

  s.addNotes(
    "Cette figure met les deux modèles côte à côte, étape par étape, sur exactement les mêmes données : une fenêtre de 8 secondes, 64 canaux. " +
    "Trois lectures. Première : ce qui est identique. Les deux suivent la logique du Vision Transformer — des patches par canal, un plongement, une information de position, une attention plate sur toute la séquence, puis une moyenne et une couche linéaire. Un lecteur qui comprend l’un comprend l’autre. " +
    "Deuxième : ce qui diffère vraiment, c’est la ligne rouge — la cible du pré-entraînement. ST-EEGFormer fait une régression : il reconstruit les amplitudes. LaBraM fait une classification : il prédit l’indice d’un mot de vocabulaire, vocabulaire appris sur le spectre. Les deux se disent masqués, mais ils ne prédisent pas la même chose. " +
    "Troisième : ce qui diffère en échelle. Cinquante fois plus de paramètres et huit fois plus de tokens pour ST-EEGFormer, avec des patches huit fois plus courts. Ce sont deux régimes différents, et améliorer l’un n’est pas nécessairement améliorer l’autre. " +
    "Ce que cela implique pour nos résultats : sur la tâche d’attention spatiale, en population sur 43 sujets, les deux arrivent au même endroit, autour de 62 %. C’est cohérent avec la conclusion de Yang et al. : après fine-tuning, la nature de l’objectif de pré-entraînement cesse d’être discriminante. " +
    "Attention à ne pas dire que ST-EEGFormer bat LaBraM : l’écart est de l’ordre de 0,3 point, sans test statistique ni graines appariées."
  );
}

pres.writeFile({ fileName: OUT }).then((f) => console.log("wrote", f));
