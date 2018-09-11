`tsc` that skips typechecking but still fails on syntax errors.

Sometimes you want to use TypeScript, but you're migrating a legacy project.  So you have type errors.  Maybe not everyone on your team
is an expert at type annotations yet.  Or maybe you renamed some old `.js` files to `.ts` so you can add annotations slowly over time, and you don't want to spam `any` all over the place.

You want to `tsc` your code, and you want it to fail on syntax errors. (`const foo = = this is wrong;`)
But you *don't* want it to fail on semantic errors.

This is a quick, 1 hour hack to write a `tsc` alternative that compiles your code just like `tsc` but skips typechecking.

# Usage

Install this module alongside the version of "typescript" you want to use.

```
npm install typescript-transpile-only
npm install typescript
```

Run `tsc-transpile-only` instead of `tsc`.  For example:

```shell
tsc-transpile-only --project .
```

# Caveats

No tests; use it at your own risk.  Or look at the code; it's tiny.

Does not support `--build`, `--help`, `--version`, or `--all` flags.  
The only one that makes sense in this context is `--build`, but you can easily workaround this by invoking `tsc-transpile-only` multiple times.

Exit codes are valid but don't exactly match `tsc`'s behavior.  `tsc` uses different non-zero error codes depending on the reason for failure.  We use exit code 1 for all failures; 0 for success. (no syntax errors)

# Bugs / Questions / Suggestions

Please [open an issue](https://github.com/cspotcode/typescript-transpile-only/issues) on Github.
