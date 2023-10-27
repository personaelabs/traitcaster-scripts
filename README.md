# Traitcaster scripts

## Find traits

- Find all traits of all the Farcaster accounts.
- The mappings trait $\to$ satisfying addresses are stored in `csv/`. The script
  will read the mapping and output the Farcaster accounts that satisfy the traits.

```
pnpm ts-node ./src/find-traits.ts
```

## Get all ENS names of all existing Farcaster accounts

- Find all ENS names of all the Farcaster accounts.
- You'll need to have a Farcaster hub running locally to run this script.

```
pnpm ts-node ./src/get-fc-ens.ts
```

- The file `fc-custody-accounts.csv` is a result of [this](https://dune.com/queries/3147327) Dune query.
