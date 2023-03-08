# is-release-production-ready

An action that retrieves a release by tag and determines if it is a Published release.  The action considers releases to be Production ready when the API returns false for the release's `draft` and `prerelease` fields.

The action can be set up to fail if a prerelease is detected by using the `fail-for-prerelease` argument.  Alternatively, the action output can be used to make further decisions in the workflow.

## Index

- [Inputs](#inputs)
- [Outputs](#outputs)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
  - [Recompiling](#recompiling)
  - [Incrementing the Version](#incrementing-the-version)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Inputs
| Parameter             | Is Required | Default | Description                                                                                                                 |
| --------------------- | ----------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `token`               | true        | N/A     | A token with permission to retrieve a repository's release information.  Generally `${{ secrets.GITHUB_TOKEN }}`            |
| `release-tag`         | true        | N/A     | The tag of the release that should be checked.                                                                              |
| `fail-for-prerelease` | false       | `true`  | Flag indicating whether the action should fail if it detects a prerelease or cannot find a release.  Accepts: `true\|false` |

## Outputs
| Output             | Description                                              |
| ------------------ | -------------------------------------------------------- |
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
      - uses: im-open/is-release-production-ready@v1.1.2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-tag: ${{ github.event.inputs.release-tag }}
          fail-for-prerelease: true
  
  deploy:
    ...
```

## Contributing

When creating new PRs please ensure:

1. For major or minor changes, at least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version](#incrementing-the-version).
1. The action code does not contain sensitive information.

When a pull request is created and there are changes to code-specific files and folders, the build workflow will run and it will recompile the action and push a commit to the branch if the PR author has not done so. The usage examples in the README.md will also be updated with the next version if they have not been updated manually. The following files and folders contain action code and will trigger the automatic updates:

- action.yml
- package.json
- package-lock.json
- src/\*\*
- dist/\*\*

There may be some instances where the bot does not have permission to push changes back to the branch though so these steps should be done manually for those branches. See [Recompiling Manually](#recompiling-manually) and [Incrementing the Version](#incrementing-the-version) for more details.

### Recompiling Manually

If changes are made to the action's code in this repository, or its dependencies, the action can be re-compiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build

# Bundle the code (if dependencies are already installed)
npm run bundle
```

These commands utilize [esbuild](https://esbuild.github.io/getting-started/#bundling-for-node) to bundle the action and
its dependencies into a single file located in the `dist` folder.

### Incrementing the Version

Both the build and PR merge workflows will use the strategies below to determine what the next version will be.  If the build workflow was not able to automatically update the README.md action examples with the next version, the README.md should be updated manually as part of the PR using that calculated version.

This action uses [git-version-lite] to examine commit messages to determine whether to perform a major, minor or patch increment on merge.  The following table provides the fragment that should be included in a commit message to active different increment strategies.
| Increment Type | Commit Message Fragment                     |
| -------------- | ------------------------------------------- |
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/master/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2021, Extend Health, LLC. Code released under the [MIT license](LICENSE).

[git-version-lite]: https://github.com/im-open/git-version-lite
