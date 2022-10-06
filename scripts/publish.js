import npmPublish from "@jsdevtools/npm-publish";
import { execSync } from "child_process";
import path from "path";

const message = process.argv[2].toLowerCase();
const username = process.argv[3];
const token = process.argv[4];

const versionsPrefix = {
  patch: ["fix", "docs", "refactor", "style"],
  minor: ["feat", "revert"],
  major: ["perf", "breaking change"],
};

let version = null;
for (const key in versionsPrefix) {
  for (const prefix of versionsPrefix[key]) {
    if (message.startsWith(prefix)) {
      version = key;
    }
  }
}

if (!version) {
  console.log("No version bump needed");
  process.exit(0);
}

execSync(`git config --global user.name '${username}'`, { cwd: process.cwd() });

execSync(
  `git config --global user.email '${username}@users.noreply.github.com'`,
  { cwd: process.cwd() }
);

execSync(`npm version ${version}`, { cwd: process.cwd() });

execSync(`git push`, { cwd: process.cwd() });

execSync(`npm publish --access public`, { cwd: process.cwd() });

npmPublish({
  package: path.resolve(process.cwd(), "package.json"),
  token,
});
