const requiredMajor = 24;
const requiredMinor = 5;
const requiredPatch = 0;

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
  // eslint-disable-next-line no-console
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
