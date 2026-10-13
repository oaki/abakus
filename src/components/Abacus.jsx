import Rod from './Rod';

const Abacus = ({ rodsState, onRodChange }) => {
  return (
    <div className="abacus-container">
      <div className="abacus-rods">
        {rodsState.map((rodState, index) => (
          <Rod 
            key={index} 
            rodState={rodState} 
            onChange={(newRodState) => onRodChange(index, newRodState)} 
          />
        ))}
      </div>
    </div>
  );
};

export default Abacus;
