import React from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function VoiceTest() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>React Speech Recognition Test</h2>
      <button onClick={() => SpeechRecognition.startListening({ continuous: true })}>
        Start
      </button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>

      <p><strong>Listening:</strong> {listening ? "Yes" : "No"}</p>
      <textarea
        rows={5}
        cols={50}
        value={transcript}
        readOnly
        placeholder="Your speech will appear here..."
      />
    </div>
  );
}
