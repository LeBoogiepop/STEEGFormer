import pickle
import os
import sys
import collections
import numpy as np

# scripts/ -> neural_networks -> benchmark -> repo root
here = os.path.dirname(os.path.abspath(__file__))
repo = os.path.abspath(os.path.join(here, "..", "..", ".."))
bci_dir = os.path.join(repo, "g2_transfer", "bci_iv2a")
want = sys.argv[1] if len(sys.argv) > 1 else "A01.pkl"
print("bci_dir isdir:", os.path.isdir(bci_dir))
entries = [n for n in os.listdir(bci_dir) if n.lower().endswith(".pkl")]
print("found pkls:", sorted(entries))
match = [n for n in entries if n == want] or [n for n in entries if n.startswith(want.split(".")[0])]
if not match:
    raise SystemExit("no matching pkl for %r" % want)
p = os.path.join(bci_dir, match[0])
print("opening:", match[0])
d = pickle.load(open(p, "rb"))
print("keys:", list(d.keys()))
for k in ["trainX", "trainY", "testX", "testY"]:
    if k in d:
        v = np.asarray(d[k])
        print(k, "shape", v.shape, "dtype", v.dtype)
print("trainY uniques:", collections.Counter(list(np.asarray(d["trainY"]))))
print("testY uniques:", collections.Counter(list(np.asarray(d["testY"]))))
X = np.asarray(d["trainX"]).astype(np.float64)
print("trainX min/max/mean/std: %.4g %.4g %.4g %.4g" % (X.min(), X.max(), X.mean(), X.std()))
print("one sample shape:", np.asarray(d["trainX"])[0].shape)
