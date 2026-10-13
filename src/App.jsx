import { useCallback, useEffect, useState } from 'react';
import Abacus from './components/Abacus';
import { generateProblem, getAbacusValue, generateSolutionSteps } from './utils/mathEngine';
import './styles/abacus.css';

const LEVELS = [
  { id: 1, name: 'Level 1: Fundamentals to 4' },
  { id: 2, name: 'Level 2: Addition to 9' },
  { id: 3, name: 'Level 3: Complements to 5' },
  { id: 4, name: 'Level 4: Complements to 10' },
  { id: 5, name: 'Level 5: Two-digit numbers' }
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

  // Tutorial state
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

    // During the tutorial, check whether the child set the correct value.
    if (tutorialMode && tutorialSteps.length > 0) {
      const targetRods = tutorialSteps[currentStepIndex].rodsState;
      if (getAbacusValue(newRods) === getAbacusValue(targetRods)) {
        // The child completed the step correctly.
        if (currentStepIndex < tutorialSteps.length - 1) {
          setMessage({ text: 'Correct! 👍 Moving on.', type: 'success' });
          setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
            setMessage({ text: '', type: '' });
          }, 1500);
        } else {
          setMessage({ text: "Brilliant, you've done it! 🎉", type: 'success' });
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
      setMessage({ text: "Brilliant! That's the right answer! 🎉", type: 'success' });
      setTimeout(() => {
        loadNewProblem();
      }, 2000);
    } else {
      setMessage({ text: "Try again – something isn't quite right. 🤔", type: 'error' });
    }
  };

  const startTutorial = () => {
    if (!problem) return;
    const steps = generateSolutionSteps(problem.num1, problem.num2);
    setTutorialSteps(steps);
    setCurrentStepIndex(0);
    setTutorialMode(true);
    setRodsState(INITIAL_RODS.map(r => ({ ...r }))); // Clear the abacus.
    setMessage({ text: 'Show what you know! If you are unsure, select "Show me".', type: 'success' });
  };

  const nextTutorialStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setRodsState(tutorialSteps[currentStepIndex].rodsState); // Show the target state for the current step first.
      setCurrentStepIndex(nextIndex);
      setMessage({ text: '', type: '' });
    } else {
      // Final step
      setRodsState(tutorialSteps[currentStepIndex].rodsState);
      setMessage({ text: 'Brilliant! 🎉', type: 'success' });
      setTimeout(() => {
        setTutorialMode(false);
        loadNewProblem();
      }, 2000);
    }
  };

  return (
    <div className="game-layout">
      <h1 className="title">Playful Abacus (Soroban)</h1>
      
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
          : (problem ? problem.text : 'Loading...')
        }
      </div>

      <div>
        <Abacus rodsState={rodsState} onRodChange={handleRodChange} />
      </div>

      <div className="controls">
        {tutorialMode ? (
          <button className="btn btn-primary" onClick={nextTutorialStep}>
            {currentStepIndex < tutorialSteps.length - 1 ? 'Show me / Next step ➡️' : 'Finish (new problem)'}
          </button>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={loadNewProblem}>
              New problem
            </button>
            <button className="btn btn-secondary" onClick={startTutorial}>
              💡 Hint
            </button>
            <button className="btn btn-primary" onClick={handleCheck}>
              Check
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
