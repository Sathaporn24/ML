import React, { useRef, useState, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import "./App.css"; // Import CSS file

const App = () => {
  const URL = "model/";
  const webcamRef = useRef(null);
  const labelContainerRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [model, setModel] = useState(null);
  const [maxPredictions, setMaxPredictions] = useState(0);

  useEffect(() => {
    const loadModel = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
      setMaxPredictions(loadedModel.getTotalClasses());
    };

    loadModel();
  }, []);

  const initWebcam = async () => {
    if (model) {
      const flip = true; // Flip webcam for mirror effect
      const webcam = new tmImage.Webcam(1176, 664, flip);
      await webcam.setup(); // Request webcam access
      await webcam.play();
      webcamRef.current = webcam;

      // Append webcam canvas to the container
      if (webcam.canvas) {
        document.getElementById("webcam-container").appendChild(webcam.canvas);
      }

      window.requestAnimationFrame(() => loop(webcam));
    }
  };

  const loop = async (webcam) => {
    if (webcam) {
      webcam.update(); // Update webcam frame
      await predict(webcam);
      window.requestAnimationFrame(() => loop(webcam));
    }
  };

  const predict = async (webcam) => {
    if (model && webcam) {
      const prediction = await model.predict(webcam.canvas);
      setPredictions(prediction);
    }
  };

  return (
    <div className="App">
      <h1>Fire & Smoke 2024</h1>
      <button onClick={initWebcam}>Start</button>
      <div id="webcam-container" className="webcam-container" ref={webcamRef} />
      <div id="label-container" className="label-container" ref={labelContainerRef}>
  {predictions.map((pred, index) => (
    <div
      key={index}
      style={{
        color: pred.probability > 0.75 ? "red" : "black",
        fontWeight: pred.probability > 0.75 ? "bold" : "normal",
      }}
    >
      {pred.className}: {pred.probability.toFixed(2)}
    </div>
  ))}
</div>
    </div>
  );
};

export default App;
