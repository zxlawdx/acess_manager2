# Validation

## Passed

- `python -m compileall -q apps config tests tools`
- JavaScript syntax validation with `node --check` for source and synchronized `staticfiles`
- `pytest -q`: **85 passed, 2 subtests passed**
- `apps/access_manager/static/` was copied into `staticfiles/access_manager/` after the frontend changes so the packaged runtime is not stale.

## Environment-limited

`python manage.py collectstatic --no-tailwind` and `python manage.py runapp` require the pinned Vela framework. Vela is not installed in this sandbox. `pip install -r requirements.txt` attempted to clone the exact pinned Vela commit but the sandbox cannot resolve `github.com`, so Vela-dependent boot validation could not be completed here.

This limitation is not counted as a passing boot test and does not change capability evidence.
