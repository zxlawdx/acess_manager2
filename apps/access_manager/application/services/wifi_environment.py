"""Channel strategy ported from the canonical Access Manager service.

Public reports retain only RF measurements, not neighboring SSID/BSSID.
"""
from typing import Any
import math

def _number(value):
    try:
        result=float(value)
        return result if math.isfinite(result) else None
    except (ValueError,TypeError):return None

class ChannelAnalyzer:
    """
    Strategy de seleção de canal.

    RSSI forte pesa mais que quantidade bruta de SSIDs. Em 2.4 GHz também
    aplicamos peso aos canais sobrepostos; em 5 GHz o peso principal fica no
    mesmo canal. Se o cenário estiver ruim/insuficiente, a recomendação é Auto.
    """

    def analyze(
        self, *, band: str, radio: dict[str, Any],
        neighbors: list[dict[str, Any]], available_channels: Any,
        scan_confirmed: bool = True,
    ) -> dict[str, Any]:
        # Never propose a firmware write based on fallback/guessed channels.
        # ZTE.available_channels returns LISTS of {banda, largura, pais,
        # canais: [...]} rather than individual channels.
        candidates = self._candidates(band, available_channels)
        current = _number(radio.get("canal", radio.get("channel")))
        raw_auto = radio.get("canal_automatico",
                             radio.get("auto_channel"))
        auto = None if raw_auto is None else raw_auto is True or str(raw_auto).strip().lower() in {
            "1", "true", "yes", "on",
        }
        scores = {
            channel: round(self._score(band, channel, neighbors), 2)
            for channel in candidates
        } if scan_confirmed and neighbors else {}
        best = min(scores, key=scores.get) if scores else None
        # An existing manual channel may be 3/4/8 rather than one of the
        # non-overlapping candidate channels. Score its observed interference
        # separately; never add it to the set of recommended destinations.
        current_score = (
            self._score(band, int(current), neighbors)
            if current is not None and scan_confirmed and neighbors
            and candidates else None
        )
        best_score = scores.get(best) if best is not None else None
        recommendation: dict[str, Any] = {}
        if (
            scan_confirmed and neighbors and auto is False
            and current_score is not None and best is not None
            and int(current) != best and
            current_score - float(best_score or 0) >= 15
        ):
            recommendation = {
                "title": f"Selecionar canal {best} em {band}",
                "message": (
                    f"Uma leitura de redes próximas indica menor "
                    f"sobreposição no canal {best} em {band}. "
                    "Valide a estabilidade após a alteração."
                ),
                "action": {
                    "type": "wifi_channel", "band": band, "channel": best,
                },
                "confidence": "moderate",  # one scan is not proof over time
            }
        return {
            "band": band, "current_channel": (
                int(current) if current is not None else None
            ),
            "auto_channel": auto,
            "candidate_channels_confirmed": bool(candidates),
            "neighbor_scan_confirmed": scan_confirmed,
            "current_score": current_score, "best_channel": best,
            "best_score": best_score, "scores": scores,
            "neighbor_count": len(neighbors), "recommendation": recommendation,
        }

    @staticmethod
    def _candidates(band: str, available_channels: Any) -> list[int]:
        # Do not invent defaults (especially DFS/region-specific 5 GHz
        # channels) when the firmware channel table is unavailable.
        entries = available_channels if isinstance(available_channels, list) else [
            available_channels
        ]
        parsed = set()
        for row in entries:
            values = row
            if isinstance(row, dict):
                row_band = row.get("banda") or row.get("band")
                if row_band and str(row_band).lower() != band.lower():
                    continue
                values = next((
                    row[key] for key in (
                        "canais", "channels", "available_channels", "values"
                    ) if isinstance(row.get(key), list)
                ), [])
            if not isinstance(values, list):
                continue
            for item in values:
                if isinstance(item, dict):
                    item = item.get("channel", item.get("value"))
                value = _number(item)
                if value is None or not float(value).is_integer():
                    continue
                channel = int(value)
                # In Brazil 2.4 GHz may expose 12/13 but 1/6/11 are
                # nonoverlapping 20 MHz starting points, not a universal rule.
                if "2.4" in band and channel not in {1, 6, 11}:
                    continue
                if "2.4" not in band and not 32 <= channel <= 177:
                    continue
                parsed.add(channel)
        return sorted(parsed)

    @staticmethod
    def _signal_weight(
        value: Any,
    ) -> float:
        signal = _number(
            value
        )

        if signal is None:
            return 12.0

        if signal <= 0:
            return max(
                1.0,
                min(
                    100.0,
                    100.0 + signal,
                ),
            )

        return max(
            1.0,
            min(
                100.0,
                signal,
            ),
        )

    def _score(
        self,
        band: str,
        candidate: int,
        neighbors: list[dict[str, Any]],
    ) -> float:
        is_24 = "2.4" in str(
            band
        )

        score = 0.0

        for network in neighbors:
            channel = _number(
                network.get("channel")
            )

            if channel is None:
                continue

            distance = abs(
                candidate
                - int(channel)
            )

            if is_24:
                overlap = max(
                    0.0,
                    1.0 - distance / 5.0,
                )
            else:
                overlap = (
                    1.0
                    if distance == 0
                    else 0.18
                    if distance <= 4
                    else 0.0
                )

            strength = self._signal_weight(
                network.get("signal")
            )

            score += (
                strength
                * overlap
            )

            noise = _number(
                network.get("noise")
            )

            if (
                noise is not None
                and noise > -75
            ):
                score += (
                    min(
                        20.0,
                        noise + 95.0,
                    )
                    * overlap
                )

        return score


def collect_environment(queries, radios):
    output=[]
    for radio in radios:
        band=radio.get('band') or radio.get('banda')
        width=radio.get('bandwidth') or radio.get('largura')
        country=radio.get('country') or radio.get('pais')
        try:channels=queries.wifi_channels(band=band,bandwidth=width,country=country)
        except Exception:channels=radio.get('available_channels',[])
        try:scan=queries.wifi_neighbor_scan(band)
        except Exception:scan={'available':False,'networks':[]}
        confirmed=scan.get('available') is True
        neighbors=[{key:r.get(key) for key in ('channel','signal','noise')} for r in scan.get('networks',[]) if isinstance(r,dict)] if confirmed else []
        analysis=ChannelAnalyzer().analyze(band=str(band or ''),radio=radio,neighbors=neighbors,available_channels=channels,scan_confirmed=confirmed)
        output.append({'band':band,'available_channels':channels,'neighbor_scan':{'available':confirmed,'networks':neighbors},
            'channel_analysis':analysis,'message':None if confirmed else 'Varredura de interferência não disponível neste firmware.'})
    return output
