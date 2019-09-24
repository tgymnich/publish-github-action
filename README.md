# Publish GitHub Action
![](https://img.shields.io/github/v/release/tg908/publish-github-action?style=flat-square)

This action creates a release branch for your GitHub Actions which can then be tagged and released. The release version can be  defined in `package.json` .

# Example Workflow

```
name: "Publish GitHub Action"
on:
  push:
    branches:    
      - master

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: TG908/publish-github-action@v1
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
```
