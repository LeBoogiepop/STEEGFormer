# Bibliographie

Les références sont classées par thème. Chaque entrée comporte un lien pérenne (DOI, arXiv ou dépôt de code). Les articles marqués « lu en PDF » ont été consultés intégralement pendant le stage ; les autres sont cités à partir du papier support ou des séminaires du laboratoire.

## Papier support du stage

1. **Yang, L., Sun, Q., Li, A., & Van Hulle, M. M.** (2026). *Are EEG Foundation Models Worth It? Comparative Evaluation with Traditional Decoders in Diverse BCI Tasks.* The Fourteenth International Conference on Learning Representations (ICLR 2026). OpenReview : https://openreview.net/forum?id=5Xwm8e6vbh. Code et poids : https://github.com/LiuyinYang1101/STEEGFormer (licence MIT). — *Article et matériel supplémentaire lus en PDF (66 pages) ; les chiffres cités au chapitre 3 (8 M de segments, 142 électrodes, 128 Hz, fenêtres de 6 s, masquage 75 %, 16 × A100-80 Go, 32 614 heures-GPU) en sont tirés directement.*

## Modèles de fondation EEG

2. **Kostas, D., Aroca-Ouellette, S., & Rudzicz, F.** (2021). *BENDR: Using Transformers and a Contrastive Self-Supervised Learning Task to Learn from Massive Amounts of EEG Data.* Frontiers in Human Neuroscience, 15, 653659. arXiv : https://arxiv.org/abs/2101.12037.
3. **Yang, C., Westover, M. B., & Sun, J.** (2023). *BIOT: Cross-data Biosignal Learning in the Wild.* Advances in Neural Information Processing Systems 36 (NeurIPS 2023). arXiv : https://arxiv.org/abs/2305.10351.
4. **Jiang, W.-B., Zhao, L.-M., & Lu, B.-L.** (2024). *Large Brain Model for Learning Generic Representations with Tremendous EEG Data in BCI* (LaBraM). The Twelfth International Conference on Learning Representations (ICLR 2024). arXiv : https://arxiv.org/abs/2405.18765. Code : https://github.com/935963004/LaBraM (copie de l’encodeur dans `benchmark/neural_networks/models/labram.py` du dépôt ST-EEGFormer). — *Les valeurs citées en § 3.5 (dictionnaire de 8 192 codes, taux de masquage 0,5, ~2 500 h de pré-entraînement, 5,8 M / 46 M / 369 M de paramètres) proviennent du texte et des tables d’hyperparamètres de l’article.*
5. **Wang, G., Liu, W., He, Y., Xu, C., Ma, L., & Li, H.** (2024). *EEGPT: Pretrained Transformer for Universal and Reliable Representation of EEG Signals.* Advances in Neural Information Processing Systems 37 (NeurIPS 2024). Code : https://github.com/BINE022/EEGPT.
6. **Wang, J., Zhao, S., Luo, Z., Zhou, Y., Jiang, H., Li, S., Li, T., & Pan, G.** (2025). *CBraMod: A Criss-Cross Brain Foundation Model for EEG Decoding.* ICLR 2025. arXiv : https://arxiv.org/abs/2412.07236.
7. **Kuruppu, G., Wagh, N., Kremen, V., & Varatharajah, Y.** (2026). *EEG Foundation Models: A Critical Review of Current Progress and Future Directions.* Journal of Neural Engineering, 23(2), 021001. DOI : https://doi.org/10.1088/1741-2552/ae4455. Prépublication : https://arxiv.org/abs/2507.11783. — *Revue remise par le professeur Ishii en avril 2026, lue en PDF et présentée au séminaire interne du laboratoire.*

## Architectures et auto-supervision (hors EEG)

8. **Dosovitskiy, A., Beyer, L., Kolesnikov, A., et al.** (2021). *An Image is Worth 16×16 Words: Transformers for Image Recognition at Scale.* ICLR 2021. arXiv : https://arxiv.org/abs/2010.11929. (Vision Transformer.)
9. **He, K., Chen, X., Xie, S., Li, Y., Dollár, P., & Girshick, R.** (2022). *Masked Autoencoders Are Scalable Vision Learners.* IEEE/CVF CVPR 2022. arXiv : https://arxiv.org/abs/2111.06377. (MAE.)

## Décodeurs EEG classiques et compacts

