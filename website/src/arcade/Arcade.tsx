import * as React from "react";
import { MODELS } from "@site/src/arcade/models";
import {
  defaultState,
  getStorageValue,
  isDatasetPresetKey,
  reducer,
  setStorageValue,
} from "@site/src/arcade/state";
import { ArcadeHeader } from "@site/src/arcade/ArcadeHeader";
import { ArcadeQueryDisplay } from "@site/src/arcade/ArcadeQueryDisplay";
import { ArcadeEditor } from "@site/src/arcade/ArcadeEditor";
import datasets from "@site/src/datasets.json";
import { ARCADE_STORAGE_KEYS } from "@site/src/arcade/consts";
import { ExamplePayload } from "@site/src/arcade/examples";
import { ArcadeSection } from "@site/src/arcade/ArcadeSection";
import { ArcadeDatasetEditor } from "@site/src/arcade/ArcadeDatasetEditor";
import { ArcadeResponseView } from "@site/src/arcade/ArcadeResponseView";
import lzstring from "lz-string";
import { runCodeEmitter } from "@site/src/arcade/eventEmitters";
import { DefaultToastOptions, Toaster } from "react-hot-toast";
import { HiPlay } from "react-icons/hi";
import clsx from "clsx";

export function Arcade() {
  const [
    {
      query,
      isExecutingQuery,
      fetchParseError,
      parsedResponse,
      errorPaths,
      rawResponse,
    },
    dispatch,
  ] = React.useReducer(reducer, defaultState);

  const setDatasetPreset = React.useCallback(
    (datasetPreset: keyof typeof datasets) => {
      MODELS.json.setValue(datasets[datasetPreset].data);
      setStorageValue(ARCADE_STORAGE_KEYS.DATASET, datasetPreset);
    },
    []
  );

  const loadExample = ({ code, dataset }: ExamplePayload) => {
    setDatasetPreset(dataset);
    MODELS.ts.setValue(code);

    runCodeEmitter.emit(true);
  };

  const handleRun = () => {
    runCodeEmitter.emit(true);
  };

  /**
   * Load in dataset
   */
  React.useEffect(() => {
    const storedDataset = getStorageValue(ARCADE_STORAGE_KEYS.DATASET);

    if (!storedDataset) return;

    if (isDatasetPresetKey(storedDataset))
      setTimeout(() => {
        setDatasetPreset(storedDataset);
      });
    else {
      try {
        const d = lzstring.decompressFromEncodedURIComponent(storedDataset);
        if (d) {
          MODELS.json.setValue(d);
        }
      } catch {}
    }
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col">
      <ArcadeHeader
        selectDatasetPreset={setDatasetPreset}
        selectExample={loadExample}
      />

      <div className="flex-1 flex items-center">
        <div className="w-full grid grid-cols-3 gap-5 max-h-[1200px] h-full container max-w-[2400px] pb-5">
          <ArcadeSection
            title="Dataset"
            subtitle="The data your query will run against."
          >
            <div className="h-full relative">
              <ArcadeDatasetEditor />
            </div>
          </ArcadeSection>
          <ArcadeSection
            title="Query Code"
            subtitle="Your code to run a GROQD query."
          >
            <div className="h-full flex flex-col">
              <div className="relative flex-1">
                <ArcadeEditor dispatch={dispatch} />
                <div className="absolute right-0 bottom-0 p-4">
                  <button
                    className={clsx(
                      "inline-flex items-center px-5 py-2 gap-3",
                      "bg-gray-50 border-none text-xl rounded shadow-sm hover:shadow-md font-bold text-gray-700",
                      "cursor-pointer bg-gradient-to-tr from-green-200 to-green-100 hover:bg-green-200",
                      "transition-colors transition-shadow duration-150"
                    )}
                    onClick={handleRun}
                  >
                    <span>Run</span>
                    <HiPlay className="text-2xl text-green-600" />
                  </button>
                </div>
              </div>
              <ArcadeQueryDisplay query={query.query} />
            </div>
          </ArcadeSection>
          <ArcadeSection
            title="Query Result"
            subtitle="The result of your GROQD query."
          >
            <ArcadeResponseView
              isExecutingQuery={isExecutingQuery}
              fetchParseError={fetchParseError}
              errorPaths={errorPaths}
              parsedResponse={parsedResponse}
              rawResponse={rawResponse}
            />
          </ArcadeSection>
        </div>
      </div>

      <Toaster toastOptions={toastOptions} />
    </div>
  );
}

const toastOptions = {
  className: "rounded-md bg-white shadow-md",
  position: "top-right",
  error: {
    className: "bg-red-100",
    icon: null,
  },
  success: {
    className: "bg-green-50",
    icon: null,
  },
} satisfies DefaultToastOptions;
