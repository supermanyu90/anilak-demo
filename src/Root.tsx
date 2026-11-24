import { Composition } from "remotion";
import { Demo } from "./Demo";
import { FPS, totalFrames } from "./content";

export const RemotionRoot: React.FC = () => (
  <Composition id="AnilakDemo" component={Demo} durationInFrames={totalFrames()} fps={FPS} width={1920} height={1080} />
);
