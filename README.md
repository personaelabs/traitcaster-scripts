# Traitcaster scripts

### Find traits

- Find all traits of all the Farcaster accounts.
- The script
  will read the mapping in `csv/` and output the Farcaster accounts that satisfy the traits.

```
pnpm ts-node ./src/find-traits.ts
```

### Get Farcaster user profiles

- You'll need to have a Farcaster hub running locally to execute this script.

```
pnpm ts-node ./src/get-fc-users.ts
```

---

- The file `fc-custody-accounts.csv` is an output of [this](https://dune.com/queries/3147327) Dune query.
