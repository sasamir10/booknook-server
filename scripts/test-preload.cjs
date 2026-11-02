// tsx uses os.userInfo() only to name a temporary directory. The hosted Windows
// runner does not expose that OS lookup, so supply a stable local-only suffix.
if (typeof process.geteuid !== "function") process.geteuid = () => 0;
