/* eslint-disable @next/next/no-img-element */
import * as tf from "@tensorflow/tfjs";
import { Inter } from "next/font/google";
import { useRef, useState } from "react";
import { CanvasRef, Canvas } from "@/components/Canvas";
import { useFabricJs } from "@/hooks/useFabricJs";
import { useTensorflowModel } from "@/hooks/useTensorflowModel";

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

export default function Home() {
  const [src, setSrc] = useState<string>();
  const canvasRef = useRef<CanvasRef | null>(null);
  const { model, isLoading: isLoadingModel } =
    useTensorflowModel("/model.json");
  const [prediction, setPrediction] = useState<number>();
  useFabricJs(); // prefetch fabric-js

  const handleClick = async () => {
    const canvas = canvasRef?.current?.getCanvas();

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

  if (isLoadingModel) {
    return <p>Loading...</p>;
  }

  return (
    <main style={inter.style}>
      <div className="w-screen flex justify-between items-center">
        <div className="border-teal-700">
          <Canvas ref={canvasRef} width={280} height={280} />
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
