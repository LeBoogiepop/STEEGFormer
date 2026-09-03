# VPN ATR + A100 — guide Maxime (sep. 2026)

Fichiers reçus le **1er sept. 2026** (Sawada-san / TSG Sakai).  
Sources : `info_maxime.lacombe.txt`, `README.txt`, certificats dans `Downloads/`.

**Deadline téléchargement certificats : 29 septembre 2026**

---

## C’est quoi / pourquoi

- **VPN** = tunnel pour accéder au réseau ATR **depuis l’extérieur du LAN ATR** (ex. ton appart à Kyoto, réseau perso).
- **Sans VPN** : pas d’accès aux serveurs `abi-dgx-a100`, `abi-node01`, etc. depuis l’extérieur.
- **mnode** (`lacombe-m@10.232.11.170`) = cluster Ishii / Slurm actuel → **autre machine**, autre compte. Tu y accèdes déjà depuis le labo / réseau labo sans ce VPN.
- **Depuis le bureau ATR (LAN corporate)** : le guide dit explicitement de **ne pas** configurer/connecter le VPN — fais-le depuis chez toi à Kyoto ou autre réseau non-ATR.

Usage prévu : reruns GPU plus rapides (population ST-EEGFormer, preprocessing v3) après les tests Liz.

---

## Règles importantes (lire)

1. **Ne configure / connecte pas le VPN depuis le LAN ATR** (bureau sur site ATR). Fais tout **depuis ton appart / wifi perso à Kyoto** (ou n’importe quel réseau hors LAN ATR).
2. **Déconnecte le VPN** quand tu as fini (Cisco Secure Client → Disconnect).
3. **Interdit** sur le réseau ATR : logiciels P2P (TeamViewer, Steam, etc.).
4. Deux mots de passe différents → voir `README.txt` :
   - **Installation Password** → import du `.p12` seulement
   - **VPN Connection Password** → connexion Cisco Secure Client

En cas de blocage : **cns-tsg@atr.jp** (TSG). Sawada ne gère pas la technique.

---

## Étape 0 — Vérifier que tu as tout

Dans `Downloads/` (ou dossier dédié `ATR-VPN/`) :

| Fichier | Rôle |
|---------|------|
| `root-ca.cert.cer` | Certificat racine (Windows) |
| `maxime.lacombe.p12` | Certificat perso |
| `README.txt` | Mots de passe install + VPN |
| `info_maxime.lacombe.txt` | Guide officiel + comptes Linux |

---

## Étape 1 — Installer les certificats (Windows)

### 1a. Certificat racine

1. Double-clic sur `root-ca.cert.cer`
2. **Install Certificate**
3. Store Location : **Local Machine** → Next
4. UAC → **Yes**
5. **Place all certificates in the following store** → Browse
6. Choisir **Trusted Root Certification Authorities** → OK → Next → Finish
7. Si confirmation → **Yes**

### 1b. Certificat perso (.p12)

1. Double-clic sur `maxime.lacombe.p12`
2. Store Location : **Current User** → Next
3. File already specified → Next
4. **Private Key Protection** : mot de passe **Installation Password** dans `README.txt` → Next
5. Certificate Store : laisser par défaut → Next → Finish

---

## Étape 2 — Installer Cisco Secure Client

1. Ouvrir `info_maxime.lacombe.txt`, section **VPN Software (Cisco Secure Client)**
2. Télécharger le `.msi` Windows (lien Nextcloud + mot de passe dans le guide)
3. Installer (Next, Next…)
4. Redémarrer le PC si demandé

---

## Étape 3 — Se connecter au VPN

1. Lancer **Cisco Secure Client**
2. Serveur : `vpngw-ng.atr.jp`
3. Connect
4. User : `maxime.lacombe`
5. Password : **VPN Connection Password** dans `README.txt` (pas le mot de passe install)
6. OK → statut **Connected**

---

## Étape 4 — Tester SSH vers l’A100

**Uniquement quand le VPN est Connected.**

PowerShell :

```powershell
ssh maxime.lacombe@abi-dgx-a100.cns.atr.jp
```

- Mot de passe : section **Linux Servers** dans `info_maxime.lacombe.txt` (compte `maxime.lacombe`).
- Premier login : accepter la fingerprint (`yes`).
- Home directory : `/home/abi/maxime.lacombe`

Vérifier GPU :

```bash
nvidia-smi
```

Autres nœuds (optionnel) : `abi-node01.cns.atr.jp`, `abi-node02.cns.atr.jp`

---

## Étape 5 — Usage compute

Après login sur un nœud :

```bash
loadall abi
```

→ voir charge des machines avant de lancer un training.

**Samba / fichiers** (optionnel) :

- Windows : `\\abi.cns.atr.jp`
- Dossier perso aussi sur `abi-data1`

---

## mnode vs A100 — ne pas confondre

| | mnode (Ishii lab) | A100 (ATR via VPN) |
|---|---|---|
| SSH | `ssh lacombe-m@10.232.11.170` | VPN puis `ssh maxime.lacombe@abi-dgx-a100.cns.atr.jp` |
| Compte | `lacombe-m` | `maxime.lacombe` |
| Slurm | `module load slurm/23.02.7` | voir doc labo / TSG |
| Déjà utilisé pour | LOSO, population spatial | Prochains reruns lourds |

Les données sur mnode (`~/data/g2_transfer/...`) ne sont **pas** automatiquement sur A100. Il faudra copier ou regénérer (scp, rsync, ou re-run prep).

---

## Dépannage rapide

| Problème | Piste |
|----------|--------|
| VPN refuse depuis le labo ATR | Normal — fais-le depuis ton appart (Kyoto) ou autre réseau hors LAN ATR |
| Erreur certificat | Re-import root CA + p12, redémarrer Cisco |
| SSH timeout | VPN pas connecté, ou mauvais hostname (il faut `.cns.atr.jp`) |
| Mot de passe refusé VPN | Utiliser **VPN Connection Password**, pas Installation |
| Mac Sonoma certificat | Voir note macOS dans `info_maxime.lacombe.txt` ou mail TSG |

Contact : **cns-tsg@atr.jp**

---

## Checklist

- [x] Certificats installés (root + p12) — 2 sept. 2026
- [x] Cisco Secure Client installé — 2 sept. 2026
- [x] VPN connecté depuis appart Kyoto — 2 sept. 2026
- [x] `ssh abi-dgx-a100.cns.atr.jp` OK — 8× A100 40GB visibles
- [x] `nvidia-smi` OK
- [ ] VPN déconnecté après usage (penser à Disconnect quand fini)

---

## Prochaine étape stage (après VPN OK)

1. Tests preprocessing Liz sur mnode (rapide, CPU) : `bash benchmark/spatial_attention/run_on_mnode.sh`
2. Si gain → regénérer pkls + **un** run population sur A100
3. Demander à Kubo-san les bons `cpus-per-task` / `num_workers` avant gros jobs
