---
name: sanity-setup
description: One-time Sanity CMS setup commands for this project (initial project/dataset creation, and adding a CORS origin after deploying). Use when connecting this repo to a Sanity project for the first time, or when /studio fails in production due to a missing CORS origin.
---

```bash
npx sanity login                                     # one-time browser auth
npx sanity init                                      # create/link a project, dataset "production"
npx sanity cors add https://<domain> --credentials   # after deploying, so /studio works in prod
```

See CLAUDE.md's "Sanity" section for how the schema and `isSanityConfigured` fallback behave once this is done.
