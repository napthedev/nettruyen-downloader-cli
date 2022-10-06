/** @type {import("semantic-release").Options} */
module.exports = {
  branches: [
    { name: "master" },
    { name: "pre/rc", channel: "pre/rc", prerelease: "rc" },
    { name: "beta", channel: "beta", prerelease: true },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github",
  ],
};
