# Publish GitHub Action

# Publish GitHub Action

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