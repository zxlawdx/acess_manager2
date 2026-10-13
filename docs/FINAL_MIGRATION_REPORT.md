# Final Migration Report

## Result

This pass restores the high-impact `EG8041X6-10` runtime path and removes several false-negative capability regressions. It **does not declare the whole legacy fully migrated**: broader Huawei/ZTE provider wiring and physical validation remain where the supplied evidence is incomplete.

## Numbers

- Legacy files scanned: **488**
- Python symbols: **3474**
- Device endpoints: **468 unique** (**970 occurrences**)
- Huawei auth flows declared: **5 non-unknown**
- Mechanical protocol/auth pattern families: **7**
- Model identifiers observed: **52**
- Read-like symbols: **483**
- Write-like symbols: **188**
- Parser evidence hits: **3712**
- Fixtures: **45**
- Legacy tests inventoried: **717**
- Next tests now present: **85** (latest execution: **85 passed + 2 subtests**)
- Priority matrix rows at parity status: **10 / 16**
- Priority rows still requiring evidence/physical follow-up: **7**
- Priority rows labelled `UNSUPPORTED` solely from missing evidence: **0**
- X6 feature claims physically validated in inherited registry: **6**
- New live physical validations performed in this sandbox: **0**

## Validation

`pytest -q` passes with **85 tests + 2 subtests**. All modified JavaScript passes `node --check`, and Python code passes `compileall`.

`python manage.py collectstatic --no-tailwind` / `runapp` could not be executed in this sandbox because the pinned Vela dependency is not installed. An attempted `pip install -r requirements.txt` reached the exact pinned Git URL but the sandbox cannot resolve `github.com`. This is recorded as an environment validation gap, not converted into a passing boot claim. The source static tree was manually synchronized into `staticfiles/access_manager/` after JavaScript validation so the packaged frontend is not stale.

## Acceptance-state summary

- EG8041X6-10 auth/transport/device/Wi-Fi/WAN/diagnostics regressions: corrected and regression-tested.
- Client duplicate merge and LAN duplex semantic corruption: corrected and regression-tested.
- Traffic: wired to real counter sources; remains partial when the active device returns no counters.
- DHCP/DNS/optical on X6: migrated reader code exists, but supplied X6 fixture evidence is insufficient; status stays `UNKNOWN` when runtime cannot prove the surface.
- Reboot on X6: writer remains `UNKNOWN` because the legacy supplied here does not prove a production writer/read-back flow.
- ZTE: core ThinkLua migration retained; diagnostics/traffic/capability honesty improved; full legacy workbench parity is not claimed.
- Full CI/desktop boot: unit/regression suite is green; Vela-dependent collectstatic/boot remains unexecuted in this environment.
