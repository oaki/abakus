import { useCallback, useEffect, useState } from 'react';
import Abacus from './components/Abacus';
import { generateProblem, getAbacusValue, generateSolutionSteps } from './utils/mathEngine';
import './styles/abacus.css';

const LEVELS = [
  { id: 1, name: 'Level 1: Základy do 4' },
  { id: 2, name: 'Level 2: Sčítanie do 9' },
  { id: 3, name: 'Level 3: Doplnky do 5' },
  { id: 4, name: 'Level 4: Doplnky do 10' },
  { id: 5, name: 'Level 5: Dvojciferné' }
];

const INITIAL_RODS = [
  { topActive: false, bottomActiveCount: 0 },
  { topActive: false, bottomActiveCount: 0 },
  { topActive: false, bottomActiveCount: 0 }
];

function App() {
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState(null);
  const [rodsState, setRodsState] = useState(INITIAL_RODS);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Tutoriál stav
  const [tutorialMode, setTutorialMode] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const loadNewProblem = useCallback(() => {
    setProblem(generateProblem(level));
    setRodsState(INITIAL_RODS.map(r => ({ ...r })));
    setMessage({ text: '', type: '' });
    setTutorialMode(false);
  }, [level]);

  useEffect(() => {
    loadNewProblem();
  }, [loadNewProblem]);

  const handleRodChange = (index, newRodState) => {
    const newRods = [...rodsState];
    newRods[index] = newRodState;
    setRodsState(newRods);
    setMessage({ text: '', type: '' });

    // Ak beží tutoriál, kontrolujeme, či to dieťa nastavilo správne
    if (tutorialMode && tutorialSteps.length > 0) {
      const targetRods = tutorialSteps[currentStepIndex].rodsState;
      if (getAbacusValue(newRods) === getAbacusValue(targetRods)) {
        // Dieťa urobilo správny krok
        if (currentStepIndex < tutorialSteps.length - 1) {
          setMessage({ text: 'Správne! 👍 Posúvame sa ďalej.', type: 'success' });
          setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
            setMessage({ text: '', type: '' });
          }, 1500);
        } else {
          setMessage({ text: 'Výborne, zvládol si to! 🎉', type: 'success' });
          setTimeout(() => {
            setTutorialMode(false);
            loadNewProblem();
          }, 2000);
        }
      }
    }
  };

  const handleCheck = () => {
    if (tutorialMode) return;
    const currentValue = getAbacusValue(rodsState);
    if (currentValue === problem.answer) {
      setMessage({ text: 'Výborne! Správna odpoveď! 🎉', type: 'success' });
      setTimeout(() => {
        loadNewProblem();
      }, 2000);
    } else {
      setMessage({ text: 'Skús to ešte raz, niekde je chybička. 🤔', type: 'error' });
    }
  };

  const startTutorial = () => {
    if (!problem) return;
    const steps = generateSolutionSteps(problem.num1, problem.num2);
    setTutorialSteps(steps);
    setCurrentStepIndex(0);
    setTutorialMode(true);
    setRodsState(INITIAL_RODS.map(r => ({ ...r }))); // Vyčisti abakus
    setMessage({ text: 'Ukáž, čo vieš! Ak nevieš, klikni na "Ukáž mi to".', type: 'success' });
  };

  const nextTutorialStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setRodsState(tutorialSteps[currentStepIndex].rodsState); // Najprv ukážeme cieľový stav aktuálneho kroku
      setCurrentStepIndex(nextIndex);
      setMessage({ text: '', type: '' });
    } else {
      // Posledný krok
      setRodsState(tutorialSteps[currentStepIndex].rodsState);
      setMessage({ text: 'Výborne! 🎉', type: 'success' });
      setTimeout(() => {
        setTutorialMode(false);
        loadNewProblem();
      }, 2000);
    }
  };

  return (
    <div className="game-layout">
      <h1 className="title">Hravý Abakus (Soroban)</h1>
      
      <div className="level-selector">
        {LEVELS.map(l => (
          <button 
            key={l.id} 
            className={`level-btn ${level === l.id ? 'active' : ''}`}
            onClick={() => {
              if (!tutorialMode) setLevel(l.id);
            }}
            disabled={tutorialMode}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className={`question-panel ${tutorialMode ? 'tutorial-active' : ''}`}>
        {tutorialMode 
          ? <div className="tutorial-text">{tutorialSteps[currentStepIndex]?.text}</div>
          : (problem ? problem.text : 'Načítavam...')
        }
      </div>

      <div>
        <Abacus rodsState={rodsState} onRodChange={handleRodChange} />
      </div>

      <div className="controls">
        {tutorialMode ? (
          <button className="btn btn-primary" onClick={nextTutorialStep}>
            {currentStepIndex < tutorialSteps.length - 1 ? 'Ukáž mi to / Ďalší krok ➡️' : 'Koniec (Daj nový príklad)'}
          </button>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={loadNewProblem}>
              Nový príklad
            </button>
            <button className="btn btn-secondary" onClick={startTutorial}>
              💡 Poradiť
            </button>
            <button className="btn btn-primary" onClick={handleCheck}>
              Skontrolovať
            </button>
          </>
        )}
      </div>

      <div className={`message ${message.type} ${message.text ? 'show' : ''}`}>
        {message.text}
      </div>
    </div>
  );
}

export default App;
