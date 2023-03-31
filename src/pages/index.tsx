/* eslint-disable @next/next/no-img-element */
import * as tf from "@tensorflow/tfjs";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { init } from "@/utils/lib";
const inter = Inter({ subsets: ["latin"] });

const maxIdx = (arr: number[]) => {
  let curMax = arr[0];
  let idx = 0;
  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] > curMax) {
      curMax = arr[i];
      idx = i;
    }
  }

  return idx;
};

const useModel = (path: string) => {
  const [model, setModel] = useState<tf.LayersModel>();
  useEffect(() => {
    tf.loadLayersModel("/model.json").then((m) => setModel(m));
  }, [path]);
  return model;
};

export default function Home() {
  const [src, setSrc] = useState<string>();
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const model = useModel("/model.json");
  const [prediction, setPrediction] = useState<number>();

  useEffect(() => {
    init(
      "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.4.0/fabric.min.js",
      "fabric.js"
    ).then(() => {
      setCanvas((c) => {
        if (c) return c;
        const canvas = new window.fabric.Canvas("drawing-sheet");
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = 14;
        canvas.freeDrawingBrush.color = "#fff";
        canvas.backgroundColor = "#000";
        const ctx = canvas.getContext();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width!, canvas.height!);
        return canvas;
      });
    });
  }, [model]);

  const handleClick = async () => {
    if (!canvas || !model) return;

    setSrc(canvas.toDataURL());
    let image = tf.browser
      .fromPixels(
        canvas.getContext().getImageData(0, 0, canvas.width!, canvas.height!),
        1
      )
      .resizeBilinear([28, 28])
      .div(tf.scalar(255));
    const predictions = model.predict(image.reshape([1, 28, 28, 1]));
    if (
      "dataSync" in predictions &&
      typeof predictions.dataSync === "function"
    ) {
      setPrediction(maxIdx(Array.from(predictions.dataSync())));
    }
    canvas.clear();
  };

  return (
    <main style={inter.style}>
      <div className="w-screen flex justify-between items-center">
        <div className="border-teal-700">
          <canvas id="drawing-sheet" width={280} height={280} />
        </div>
        {src && <img src={src} alt="" className="h-[280px] w-[280px]" />}
        {prediction !== undefined && (
          <div className="flex justify-center items-center text-9xl">
            {prediction}
          </div>
        )}
        <button
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Predict
        </button>
      </div>
    </main>
  );
}
