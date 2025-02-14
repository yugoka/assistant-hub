"use client";
import { OpenAIToolWithoutExecutor } from "@/services/schema/openapiToTools";
import { Message } from "@/types/Message";
import { executeTool } from "@/utils/tools";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// 会話メッセージの型例
export type RealtimeConversation = Message & {
  isFinal: boolean;
  status?: "speaking" | "processing" | "final";
};

interface UseWebRTCAudioSessionOptions {
  voice?: string;
  tools?: OpenAIToolWithoutExecutor[]; // AI が呼び出せる function の一覧
  initialSystemMessage?: string; // セッション開始時に送る初期メッセージ
}

interface UseWebRTCAudioSessionReturn {
  status: string;
  isSessionActive: boolean;
  audioIndicatorRef: React.RefObject<HTMLDivElement>;
  startSession: () => Promise<void>;
  stopSession: () => void;
  handleStartStopClick: () => void;
  registerFunction: (name: string, fn: Function) => void;
  msgs: any[];
  currentVolume: number;
  conversation: RealtimeConversation[];
  sendTextMessage: (text: string) => void;
}

export default function useWebRTCAudioSession(
  threadId: string,
  options?: UseWebRTCAudioSessionOptions
): UseWebRTCAudioSessionReturn {
  const voice = options?.voice ?? "sage";
  const tools = options?.tools ?? [];
  const initialSystemMessage = options?.initialSystemMessage ?? "";

  // セッション状態管理
  const [status, setStatus] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);

  // ローカルマイク入力の管理
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // デバッグ用の生イベント列
  const [msgs, setMsgs] = useState<any[]>([]);

  // 会話履歴
  const [conversation, setConversation] = useState<RealtimeConversation[]>([]);

  // function_call に応じて呼び出される関数を登録するレジストリ
  const functionRegistry = useRef<Record<string, Function>>({});

  // 音量計測
  const [currentVolume, setCurrentVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  // ユーザ音声(暫定メッセージ)用
  const ephemeralUserMessageIdRef = useRef<string | null>(null);

  /**
   * AIに呼び出される関数(ツール)を登録する
   */
  function registerFunction(name: string, fn: Function) {
    functionRegistry.current[name] = fn;
  }

  /**
   * もしpropsで与えられたtoolsがあれば、自動的にregisterFunctionする (ダミー実装)
   */
  useEffect(() => {
    tools.forEach((tool) => {
      const fn = async (args: any) => {
        console.log(`【Tool呼び出し】${tool.function.name} with args:`, args);
        return await executeTool(tool, args);
      };
      registerFunction(tool.function.name, fn);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools]);

  /**
   * データチャネルが open したら、Realtime API に初期設定を送信
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    // 1) "session.update" イベント送信: モダリティ, ツール一覧など
    console.log(
      tools.map((t) => ({
        type: "function",
        name: t.function.name,
        description: t.function.description || "No description",
        parameters: t.function.parameters || {},
      }))
    );
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        voice,
        tool_choice: "auto",
        tools: tools.map((t) => ({
          type: "function",
          name: t.function.name,
          description: t.function.description || "No description",
          parameters: t.function.parameters || {},
        })),
        input_audio_transcription: {
          model: "whisper-1",
        },
        // ここで必要に応じて instructions や turn_detection を指定可能
      },
    };
    dataChannel.send(JSON.stringify(sessionUpdate));

    // 2) 初期メッセージがあれば会話に追加 (system)
    if (initialSystemMessage) {
      const systemMsg = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "system",
          content: [
            {
              type: "input_text",
              text: initialSystemMessage,
            },
          ],
        },
      };
      dataChannel.send(JSON.stringify(systemMsg));
    }
  }

  /**
   * ユーザの音声用の暫定メッセージIDを取得 or 作成
   */
  function getOrCreateEphemeralUserId(): string {
    if (!ephemeralUserMessageIdRef.current) {
      ephemeralUserMessageIdRef.current = uuidv4();
      const newMessage: RealtimeConversation = {
        id: ephemeralUserMessageIdRef.current,
        thread_id: threadId,
        role: "user",
        content: "",
        created_at: new Date().toISOString(),
        isFinal: false,
        status: "speaking",
      };
      setConversation((prev) => [...prev, newMessage]);
    }
    return ephemeralUserMessageIdRef.current;
  }

  /**
   * 暫定メッセージの更新
   */
  function updateEphemeralUserMessage(partial: Partial<RealtimeConversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) return;
    // ここの解決方法わからんすぎる。。。 多分role毎に分かれている型が悪さしてる
    // @ts-ignore
    setConversation((prev) =>
      prev.map((msg) => (msg.id === ephemeralId ? { ...msg, ...partial } : msg))
    );
  }

  /**
   * 暫定メッセージIDをクリア
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null;
  }

  /**
   * データチャネルに届くメッセージを処理
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        // --- ユーザ音声の検知系 ---
        case "input_audio_buffer.speech_started":
          getOrCreateEphemeralUserId();
          updateEphemeralUserMessage({ status: "speaking" });
          break;

        case "input_audio_buffer.speech_stopped":
          updateEphemeralUserMessage({ status: "speaking" });
          break;

        case "input_audio_buffer.committed":
          updateEphemeralUserMessage({
            content: "Processing speech...",
            status: "processing",
          });
          break;

        // --- ユーザ音声の文字起こし ---
        case "conversation.item.input_audio_transcription": {
          const partialText = msg.transcript ?? "User is speaking...";
          updateEphemeralUserMessage({
            content: partialText,
            status: "speaking",
            isFinal: false,
          });
          break;
        }
        case "conversation.item.input_audio_transcription.completed": {
          const finalText = msg.transcript || "";
          updateEphemeralUserMessage({
            content: finalText,
            isFinal: true,
            status: "final",
          });
          clearEphemeralUserMessage();
          break;
        }

        // --- アシスタントのストリーミングテキスト(部分) ---
        case "response.text.delta":
        case "response.audio_transcript.delta": {
          // アシスタントの部分的な文字列を conversation に追記
          const newMessage: RealtimeConversation = {
            id: uuidv4(),
            thread_id: threadId,
            role: "assistant",
            content: msg.delta,
            created_at: new Date().toISOString(),
            isFinal: false,
          };
          setConversation((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && !last.isFinal) {
              // 直近メッセージに追記
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                content: last.content + msg.delta,
              };
              return updated;
            } else {
              return [...prev, newMessage];
            }
          });
          break;
        }

        // --- アシスタントのテキスト出力(最終) ---
        case "response.text.done":
        case "response.audio_transcript.done": {
          setConversation((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1].isFinal = true;
            return updated;
          });
          break;
        }

        // --- 関数呼び出し引数(途中) ---
        case "response.function_call_arguments.delta": {
          // 部分的な引数。コンソールに出すだけで、会話には追加しない。
          // console.log("【function_call_arguments.delta】", msg.delta);
          break;
        }

        // --- 関数呼び出し引数(最終) ---
        case "response.function_call_arguments.done": {
          console.log("【function_call_arguments.done】", msg);

          // 該当関数を取得
          const fn = functionRegistry.current[msg.name];
          if (fn) {
            // 引数をJSON.parse
            const args = JSON.parse(msg.arguments || "{}");
            console.log("実行する関数:", msg.name, "引数:", args);

            // 関数実行
            const result = await fn(args);
            console.log("関数の実行結果:", result);

            // 実行結果をAIに返す: function_call_output
            const response = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            };
            dataChannelRef.current?.send(JSON.stringify(response));

            // 次のAI回答を促す (response.create)
            const responseCreate = {
              type: "response.create",
              response: {},
            };
            dataChannelRef.current?.send(JSON.stringify(responseCreate));
          }
          break;
        }

        // エラーメッセージなど
        case "error":
          console.error("【Server Error】", msg.error);
          break;

        default:
          // そのほかのイベントは適宜拡張
          break;
      }

      // デバッグ用に全イベントを保存
      setMsgs((prevMsgs) => [...prevMsgs, msg]);
    } catch (error) {
      console.error("Error handling data channel message:", error);
    }
  }

  /**
   * OpenAI Realtime API 用のエフェメラルトークンを取得
   */
  async function getEphemeralToken(): Promise<string> {
    try {
      const response = await fetch("/api/realtime/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to get ephemeral token: ${response.status}`);
      }
      const data = await response.json();
      // data.client_secret.value にトークンが入っている想定
      return data.client_secret.value;
    } catch (err) {
      console.error("getEphemeralToken error:", err);
      throw err;
    }
  }

  /**
   * マイク入力の音量可視化 (CSSトグル)
   */
  function setupAudioVisualization(stream: MediaStream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateIndicator = () => {
      if (!audioContext) return;
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle("active", average > 30);
      }
      requestAnimationFrame(updateIndicator);
    };
    updateIndicator();

    audioContextRef.current = audioContext;
  }

  /**
   * アシスタント音声(受信)の音量計測
   */
  function getVolume(): number {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128;
      sum += float * float;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  /**
   * セッション開始
   */
  async function startSession() {
    try {
      setStatus("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setupAudioVisualization(stream);

      // 開始音を鳴らす
      new Audio("/sounds/session-start.mp3").play().catch();

      setStatus("Fetching ephemeral token...");
      const ephemeralToken = await getEphemeralToken();

      setStatus("Establishing connection...");
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // アシスタント音声を再生するための <audio> 要素
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;

      // 受信トラック(アシスタント音声)
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];

        // 音量計測
        const audioCtx = new (window.AudioContext || window.AudioContext)();
        const src = audioCtx.createMediaStreamSource(event.streams[0]);
        const inboundAnalyzer = audioCtx.createAnalyser();
        inboundAnalyzer.fftSize = 256;
        src.connect(inboundAnalyzer);
        analyserRef.current = inboundAnalyzer;

        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume());
        }, 100);
      };

      // DataChannel
      const dataChannel = pc.createDataChannel("response");
      dataChannelRef.current = dataChannel;
      dataChannel.onopen = () => {
        configureDataChannel(dataChannel);
      };
      dataChannel.onmessage = handleDataChannelMessage;

      // ローカルマイクトラックを追加
      pc.addTrack(stream.getTracks()[0]);

      // SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // OpenAI Realtime API への接続
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17"; // Realtime対応モデル
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
      });

      // SDP Answer
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      setIsSessionActive(true);
      setStatus("Session established successfully!");
    } catch (err) {
      console.error("startSession error:", err);
      setStatus(`Error: ${String(err)}`);
      stopSession();
    }
  }

  /**
   * セッション終了
   */
  function stopSession() {
    if (dataChannelRef.current) {
      // 終了音を鳴らす
      new Audio("/sounds/session-end.mp3").play().catch();
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove("active");
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    analyserRef.current = null;

    ephemeralUserMessageIdRef.current = null;
    setCurrentVolume(0);
    setIsSessionActive(false);
    setStatus("Session stopped");

    // 会話履歴やデバッグログもリセット（必要に応じて）
    setMsgs([]);
    setConversation([]);
  }

  /**
   * 開始/停止をトグル
   */
  function handleStartStopClick() {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  }

  /**
   * ユーザがテキストメッセージを送信
   */
  function sendTextMessage(text: string) {
    if (
      !dataChannelRef.current ||
      dataChannelRef.current.readyState !== "open"
    ) {
      console.error("Data channel not ready or not open.");
      return;
    }

    const messageId = uuidv4();
    // ローカルの会話履歴に追加
    const newMessage: RealtimeConversation = {
      id: messageId,
      thread_id: threadId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
      isFinal: true,
      status: "final",
    };
    setConversation((prev) => [...prev, newMessage]);

    // DataChannel で送信 (conversation.item.create)
    const messagePayload = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text,
          },
        ],
      },
    };
    dataChannelRef.current.send(JSON.stringify(messagePayload));

    // レスポンス生成開始を通知 (response.create)
    const response = {
      type: "response.create",
    };
    dataChannelRef.current.send(JSON.stringify(response));
  }

  // コンポーネントがアンマウントされたらクリーンアップ
  useEffect(() => {
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    registerFunction,
    msgs,
    currentVolume,
    conversation,
    sendTextMessage,
  };
}
