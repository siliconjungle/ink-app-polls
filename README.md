# Polls

Create shared polls, vote once per Ink account, inspect live results and export CSV.

## Install

Requires a running [Ink OS](https://github.com/siliconjungle/ink-os-platform) instance and its `ink-os` CLI. Use Node.js 24 or later for development.

```sh
git clone https://github.com/siliconjungle/ink-app-polls.git
cd ink-app-polls
npm test
npm run build
# Select your Ink instance using its CLI connection profile.
ink-os deploy .
```

The CLI deploys committed source from your checkout. Commit any edits before deploying them. No credentials or personal instance configuration belong in this repository.

## Behaviour and limits

Polls are shared workspace records, not secret ballots. Questions allow 2–4 choices and durations from five minutes to seven days. Authors can end their polls early.

## License

MIT for app code. Bundled third-party components retain their own licenses and notices.
