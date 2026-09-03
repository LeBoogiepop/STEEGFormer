"""Trial-level Euclidean Alignment (He & Wu, 2020) for cross-subject EEG transfer.

Fits on training trials only (inductive, no test leakage), then whitens test trials
with the same reference inverse-square-root covariance.
"""

from __future__ import annotations

import numpy as np
from pyriemann.estimation import Covariances
from pyriemann.utils.base import invsqrtm
from sklearn.base import BaseEstimator, TransformerMixin


class EuclideanAlignment(BaseEstimator, TransformerMixin):
    """Align trials to a reference covariance (Euclidean mean of trial covariances)."""

    def __init__(self, estimator: str = "lwf"):
        self.estimator = estimator

    def fit(self, X, y=None):
        X = np.asarray(X, dtype=np.float64)
        if X.ndim != 3:
            raise ValueError(f"Expected (n_trials, n_channels, n_times), got {X.shape}")
        covs = Covariances(estimator=self.estimator).fit_transform(X)
        ref = np.mean(covs, axis=0)
        self.inv_sqrt_ref_ = invsqrtm(ref)
        return self

    def transform(self, X):
        from sklearn.utils.validation import check_is_fitted

        check_is_fitted(self, "inv_sqrt_ref_")
        X = np.asarray(X, dtype=np.float64)
        return np.einsum("ij,njk->nik", self.inv_sqrt_ref_, X)
