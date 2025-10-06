// Prototyp1.js
import React, { useEffect, useState} from 'react';
import ChatClient from "what2study-chatclient";

function Prototyp() {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [correctGuesses, setCorrectGuesses] = useState(0);

  // Beispielberufe für das Spiel (einer pro Runde ist korrekt)
  const rounds = [
    { correctProfession: 'Ingenieur', professions: ['Ingenieur', 'Lehrer', 'Arzt', 'Designer'] },
    { correctProfession: 'Arzt', professions: ['Bäcker', 'Arzt', 'Pilot', 'Mechaniker'] },
    { correctProfession: 'Lehrer', professions: ['Architekt', 'Lehrer', 'Bauer', 'Schauspieler'] },
  ];

  const currentProfessionList = rounds[currentRound - 1].professions;
  const correctProfession = rounds[currentRound - 1].correctProfession;

  // Funktion, um den Beruf zu wählen
  const handleProfessionSelect = (profession) => {
    if (selectedProfession) return; // Beruf darf nur einmal gewählt werden

    setSelectedProfession(profession);
    if (profession === correctProfession) {
      setFeedback('Richtig!');
      setCorrectGuesses(correctGuesses + 1);
    } else {
      setFeedback('Falsch, das war nicht der richtige Beruf.');
    }
  };

  // Zur nächsten Runde wechseln
  const handleNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
      setSelectedProfession(null);
      setFeedback('');
    } else {
    //   navigate('/homepage'); // Ende des Spiels
    }
  };

  // Tracken, wie viele Runden der Benutzer richtig erraten hat und Visualisierung anzeigen
  const renderProgress = () => {
    return (
      <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
        Richtige Berufe erraten: {correctGuesses} von {rounds.length}
      </div>
    );
  };

  // Chatbot-Komponente einfügen und initialisieren
  useEffect(() => {
    console.log("useEffect gestartet - Warte auf den sichtbaren Bubble-Button im iframe...");

    const checkIframeAndClickBubbleButton = () => {
      const iframes = document.querySelectorAll('iframe#what2studyIDChrome');
    //   const visibleIframe = Array.from(iframes).find(iframe => iframe.style.display === 'block');

    //   if (visibleIframe) {
    //     console.log("Sichtbaren iframe gefunden. Versuche, auf den Inhalt zuzugreifen...");
    //     const iframeDocument = visibleIframe.contentDocument || visibleIframe.contentWindow.document;

    //     if (iframeDocument) {
    //       console.log("Inhalt des iframe-Dokuments:", iframeDocument.documentElement.innerHTML);
    //       const bubbleButton = iframeDocument.getElementById("chatBtnBubble");

    //       if (bubbleButton) {
    //         console.log("Bubble-Button im iframe gefunden! Klick wird ausgeführt...");
    //         bubbleButton.click(); // Klick auf den Button im iframe
    //         clearInterval(timer);
    //       } else {
    //         console.log("Bubble-Button im iframe noch nicht gefunden. Warte...");
    //       }
    //     } else {
    //       console.log("Zugriff auf iframe-Dokument nicht möglich.");
    //     }
    //   } else {
    //     console.log("Sichtbarer iframe noch nicht gefunden. Warte...");
    //   }
    };

    const timer = setInterval(checkIframeAndClickBubbleButton, 1000);
    return () => clearInterval(timer);
  }, [currentRound]);
  

  return (
    
    <div style={{ display: 'flex', flexDirection: 'row', padding: '20px' }}>
      {/* Linke Seite: Chatbot */}
      <div style={{ height: "700px", width: "60%", position: "relative" }}>
        <ChatClient
          objectId={"LpuCgONpPS"}
    
          userId={"yaHaubs0Oe"}

          universityId={"yaHaubs0Oe"}

          accessToken={"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGF0Ym90SWQiOiJMcHVDZ09OcFBTIiwicHVycG9zZSI6ImNoYXRib3RJbnRlZ3JhdGlvbiIsImlhdCI6MTczMTQwMzgzOX0.okZ5b29RK_Lnl3lw3JtI1e9fTe0u6CDpDygQS0MnIwo"}

          chatbotId={"LpuCgONpPS"}

          testRequest={true}

          windowtype = {"min"}
        ></ChatClient>
      </div>
      <div style={{width:"300px"}}> </div>

      {/* Rechte Seite: Berufsauswahl und Feedback */}
      <div style={{ width: '40%', marginLeft: '20px' }}>
        <h3>Mit welchem Beruf chattest du?</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {currentProfessionList.map((profession) => (
            <li key={profession} style={{ margin: '10px 0' }}>
              <button
                onClick={() => handleProfessionSelect(profession)}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: selectedProfession ? 'not-allowed' : 'pointer',
                  backgroundColor: selectedProfession === profession ? '#ddd' : '#f0f0f0',
                }}
                disabled={!!selectedProfession}
              >
                {profession}
              </button>
            </li>
          ))}
        </ul>

        {feedback && (
          <div style={{ marginTop: '20px', fontWeight: 'bold', color: feedback === 'Richtig!' ? 'green' : 'red' }}>
            {feedback}
          </div>
        )}

        {selectedProfession && (
          <button
            onClick={handleNextRound}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Nächsten Beruf erraten
          </button>
        )}

        {/* Fortschrittanzeige */}
        {renderProgress()}
      </div>
    </div>
  );
}

export default Prototyp;