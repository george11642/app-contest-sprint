import { Config } from "@remotion/cli/config";

// ANGLE is required for the 3D scenes in headless mode. Do not remove it.
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
