Modelos YOLOX de ARS/vigias (EPP y armas) — Apache-2.0.

Son privados (viven en el server vigias), por eso NO se descargan en el
postinstall ni se commitean. Copialos a mano acá:

  public/models/vigias/epp_detector.onnx       (EPP · FP32 ~97MB, o el int8 ~24MB)
  public/models/vigias/weapon_detector.onnx    (armas · FP32 ~97MB, o int8)

Desde una máquina que alcance el server (Tailscale arriba / misma LAN):

  rsync -avhP \
    vigias_news@100.99.251.64:/opt/vigias/models/epp/epp_detector.onnx \
    vigias_news@100.99.251.64:/opt/vigias/models/weapons/weapon_detector.onnx \
    public/models/vigias/

Para usar el int8 (más liviano), renombralo a epp_detector.onnx o cambiá la ruta
en src/lib/yolox-detector.ts (EPP_CONFIG.modelUrl / WEAPONS_CONFIG.modelUrl).