10. **Ramoser, H., Müller-Gerking, J., & Pfurtscheller, G.** (2000). *Optimal Spatial Filtering of Single Trial EEG During Imagined Hand Movement.* IEEE Transactions on Rehabilitation Engineering, 8(4), 441–446. DOI : https://doi.org/10.1109/86.895946. (CSP.)
11. **Ang, K. K., Chin, Z. Y., Zhang, H., & Guan, C.** (2008). *Filter Bank Common Spatial Pattern (FBCSP) in Brain–Computer Interface.* IEEE International Joint Conference on Neural Networks (IJCNN 2008), 2390–2397. DOI : https://doi.org/10.1109/IJCNN.2008.4634130.
12. **Congedo, M., Barachant, A., & Bhatia, R.** (2017). *Riemannian Geometry for EEG-based Brain-Computer Interfaces: A Primer and a Review.* Brain-Computer Interfaces, 4(3), 155–174. DOI : https://doi.org/10.1080/2326263X.2017.1297192.
13. **Schirrmeister, R. T., Springenberg, J. T., Fiederer, L. D. J., et al.** (2017). *Deep Learning with Convolutional Neural Networks for EEG Decoding and Visualization.* Human Brain Mapping, 38(11), 5391–5420. DOI : https://doi.org/10.1002/hbm.23730. (DeepConvNet.)
14. **Lawhern, V. J., Solon, A. J., Waytowich, N. R., Gordon, S. M., Hung, C. P., & Lance, B. J.** (2018). *EEGNet: A Compact Convolutional Neural Network for EEG-based Brain–Computer Interfaces.* Journal of Neural Engineering, 15(5), 056013. DOI : https://doi.org/10.1088/1741-2552/aace8c.
15. **Song, Y., Zheng, Q., Liu, B., & Gao, X.** (2023). *EEG Conformer: Convolutional Transformer for EEG Decoding and Visualization.* IEEE Transactions on Neural Systems and Rehabilitation Engineering, 31, 710–719. DOI : https://doi.org/10.1109/TNSRE.2022.3230250.
16. **Zhao, W., Jiang, X., Zhang, B., Xiao, S., & Weng, S.** (2024). *CTNet: A Convolutional Transformer Network for EEG-based Motor Imagery Classification.* Scientific Reports, 14, 20237. DOI : https://doi.org/10.1038/s41598-024-71118-7.
17. **Chen, X., Wang, Y., Gao, S., Jung, T.-P., & Gao, X.** (2015). *Filter Bank Canonical Correlation Analysis for Implementing a High-Speed SSVEP-based Brain–Computer Interface.* Journal of Neural Engineering, 12(4), 046008. DOI : https://doi.org/10.1088/1741-2560/12/4/046008. (FBCCA ; référence citée par le papier support.)
18. **Nakanishi, M., Wang, Y., Chen, X., Wang, Y.-T., Gao, X., & Jung, T.-P.** (2018). *Enhancing Detection of SSVEPs for a High-Speed Brain Speller Using Task-Related Component Analysis.* IEEE Transactions on Biomedical Engineering, 65(1), 104–112. DOI : https://doi.org/10.1109/TBME.2017.2694818. (TRCA ; référence citée par le papier support.)

## Jeux de données

19. **Tangermann, M., Müller, K.-R., Aertsen, A., et al.** (2012). *Review of the BCI Competition IV.* Frontiers in Neuroscience, 6, 55. DOI : https://doi.org/10.3389/fnins.2012.00055. (BCI-IV-2a, 4 classes, hasard 25 %.) Données chargées via MOABB : https://github.com/NeuroTechX/moabb.
20. **Morioka, H., Kanemura, A., Morimoto, S., Yoshioka, T., Oba, S., Kawanabe, M., & Ishii, S.** (2014). *Decoding Spatial Attention by Using Cortical Currents Estimated from Electroencephalography with Near-Infrared Spectroscopy Prior Information.* NeuroImage, 90, 128–139. DOI : https://doi.org/10.1016/j.neuroimage.2013.12.035. — *Paradigme d’attention visuo-spatiale du groupe Ishii/ATR, associé au jeu de données ATR NBP utilisé dans ce stage. Les caractéristiques exploitées ici (2 classes, fenêtre d’attention de 8 s, 43 sujets) proviennent de l’usage opérationnel du laboratoire et de l’exploration directe des fichiers ; l’article original n’a pas été relu en détail.*
21. **Obeid, I., & Picone, J.** (2016). *The Temple University Hospital EEG Data Corpus.* Frontiers in Neuroscience, 10, 196. DOI : https://doi.org/10.3389/fnins.2016.00196. (TUEG/TUEV, corpus de pré-entraînement fréquemment utilisé par les modèles de fondation EEG.)

