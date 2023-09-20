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

  // Currently the API only returns published releases (not draft) so any
  // drafts or not-found releases will be handled in the catch.
  // (This is still true as of 09/20/23)
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
        core.info(`Release '${releaseTag}' is production ready.`);
        core.setOutput('PRODUCTION_READY', true);
      } else {
        if (draft) loggingFunction(`Release '${releaseTag}' is not production ready, it is marked as a draft.`);
        if (prerelease) loggingFunction(`Release '${releaseTag}' is not production ready, it is marked as a pre-release.`);
        core.setOutput('PRODUCTION_READY', false);
      }
    })
    .catch(() => {
      const errorMessage = `Release '${releaseTag}' is not production ready, it is either a draft release or it was not found.`;
      loggingFunction(errorMessage);
      core.setOutput('PRODUCTION_READY', false);
    });
}

run();
