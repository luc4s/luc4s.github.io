import Post from "./components/post";
import Background from "./components/background";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container">
      <Post>
        <h1 className="title">LUCAS MONNIN</h1>
        <p>Some of my realizations...</p>
      </Post>
      <Post>
        <h1>KIND OF DEEP WATERS</h1>
        <Image
          src="/kindofdeep.png"
          alt="Kind of Deep Waters"
          width={800}
          height={800}
        />
        <p>
          Submission for Ludum Dare 57, made with Godot, mostly worked on the
          map generation (I like noise) as I am a terrible artist. The game is a
          2D vertical scroller where you have to go to the bottom of the sea
          without hitting walls or enemies.
        </p>
      </Post>
      <Post>
        <h1>DEMONIC FRIDGE AND VEGETABLES FROM HELL</h1>
        <Image
          src="/demonic_fridge.png"
          alt="Kind of Deep Waters"
          width={800}
          height={800}
        />
        <p>
          Submission for Ludum Dare 55, made with Unity. Not so bad for a first
          jam entry, wish we took to time to add SFX. Game is about filling the
          fridge with various items until you manage to spawn the final boss.
        </p>
      </Post>
      <Post>
        <h1>Streamline Field Viewer</h1>
        <p>E-Field streamlines visualizer, made with C++ and Vulkan.</p>
      </Post>
      <Post>
        <h1>XirusCAD Cloud</h1>
        <Image src="/cad.png" alt="XirusCadCloud" width={800} height={800} />
        <p>
          Port XirusCAD (Rhino3D plugin developed by Mirrakoi) to a WebApp using
          WebAssembly, ThreeJS and React.
        </p>
      </Post>
      <Post>
        <h1>Voxel-based factory game prototype</h1>
        <Image src="/voxel_game.png" alt="VoxelGame" width={800} height={800} />
        <p>
          Some playground for a voxel based factory game. Implemented inverse
          kinematics for grabbing objects from the belt, played with noise
          terrain generation with voxels (OpenVDB).
        </p>
      </Post>
      <Post>
        <h1>Dictionary app</h1>
        <Image src="/app.jpeg" alt="DictApp" width={200} height={200} />
        <p>
          Custom app developed for a person who had specficic needs. It allows
          adding words and their definitions, optionally with a picture, and
          searching for them. Made with ReactNative (Expo), not very good
          looking but works well.
        </p>
      </Post>
      <Background />
    </div>
  );
}
