const core = require('@actions/core');
const github = require('@actions/github');

// When used, this requiredArgOptions will cause the action to error if a value has not been provided.
const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

const token = core.getInput('token', requiredArgOptions);
const releaseTag = core.getInput('release-tag', requiredArgOptions);
const failForPrerelease = core.getBooleanInput('fail-for-prerelease');

const octokit = github.getOctokit(token);
const loggingFunction = failForPrerelease ? core.setFailed : core.info;

async function run() {
  core.info('Checking production readiness...');

  // Currently the API only returns published releases (not draft) so the error
  // condition will be triggered for drafts and when releases are not found.
  await octokit.rest.repos
    .getReleaseByTag({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tag: releaseTag
    })
    .then(response => {
      const draft = response.data.draft;
      const prerelease = response.data.prerelease;

      if (!draft && !prerelease) {
        core.info('The release is production ready.');
        core.setOutput('PRODUCTION_READY', true);
      } else {
        loggingFunction('The release is not production ready, it is marked as a pre-release');
        core.setOutput('PRODUCTION_READY', false);
      }
    })
    .catch(() => {
      loggingFunction(
        `The release '${releaseTag}' is not production ready.  It was either not found or it was a draft release.`
      );
      core.setOutput('PRODUCTION_READY', false);
    });
}

run();
