import Post from "./components/post";

export default function Home() {
  return (
    <div className="container">
      <Post>
        <h1 className="title">
          <div>LUCAS MONNIN</div>
        </h1>
        <p>Some of my realizations</p>
      </Post>
      <Post>
        <h1>KIND OF DEEP WATERS</h1>
        <p>
          Submission for Ludum Dare 57, made with Godot, mostly worked on the
          map generation (I like noise) as I am a terrible artist. Game is a 2D
          scroller where you have to go to the bottom of the sea without hitting
          walls or enemies. Be prepared, it's hard!
        </p>
      </Post>
      <Post>
        <h1>DEMONIC FRIDGE AND VEGETABLES FROM HELL</h1>
        <p>
          Submission for Ludum Dare 55, made with Unity. Not so bad for a first
          jam entry, wish we took to time to add SFX. Game is about filling the
          fridge with various items until you manage to spawn the final boss.
        </p>
      </Post>
      <Post>
        <h1>Streamline Field View</h1>
        <p>
          E-Field streamlines visualizer, made with C++ and Vulkan. Made for
          demo purposes.
        </p>
      </Post>
      <Post>
        <h1>XirusCAD Cloud</h1>
        <p>
          Port XirusCAD (Rhino3D plugin developed by Mirrakoi) to a WebApp using
          WebAssembly, ThreeJS and React.
        </p>
      </Post>
      <Post>
        <h1>Voxel-based factory prototype</h1>
        <p>
          Some playground for a voxel based factory game. Implemented inverse
          kinematics for grabbing objects from the belt, played with noise
          terrain generation with voxels (OpenVDB).
        </p>
      </Post>
      <Post>
        <h1>Dictionary app</h1>
        <p>
          Custom app developed for a person who had specficic needs. It allows
          adding words and their definitions, optionally with a picture, and
          searching for them. Made with ReactNative (Expo), not very good
          looking but works well.
        </p>
      </Post>
    </div>
  );
}
