# `tap-arc` Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.1.0] - 2023-10-17

### Changed

- diffing has been reimplemented to be simpler and optional

### Added

- `--no-diff` option to disable diffing

## [1.0.1] - 2023-09-19

### Changed

- improve tap error handling when "no plan found"
- improve runtime error handling and reporting

## [1.0.0] - 2023-09-13

A large refactor with updated dependencies that targets very similar output of v0.3.0+. Drastically simplified testing.

### Changed

- Ouput formatting and colors are more readable for red-green colorblind folks (like myself!)
- Suites with all passing tests but "bad counts" will now PASS. Override with `--fail-bad-count`. See the FAQ in README.
- ⚠️ `tap-arc` will only exit(1) when test count is 0 if the results plan comment also contains "no tests found" -- unlikely to affect most test reporting pipelines.
- CI for this library on Windows improved.

## [0.4.0] - 2023-08-21

### Fixed

- dep vulnerabilies

## [0.3.6] - 2023-08-18

### Fixed

- dependency vulnerabilities in `json5`

### Changed

- update other dependencies

### Notes

- v1 (a rewrite) has been in progress for a while. shifts in the Node TAP ecosystem are settling.
- snapshot tests have been disabled. this approach, while super accurate, is unmaintainable.

## [0.3.5] - 2022-07-11

### Fixed

- correctly describe failure then expected error message does not match actual thrown error. #29

### Changed

- explicitly pin `strip-ansi` to v6.0.1

## [0.3.4] - 2022-03-30

### Changed

- when total test count is 0, exit with code `1`. #26

## [0.3.3] - 2022-03-25

### Fixed

- correctly display multi-(c)hunk diffs

### Removed

- verbose option no longer affects diff print

## [0.3.2] - 2022-03-24

### Added

- `--verbose` prints full diff as reported by `tcompare`

### Fixed

- actual vs expected colors in equality assertions

## [0.3.1] - 2022-03-24

### Changed

- use `strict` instead of `match` from `tcompare` for more verbose diffs

### Fixed

- correctly handle when shallow equality TAP output cannot be diffed

## [0.3.0] - 2022-03-23

### Fixed

- color corrections #18

### Changed

- `tcompare` for improved failure diffing #2

### Removed

- `--padding` option
- `--indent` option

## [0.2.0] - 2022-03-22

### Changed

- deterministically stringify JSON for diffing, thanks @mixmix

### Added

- `--no-color` option to prevent colorized output with ANSI escape sequences

## [0.1.0] - 2021-11-20

### Added

- migrate and rename from https://www.npmjs.com/package/tap-spek