## Modèles de fondation en électrophysiologie et imagerie calcique

22. **Azabou, M., Arora, V., Ganesh, V., Mao, X., Nachimuthu, S., Mendelson, M. J., Richards, B., Perich, M. G., Lajoie, G., & Dyer, E. L.** (2023). *A Unified, Scalable Framework for Neural Population Decoding* (POYO). Advances in Neural Information Processing Systems 36 (NeurIPS 2023). arXiv : https://arxiv.org/abs/2310.16046. Implémentation : `torch_brain` / `brainsets`, https://github.com/neuro-galaxy/torch_brain. — *Lu en PDF.*
23. **Azabou, M., Pan, K. X., Arora, V., Knight, I., Dyer, E. L., & Richards, B.** (2025). *Multi-Session, Multi-Task Neural Decoding from Distinct Cell-Types and Brain Regions.* The Thirteenth International Conference on Learning Representations (ICLR 2025). OpenReview : https://openreview.net/forum?id=IuU0wcO0mo. — *Lu en PDF (fourni par le laboratoire).*
24. **Xu, X., Zhang, Y., Qian, Q., & Zhang, Y.** (2026). *CalM: A Self-Supervised Foundation Model for Population Dynamics in Calcium Imaging Data.* arXiv : https://arxiv.org/abs/2604.04958. — *Lu en PDF. Tokeniseur à quantification vectorielle et transformeur dual-axis autorégressif ; discuté au séminaire du 13 août et au paper reading club du 18 août 2026.*
25. **Xu, X., Zhang, Y., & Zhang, Y.** (2026). *CAPT: A Multi-task Continuous Autoregressive Transformer Enabling Cross-dataset and Cross-species Transfer for Calcium Population Dynamics.* arXiv : https://arxiv.org/abs/2607.23258. — *Lu en PDF. Continuous patch tokenization, objectif autorégressif en MSE, transfert inter-espèces à dorsale gelée.*
26. **Duan, Y., Tahir Chaudhry, H., Ahrens, M. B., Harvey, C. D., Perich, M. G., Deisseroth, K., & Rajan, K.** (2025). *POCO: Scalable Neural Forecasting through Population Conditioning.* Advances in Neural Information Processing Systems 38 (NeurIPS 2025). arXiv : https://arxiv.org/abs/2506.14957. Code : https://github.com/yuvenduan/POCO. — *Présenté au paper reading club du 18 août 2026 ; non lu intégralement.*

## Transfert inter-sujets et prétraitement

27. **He, H., & Wu, D.** (2020). *Transfer Learning for Brain–Computer Interfaces: A Euclidean Space Data Alignment Approach.* IEEE Transactions on Biomedical Engineering, 67(2), 399–410. DOI : https://doi.org/10.1109/TBME.2019.2913914. (Alignement euclidien, piste proposée par Liz Costato le 2 septembre 2026.)
28. **Gramfort, A., Luessi, M., Larson, E., et al.** (2013). *MEG and EEG Data Analysis with MNE-Python.* Frontiers in Neuroscience, 7, 267. DOI : https://doi.org/10.3389/fnins.2013.00267. (Bibliothèque utilisée pour la conversion et le filtrage des données du laboratoire.)

## Documents internes et sources primaires du stage

29. **Journal de bord du stage**, `notes/JOURNAL.md` du dépôt `LeBoogiepop/torch-brain-eeg` (avril → septembre 2026 ; copie de la partie de septembre dans `LeBoogiepop/STEEGFormer`). Source de vérité pour toutes les dates, configurations et valeurs numériques citées dans les chapitres 5 et 6.
30. **Fiche de lecture EEG ↔ imagerie calcique**, `notes/papers/README_meeting_2026-08-13.md`.
31. **Supports de présentation** : séminaire de revue (avril), présentation d’article (mai), *progress talk* du 23 juillet, exposé technique du 19 août, point avec Liz Costato du 9 septembre — répertoire `STEEGFormer/presentations/`.
32. **Code du stage** : dépôt https://github.com/LeBoogiepop/STEEGFormer (branche `shared-context`) — `util/prepare_atr_nbp_spatial_attention.py`, `util/dataset_specs_lab_spatial_attention.yaml`, `scripts/summarize_g2_json_logs.py`, scripts d’orchestration PowerShell et Slurm ; scripts de prétraitement `benchmark/spatial_attention/` (alignement euclidien, laplacien/CSD, rejet d’artefacts — écrits, non encore exécutés au 10 septembre 2026).
