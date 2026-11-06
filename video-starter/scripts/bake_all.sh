#!/bin/sh
# Retarget the Universal Animation Library clips onto each character rig. Output is generated, so it stays out of git.
set -e
cd "$(dirname "$0")/.."
mkdir -p public/models/anims
for c in public/models/chars/*.glb; do
  n=$(basename "$c" .glb)
  [ -f "public/models/anims/$n.json" ] && continue
  node scripts/bake_ual.mjs public/models/src/UAL1_Standard.glb "$c" "public/models/anims/$n.json" \
    Idle_Loop Idle_Talking_Loop Walk_Loop Walk_Formal_Loop Jog_Fwd_Loop Sprint_Loop Sitting_Idle_Loop Sitting_Talking_Loop \
    Sitting_Enter Driving_Loop Fixing_Kneeling Crouch_Idle_Loop Hit_Chest Hit_Head Interact Dance_Loop A_TPose >/dev/null
  echo "baked $n"
done
