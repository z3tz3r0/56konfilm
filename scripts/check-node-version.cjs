const requiredMajor = 24;
const requiredMinor = 14;
const requiredPatch = 1;

if (process.env.SKIP_NODE_CHECK === '1') {
  process.exit(0);
}

const [major, minor, patch] = process.versions.node
  .split('.')
  .map((value) => Number.parseInt(value, 10));

const versionOk =
  major === requiredMajor &&
  (minor > requiredMinor ||
    (minor === requiredMinor && patch >= requiredPatch));

if (!versionOk) {
  console.error(
    [
      '[node-version] Unsupported Node.js version:',
      `detected v${process.versions.node},`,
      `required v${requiredMajor}.${requiredMinor}.${requiredPatch}+`,
      '(see .nvmrc).',
    ].join(' ')
  );
  process.exit(1);
}
