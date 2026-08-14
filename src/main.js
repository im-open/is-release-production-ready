import { getInput, getBooleanInput, setFailed, info, setOutput } from '@actions/core';
import { getOctokit, context } from '@actions/github';

// When used, this requiredArgOptions will cause the action to error if a value has not been provided.
const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

const token = getInput('token', requiredArgOptions);
const releaseTag = getInput('release-tag', requiredArgOptions);
const failForPrerelease = getBooleanInput('fail-for-prerelease');

const octokit = getOctokit(token);
const loggingFunction = failForPrerelease ? setFailed : info;

async function run() {
  info('Checking production readiness...');

  // Currently the API only returns published releases (not draft) so any
  // drafts or not-found releases will be handled in the catch.
  // (This is still true as of 09/20/23)
  await octokit.rest.repos
    .getReleaseByTag({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag: releaseTag
    })
    .then(response => {
      const draft = response.data.draft;
      const prerelease = response.data.prerelease;
      if (!draft && !prerelease) {
        info(`Release '${releaseTag}' is production ready.`);
        setOutput('PRODUCTION_READY', true);
      } else {
        if (draft) loggingFunction(`Release '${releaseTag}' is not production ready, it is marked as a draft.`);
        if (prerelease) loggingFunction(`Release '${releaseTag}' is not production ready, it is marked as a pre-release.`);
        setOutput('PRODUCTION_READY', false);
      }
    })
    .catch(() => {
      const errorMessage = `Release '${releaseTag}' is not production ready, it is either a draft release or it was not found.`;
      loggingFunction(errorMessage);
      setOutput('PRODUCTION_READY', false);
    });
}

run();
