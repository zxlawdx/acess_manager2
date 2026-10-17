# Build notes

Access Manager 2 uses the pinned Vela 0.2.2 commit from `requirements.txt` as its distribution abstraction.

Primary path:

```text
python manage.py doctor --gui qt6
python manage.py buildapp --dry-run
python manage.py buildapp --gui qt6 --installer
<FROZEN_EXECUTABLE> --self-test
```

No custom PyInstaller spec is introduced by this patch. If a native runner proves that Vela misses a dynamic module/resource, document the concrete missing path/import here before adding `makespec`/`--spec-path`. The legacy `build.bat` remains evidence for dynamic imports, not a command to copy every dependency blindly.

User profiles, credentials, history and caches stay under the runtime data directory and are not copied into the frozen bundle.
