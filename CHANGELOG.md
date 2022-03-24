# `tap-arc` Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

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
