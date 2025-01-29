// 参考: https://github.com/cameronking4/openai-realtime-api-nextjs
"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// 会話メッセージの型例 (必要に応じて調整)
export interface Conversation {
  id: string;
  role: string;
  text: string;
  timestamp: string;
  isFinal: boolean;
  status?: "speaking" | "processing" | "final";
}

export interface Tool {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

/**
 * Hook のオプション
 */
interface UseWebRTCAudioSessionOptions {
  voice?: string; // モデルに与える音声種別, 例: "en-US-Standard-B"
  tools?: Tool[]; // AI が呼び出せる function の一覧
  initialSystemMessage?: string; // セッション開始時に送る初期メッセージ(任意)
}

/**
 * Hook から返すオブジェクト
 */
interface UseWebRTCAudioSessionReturn {
  status: string;
  isSessionActive: boolean;
  audioIndicatorRef: React.RefObject<HTMLDivElement | null>;
  startSession: () => Promise<void>;
  stopSession: () => void;
  handleStartStopClick: () => void;
  registerFunction: (name: string, fn: Function) => void;
  msgs: any[]; // デバッグ用: APIから受け取る生メッセージ等を格納
  currentVolume: number; // アシスタント音声(受信)の音量計測用
  conversation: Conversation[]; // 会話履歴 (ユーザ発話, アシスタント発話など)
  sendTextMessage: (text: string) => void;
}

/**
 * WebRTC + OpenAI Realtime API を使うためのカスタムフック
 */
export default function useWebRTCAudioSession(
  options?: UseWebRTCAudioSessionOptions
): UseWebRTCAudioSessionReturn {
  const voice = options?.voice ?? "en-US-Standard-B";
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
  const [conversation, setConversation] = useState<Conversation[]>([]);

  // function_call に応じて呼び出される関数を登録するレジストリ
  const functionRegistry = useRef<Record<string, Function>>({});

  // 音量計測
  const [currentVolume, setCurrentVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  // ユーザ発話(音声)の暫定ID
  const ephemeralUserMessageIdRef = useRef<string | null>(null);

  /**
   * AIに呼び出される関数を登録する (Tools)
   */
  function registerFunction(name: string, fn: Function) {
    functionRegistry.current[name] = fn;
  }

  /**
   * もし props で与えられた tools があれば、自動的に register する
   */
  useEffect(() => {
    tools.forEach((tool) => {
      const fn = async (args: any) => {
        console.log(`Tool called: ${tool.name} with args:`, args);
        // ここで実際の処理を行う(例: 外部APIへリクエスト)
        // 今回はダミーでレスポンスを返す
        return {
          success: true,
          toolName: tool.name,
          echoArgs: args,
        };
      };
      registerFunction(tool.name, fn);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools]);

  /**
   * データチャネルが open したら、セッション情報を送る
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    // 1) "session.update" イベント送信: モダリティ(音声/テキスト)や利用ツール一覧などを通知
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        tools,
        input_audio_transcription: {
          model: "whisper-1",
        },
      },
    };
    dataChannel.send(JSON.stringify(sessionUpdate));

    // 2) 初期メッセージがあれば送る (例: システムメッセージ)
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
   * ユーザ音声の暫定メッセージIDを取得/作成
   */
  function getOrCreateEphemeralUserId(): string {
    if (!ephemeralUserMessageIdRef.current) {
      ephemeralUserMessageIdRef.current = uuidv4();
      const newMessage: Conversation = {
        id: ephemeralUserMessageIdRef.current,
        role: "user",
        text: "",
        timestamp: new Date().toISOString(),
        isFinal: false,
        status: "speaking",
      };
      setConversation((prev) => [...prev, newMessage]);
    }
    return ephemeralUserMessageIdRef.current;
  }

  /**
   * ユーザ音声の暫定メッセージをアップデート
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) return;
    setConversation((prev) =>
      prev.map((msg) => {
        if (msg.id === ephemeralId) {
          return { ...msg, ...partial };
        }
        return msg;
      })
    );
  }

  /**
   * ユーザ音声の暫定メッセージIDをクリア
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
        // 音声入力開始
        case "input_audio_buffer.speech_started": {
          getOrCreateEphemeralUserId();
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }
        // 音声停止
        case "input_audio_buffer.speech_stopped": {
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }
        // バッファがコミット -> 解析中
        case "input_audio_buffer.committed": {
          updateEphemeralUserMessage({
            text: "Processing speech...",
            status: "processing",
          });
          break;
        }
        // 部分的な文字起こし
        case "conversation.item.input_audio_transcription": {
          const partialText = msg.transcript ?? "User is speaking...";
          updateEphemeralUserMessage({
            text: partialText,
            status: "speaking",
            isFinal: false,
          });
          break;
        }
        // 最終文字起こし
        case "conversation.item.input_audio_transcription.completed": {
          updateEphemeralUserMessage({
            text: msg.transcript || "",
            isFinal: true,
            status: "final",
          });
          clearEphemeralUserMessage();
          break;
        }
        // アシスタントのストリーミングテキスト(部分)
        case "response.audio_transcript.delta": {
          const newMessage: Conversation = {
            id: uuidv4(),
            role: "assistant",
            text: msg.delta,
            timestamp: new Date().toISOString(),
            isFinal: false,
          };
          setConversation((prev) => {
            const last = prev[prev.length - 1];
            // 直近のアシスタントメッセージに追記するかどうか
            if (last && last.role === "assistant" && !last.isFinal) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                text: last.text + msg.delta,
              };
              return updated;
            } else {
              return [...prev, newMessage];
            }
          });
          break;
        }
        // アシスタントのテキスト出力(最終)
        case "response.audio_transcript.done": {
          setConversation((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1].isFinal = true;
            return updated;
          });
          break;
        }
        // function call
        case "response.function_call_arguments.done": {
          const fn = functionRegistry.current[msg.name];
          if (fn) {
            const args = JSON.parse(msg.arguments || "{}");
            const result = await fn(args);
            // AIに実行結果を返す
            const response = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            };
            dataChannelRef.current?.send(JSON.stringify(response));
            // 最後に response.create を送って完了を通知
            const responseCreate = {
              type: "response.create",
            };
            dataChannelRef.current?.send(JSON.stringify(responseCreate));
          }
          break;
        }
        default: {
          // Unhandled
          break;
        }
      }

      // デバッグ用に保存
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
   * マイク入力の音量可視化用 (CSSトグル)
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

      // 一定値を超えたらCSSクラス "active" を付与
      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle("active", average > 30);
      }
      requestAnimationFrame(updateIndicator);
    };
    updateIndicator();

    audioContextRef.current = audioContext;
  }

  /**
   * アシスタント側(受信音声)の音量計測
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

      setStatus("Fetching ephemeral token...");
      const ephemeralToken = await getEphemeralToken();

      setStatus("Establishing connection...");
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // アシスタント音声を再生するための隠し <audio> 要素
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

    // 会話履歴やデバッグログをリセット
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
   * ユーザがテキストでメッセージを送信
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
    // 会話履歴に追加
    const newMessage: Conversation = {
      id: messageId,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      isFinal: true,
      status: "final",
    };
    setConversation((prev) => [...prev, newMessage]);

    // DataChannel で送信
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

    // レスポンス生成開始を通知 (OpenAI Realtime API 仕様)
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
