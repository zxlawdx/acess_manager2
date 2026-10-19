export const wifiStandard=r=>r.wifi_standard?`${r.wifi_generation?'Wi-Fi '+r.wifi_generation+' · ':''}${r.wifi_standard}`:'Não informado';
