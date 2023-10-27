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

### Get Dune address labels

- Run a Dune query to get all the Dune address labels of Farcaster users. Due to Dune API limits, currently the script only gets the labels of the users that have an ENS address.

```
pnpm ts-node ./src/get-fc-dune-labels.ts
```

---

- The file `fc-custody-accounts.csv` is an output of [this](https://dune.com/queries/3147327) Dune query.
