# Juniper dependencies and Windows audit

- Existing Paramiko `>=3.4,<4` is reused for SSH. No Telnet.
- Added `ncclient==0.7.0` for NETCONF session/framing/RPC management, instead of implementing a second NETCONF stack or adding PyEZ.
- ncclient depends on Paramiko and lxml. Existing requirements already include cryptography. No separate duplicate SSH stack or executable is downloaded at runtime.
- License metadata: ncclient Apache-2.0, Paramiko LGPL, lxml BSD-family plus bundled libxml2/libxslt notices. No third-party source was copied into the project; retain upstream notices when distributing dependencies.
- Commands verified: `python -m pip install ncclient==0.7.0`; `python -m pip wheel --no-deps ncclient==0.7.0`; Windows x64 CPython 3.12 binary dependency download for Paramiko/lxml/cryptography succeeded.
- Wheels were not installed on Windows here. Actual Windows/Vela execution and any future frozen-bundle hidden-import checks remain required; this repository has no current PyInstaller spec/build workflow to extend.
