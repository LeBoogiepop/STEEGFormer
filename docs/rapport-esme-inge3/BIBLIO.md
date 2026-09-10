# Bibliographie

Les références sont classées par thème. Les métadonnées des travaux cités par le papier support ont été relevées dans sa propre bibliographie (PDF disponible localement) ; celles qui n’ont pas pu être vérifiées sur ce poste sont signalées.

## Papier support du stage

1. **Yang, L., Sun, Q., Li, A., & Van Hulle, M. M.** (2026). *Are EEG Foundation Models Worth It? Comparative Evaluation with Traditional Decoders in Diverse BCI Tasks.* The Fourteenth International Conference on Learning Representations (ICLR 2026). OpenReview : `https://openreview.net/forum?id=5Xwm8e6vbh`. Code et poids : `https://github.com/LiuyinYang1101/STEEGFormer` (licence MIT pour le code). — *Article et matériel supplémentaire consultés en PDF ; la page OpenReview n’a pas pu être ouverte depuis la machine de rédaction (vérification anti-robot).*

## Modèles de fondation EEG

2. **Kostas, D., Aroca-Ouellette, S., & Rudzicz, F.** (2021). *BENDR: Using Transformers and a Contrastive Self-Supervised Learning Task to Learn from Massive Amounts of EEG Data.* arXiv:2101.12037.
3. **Yang, C., Westover, M. B., & Sun, J.** (2023). *BIOT: Cross-data Biosignal Learning in the Wild.* arXiv:2305.10351.
4. **Jiang, W.-B., Zhao, L.-M., & Lu, B.-L.** (2024). *Large Brain Model for Learning Generic Representations with Tremendous EEG Data in BCI* (LaBraM). The Twelfth International Conference on Learning Representations (ICLR 2024). arXiv:2405.18765. Code : `https://github.com/935963004/LaBraM` (copie de l’encodeur dans `benchmark/neural_networks/models/labram.py` du dépôt ST-EEGFormer).
5. **Wang, G., Liu, W., He, Y., Xu, C., Ma, L., & Li, H.** (2024). *EEGPT: Pretrained Transformer for Universal and Reliable Representation of EEG Signals.* Advances in Neural Information Processing Systems 37, 39249–39280.
6. **Wang, J., Zhao, S., Luo, Z., Zhou, Y., Jiang, H., Li, S., Li, T., & Pan, G.** (2025). *CBraMod: A Criss-Cross Brain Foundation Model for EEG Decoding.* arXiv:2412.07236.
7. *EEG Foundation Models: A Critical Review of Current Progress and Future Directions.* — Revue remise par le professeur Ishii en avril 2026 et présentée au séminaire du laboratoire. **Le PDF n’est pas présent sur la machine de rédaction** ; seule ma présentation dérivée l’est. Références bibliographiques complètes à compléter avant dépôt.

## Architectures et auto-supervision (hors EEG)

8. **Dosovitskiy, A., Beyer, L., Kolesnikov, A., et al.** (2021). *An Image is Worth 16×16 Words: Transformers for Image Recognition at Scale.* arXiv:2010.11929. (Vision Transformer.)
9. **He, K., Chen, X., Xie, S., Li, Y., Dollár, P., & Girshick, R.** (2022). *Masked Autoencoders Are Scalable Vision Learners.* IEEE/CVF CVPR 2022. (MAE.)

## Décodeurs EEG classiques et compacts

10. **Ramoser, H., Müller-Gerking, J., & Pfurtscheller, G.** (2000). *Optimal Spatial Filtering of Single Trial EEG During Imagined Hand Movement.* IEEE Transactions on Rehabilitation Engineering, 8(4), 441–446. (CSP.)
11. **Ang, K. K., Chin, Z. Y., Zhang, H., & Guan, C.** (2008). *Filter Bank Common Spatial Pattern (FBCSP) in Brain–Computer Interface.* IEEE IJCNN 2008.
12. **Congedo, M., Barachant, A., & Bhatia, R.** (2017). *Riemannian Geometry for EEG-based Brain-Computer Interfaces: A Primer and a Review.* Brain-Computer Interfaces, 4(3), 155–174.
13. **Schirrmeister, R. T., Springenberg, J. T., Fiederer, L. D. J., et al.** (2017). *Deep Learning with Convolutional Neural Networks for EEG Decoding and Visualization.* Human Brain Mapping, 38(11), 5391–5420. (DeepConvNet.)
14. **Lawhern, V. J., Solon, A. J., Waytowich, N. R., Gordon, S. M., Hung, C. P., & Lance, B. J.** (2018). *EEGNet: A Compact Convolutional Neural Network for EEG-based Brain–Computer Interfaces.* Journal of Neural Engineering, 15(5), 056013.
15. **Song, Y., Zheng, Q., Liu, B., & Gao, X.** (2023). *EEG Conformer: Convolutional Transformer for EEG Decoding and Visualization.* IEEE TNSRE, 31, 710–719.
16. **Zhao, W., Jiang, X., Zhang, B., Xiao, S., & Weng, S.** (2024). *CTNet: A Convolutional Transformer Network for EEG-based Motor Imagery Classification.* Scientific Reports, 14(1), 20237.
17. **Chen, X., Wang, Y., Gao, S., Jung, T.-P., & Gao, X.** (2015). *Filter Bank Canonical Correlation Analysis for Implementing a High-Speed SSVEP-based Brain–Computer Interface.* (FBCCA ; référence citée par le papier support.)
18. **Nakanishi, M., Wang, Y., Chen, X., Wang, Y.-T., Gao, X., & Jung, T.-P.** (2018). *Enhancing Detection of SSVEPs for a High-Speed Brain Speller Using Task-Related Component Analysis.* (TRCA ; référence citée par le papier support.)
## Jeux de données

