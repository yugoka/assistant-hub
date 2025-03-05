import { useEffect, useState } from "react";

export function useWakeword() {
  const [status, setStatus] = useState("Initializing...");
  const [isReady, setIsReady] = useState(false);
  const [keywordDetector, setKeywordDetector] = useState<any>(null);

  useEffect(() => {
    // サーバーサイドで実行されるときは処理しない
    if (typeof window === "undefined") return;

    let detector: any = null;

    const initKeywordDetector = async () => {
      try {
        // @ts-ignore
        const webWakeWord = await import("web-wake-word");
        const { KeywordDetector } = webWakeWord;

        if (typeof KeywordDetector !== "function") {
          console.error("KeywordDetector is not a constructor");
          return;
        }

        // ここで detector を生成
        detector = new KeywordDetector(
          "/models",
          [
            {
              modelToUse: "need_help_now.onnx",
              threshold: 0.9,
              bufferCount: 2,
              onKeywordDetected: (detected: any) => {
                console.log("Keyword detected:", detected);
                detector?.startListening(); // 継続してリッスン
              },
            },
          ],
          "/dist/",
          "/dist/"
        );

        // ライセンスをセット
        const isLicensed = await detector.setLicense(
          process.env.NEXT_PUBLIC_DAVOICE_ACCESS_KEY
        );
        if (!isLicensed) {
          alert("Invalid or expired license key.");
          setStatus("Invalid or expired license key.");
          return;
        }

        // 初期化
        await detector.init();

        // リッスン開始
        detector.startListening();
        setStatus("Models loaded. Listening for keywords...");
        setIsReady(true);
        setKeywordDetector(detector);
      } catch (error) {
        console.error("Initialization error:", error);
        setStatus("Error initializing keyword detector.");
      }
    };

    initKeywordDetector();

    // アンマウント時のクリーンアップ
    return () => {
      if (detector) {
        detector.stopListening();
      }
    };
  }, []);

  return { status, isReady, keywordDetector };
}
