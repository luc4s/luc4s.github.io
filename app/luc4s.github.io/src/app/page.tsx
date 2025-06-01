import Post from "./components/post";
import Background from "./components/background";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="w-full lg:w-4xl container">
        <Post title="LUCAS MONNIN" titleClass="title">
          <p className="link">
            <Link href="https://github.com/luc4s" target="_blank">
              GitHub
            </Link>
            &nbsp;|&nbsp;
            <Link
              href="https://www.linkedin.com/in/lucas-m-392045197/"
              target="_blank"
            >
              LinkedIn
            </Link>
          </p>
        </Post>
        <Post
          title="KIND OF DEEP WATERS"
          image="/kindofdeep.png"
          link="https://ldjam.com/events/ludum-dare/57/kind-of-deep-waters"
        >
          Ludum Dare 57, team of 5, made with Godot. Mostly worked on the map
          generation (noise is fun). The game is a 2D vertical scroller where
          you have to go to the bottom of the sea without hitting walls or
          enemies, collecting pearls will let you buy upgrades to make the
          descent easier.
        </Post>
        <Post
          title="DEMONIC FRIDGE AND VEGETABLES FROM HELL"
          image="/demonic_fridge.png"
          link="https://ldjam.com/events/ludum-dare/55/demonic-fridge-and-vegetables-from-hell"
        >
          Ludum Dare 55, team of 2, made with Unity. My first game jam, learned
          a lot, and we managed to submit something playable. The game is about
          filling the (demonic) fridge with various items until you manage to
          summon the final boss.
        </Post>
        <Post title="XirusCAD Cloud" image="/cad.png">
          <p>
            Port XirusCAD (Rhino3D plugin, C++, previously developed by
            Mirrakoi, but discontinued) to a WebApp using WebAssembly, ThreeJS
            and React.
          </p>
          <p>
            The goal was to let users interact with the in-house surfacing
            kernel and offer the basic tooling for CAD modeling.
          </p>
        </Post>
        <Post
          title="Voxel-based factory game prototype"
          image="/voxel_game.png"
          link="https://github.com/luc4s/FractalTerrain"
          linkText="GitHub"
        >
          <p>
            Some playground for a voxel based factory game. Implemented inverse
            kinematics for grabbing objects from the belt, played with noise
            terrain generation and voxels (C++, OpenVDB, libnoise).
          </p>
        </Post>
        <Post
          title="Dictionary app"
          image="/app.jpeg"
          link="https://github.com/luc4s/DictApp"
          linkText="GitHub"
        >
          Custom app developed for specficic needs. It allows adding words and
          their definitions, optionally with a picture, and searching for them.
          Made with ReactNative (Expo), not very good looking but works well.
        </Post>
        <Post>
          <div className="credits">
            <h3>Credits</h3>
            <p>
              <Link href="https://skfb.ly/6Zp6q" target="_blank">
                &quot;Low Poly PS1-Syle Testarossa&quot; by Namahoi
              </Link>
              &nbsp;is licensed under&nbsp;
              <Link
                href="http://creativecommons.org/licenses/by/4.0/"
                target="_blank"
              >
                Creative Commons Attribution
              </Link>
            </p>
          </div>
        </Post>
        <Background />
        <noscript>
          <div className="noscript">
            <div>
              <p>
                This page requires JavaScript to be enabled for the full
                experience.
              </p>
              <p>Please enable JavaScript in your browser settings.</p>
            </div>
          </div>
        </noscript>
      </div>
    </>
  );
}