19. **Tangermann, M., Müller, K.-R., Aertsen, A., et al.** (2012). *Review of the BCI Competition IV.* Frontiers in Neuroscience, 6, 55. (BCI-IV-2a, 4 classes, hasard 25 %.)
20. **Morioka, H., et al.** (2014). — Paradigme d’attention visuo-spatiale associé au jeu ATR NBP utilisé dans ce stage. **Référence complète non vérifiable sur la machine de rédaction (PDF absent).** À compléter auprès du laboratoire avant dépôt ; les caractéristiques utilisées ici (2 classes, fenêtre d’attention de 8 s, 43 sujets) proviennent de l’usage opérationnel du laboratoire et de l’exploration directe des fichiers.
21. **Obeid, I., & Picone, J.** (2016). *The Temple University Hospital EEG Data Corpus.* (TUEG/TUEV, corpus de pré-entraînement fréquemment utilisé par les modèles de fondation EEG.)

## Modèles de fondation en électrophysiologie et imagerie calcique

22. **Azabou, M., et al.** (2023). *A Unified, Scalable Framework for Neural Population Decoding* (POYO). Advances in Neural Information Processing Systems 36 (NeurIPS 2023). Implémentation : `torch_brain` / `brainsets` (`https://github.com/neuro-galaxy/torch_brain`).
23. **Azabou, M., et al.** *Neural Decoding from Distinct Cell-Types.* — PDF fourni par le laboratoire ; métadonnées de publication à compléter.
24. **CalM.** arXiv:2604.04958. Modèle de fondation pour l’imagerie calcique fondé sur un tokeniseur à quantification vectorielle et un transformeur *dual-axis* autorégressif. — *Lu en PDF local ; identifiant arXiv relevé dans les notes du laboratoire.*
25. **CAPT.** arXiv:2607.23258. *Continuous patch tokenization* pour l’imagerie calcique, objectif autorégressif en MSE, transfert inter-espèces à dorsale gelée. — *Lu en PDF local.*
26. **POCO.** — Modèle de prévision d’activité calcique présenté au *paper reading club* du 18 août 2026 ; référence à compléter.

## Documents internes et sources primaires du stage

27. **Journal de bord du stage**, `torch-brain-eeg/notes/JOURNAL.md` (avril–août 2026). Source de vérité pour toutes les dates, configurations et valeurs numériques citées dans les chapitres 5 et 6.
28. **Fiche de lecture EEG ↔ imagerie calcique**, `notes/papers/README_meeting_2026-08-13.md`.
29. **Supports de présentation** : séminaire de revue (avril), présentation d’article (mai), *progress talk* du 23 juillet, exposé technique du 19 août — répertoire `STEEGFormer/presentations/`.
30. **Code du stage** : `util/prepare_atr_nbp_spatial_attention.py`, `util/dataset_specs_lab_spatial_attention.yaml`, `scripts/summarize_g2_json_logs.py`, scripts d’orchestration PowerShell et Slurm ; scripts de prétraitement `benchmark/spatial_attention/` (alignement euclidien, laplacien/CSD, rejet d’artefacts — écrits, non encore exécutés au 10 septembre 2026).

## Transfert inter-sujets et prétraitement

31. **He, H., & Wu, D.** (2020). *Transfer Learning for Brain–Computer Interfaces: A Euclidean Space Data Alignment Approach.* IEEE Transactions on Biomedical Engineering, 67(2), 399–410. (Alignement euclidien, piste proposée par Liz Costato le 2 septembre 2026.)
