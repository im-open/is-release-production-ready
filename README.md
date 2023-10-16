# is-release-production-ready

An action that retrieves a release by tag and determines if it is a Published release.  The action considers releases to be Production ready when the API returns false for the release's `draft` and `prerelease` fields.

The action can be set up to fail if a prerelease is detected by using the `fail-for-prerelease` argument.  Alternatively, the action output can be used to make further decisions in the workflow.

## Index <!-- omit in toc -->

- [is-release-production-ready](#is-release-production-ready)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Usage Examples](#usage-examples)
  - [Contributing](#contributing)
    - [Incrementing the Version](#incrementing-the-version)
    - [Source Code Changes](#source-code-changes)
    - [Recompiling Manually](#recompiling-manually)
    - [Updating the README.md](#updating-the-readmemd)
    - [Tests](#tests)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)

## Inputs

| Parameter             | Is Required | Default | Description                                                                                                                 |
|-----------------------|-------------|---------|-----------------------------------------------------------------------------------------------------------------------------|
| `token`               | true        | N/A     | A token with permission to retrieve a repository's release information.  Generally `${{ secrets.GITHUB_TOKEN }}`            |
| `release-tag`         | true        | N/A     | The tag of the release that should be checked.                                                                              |
| `fail-for-prerelease` | false       | `true`  | Flag indicating whether the action should fail if it detects a prerelease or cannot find a release.  Accepts: `true\|false` |

## Outputs

| Output             | Description                                              |
|--------------------|----------------------------------------------------------|
| `PRODUCTION_READY` | Flag indicating whether the release is production ready. |

## Usage Examples

```yml
on:
  workflow_dispatch:
    inputs:
      release-tag:
        description: 'The tag of the release that will be deployed.'

jobs:
  prepare-for-deploy:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v3

      # If this action determines the release is not production ready
      # it will fail and the next job, deploy, will not happen.
      
      # You may also reference just the major or major.minor version
      - uses: im-open/is-release-production-ready@v1.1.4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-tag: ${{ github.event.inputs.release-tag }}
          fail-for-prerelease: true
  
  deploy:
    ...
```

## Contributing

When creating PRs, please review the following guidelines:

- [ ] The action code does not contain sensitive information.
- [ ] At least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version] for major and minor increments.
- [ ] The action has been recompiled.  See [Recompiling Manually] for details.
- [ ] The README.md has been updated with the latest version of the action.  See [Updating the README.md] for details.
- [ ] Any tests in the [build-and-review-pr] workflow are passing

### Incrementing the Version

This repo uses [git-version-lite] in its workflows to examine commit messages to determine whether to perform a major, minor or patch increment on merge if [source code] changes have been made.  The following table provides the fragment that should be included in a commit message to active different increment strategies.

| Increment Type | Commit Message Fragment                     |
|----------------|---------------------------------------------|
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

### Source Code Changes

The files and directories that are considered source code are listed in the `files-with-code` and `dirs-with-code` arguments in both the [build-and-review-pr] and [increment-version-on-merge] workflows.  

If a PR contains source code changes, the README.md should be updated with the latest action version and the action should be recompiled.  The [build-and-review-pr] workflow will ensure these steps are performed when they are required.  The workflow will provide instructions for completing these steps if the PR Author does not initially complete them.

If a PR consists solely of non-source code changes like changes to the `README.md` or workflows under `./.github/workflows`, version updates and recompiles do not need to be performed.

### Recompiling Manually

This command utilizes [esbuild] to bundle the action and its dependencies into a single file located in the `dist` folder.  If changes are made to the action's [source code], the action must be recompiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build
```

### Updating the README.md

If changes are made to the action's [source code], the [usage examples] section of this file should be updated with the next version of the action.  Each instance of this action should be updated.  This helps users know what the latest tag is without having to navigate to the Tags page of the repository.  See [Incrementing the Version] for details on how to determine what the next version will be or consult the first workflow run for the PR which will also calculate the next version.

### Tests

The build and review PR workflow includes tests which are linked to a status check. That status check needs to succeed before a PR is merged to the default branch.  The tests do not need special permissions, so they should succeed whether they come from a branch or a fork.  

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2023, Extend Health, LLC. Code released under the [MIT license](LICENSE).

<!-- Links -->
[Incrementing the Version]: #incrementing-the-version
[Recompiling Manually]: #recompiling-manually
[Updating the README.md]: #updating-the-readmemd
[source code]: #source-code-changes
[usage examples]: #usage-examples
[build-and-review-pr]: ./.github/workflows/build-and-review-pr.yml
[increment-version-on-merge]: ./.github/workflows/increment-version-on-merge.yml
[esbuild]: https://esbuild.github.io/getting-started/#bundling-for-node
[git-version-lite]: https://github.com/im-open/git-version-lite
