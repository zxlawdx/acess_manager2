# TRAFFIC

`TrafficSample` e `calculate_rate` normalizam contadores. Se o contador novo for menor, a taxa é `None` e `counter_reset=True`; nunca é emitida taxa negativa. A persistência/agregação de 5m/30m/1h/24h permanece pendente.
