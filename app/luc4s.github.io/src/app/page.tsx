import Post from "./components/post";
import Background from "./components/background";

export default function Home() {
  return (
    <div className="container">
      <Post title="LUCAS MONNIN" titleClass="title"></Post>
      <Post
        title="KIND OF DEEP WATERS"
        image="/kindofdeep.png"
        link="https://7uc4s.itch.io/kind-of-deep-waters"
      >
        Submission for Ludum Dare 57, made with Godot, mostly worked on the map
        generation (noise is fun). The game is a 2D vertical scroller where you
        have to go to the bottom of the sea without hitting walls or enemies.
      </Post>
      <Post
        title="DEMONIC FRIDGE AND VEGETABLES FROM HELL"
        image="/demonic_fridge.png"
        link="https://7uc4s.itch.io/kind-of-deep-waters"
      >
        Submission for Ludum Dare 55, made with Unity. Not so bad for a first
        jam entry, wish we took to time to add SFX. Game is about filling the
        fridge with various items until you manage to spawn the final boss.
      </Post>
      <Post title="XirusCAD Cloud" image="/cad.png">
        Port XirusCAD (Rhino3D plugin developed by Mirrakoi) to a WebApp using
        WebAssembly, ThreeJS and React.
      </Post>
      <Post title="Voxel-based factory game prototype" image="/voxel_game.png">
        Some playground for a voxel based factory game. Implemented inverse
        kinematics for grabbing objects from the belt, played with noise terrain
        generation and voxels (OpenVDB).
      </Post>
      <Post title="Dictionary app" image="/app.jpeg">
        Custom app developed for a person who had specficic needs. It allows
        adding words and their definitions, optionally with a picture, and
        searching for them. Made with ReactNative (Expo), not very good looking
        but works well.
      </Post>
      <Background />
    </div>
  );
}
