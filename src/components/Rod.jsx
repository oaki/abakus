import Bead from './Bead';

const Rod = ({ rodState, onChange }) => {
  const { topActive, bottomActiveCount } = rodState;

  const handleTopClick = () => {
    onChange({
      ...rodState,
      topActive: !topActive
    });
  };

  // For bottom beads, index 0 is the highest one, index 3 is the lowest one.
  const handleBottomClick = (index) => {
    // If we click bead at index `index` (0 to 3)
    // If it's currently active (index < bottomActiveCount)
    // We want to deactivate it and all below it, meaning bottomActiveCount becomes `index`.
    // Wait, if we deactivate the one at index, it means it goes down, so active count is `index`.
    // E.g. bottomActiveCount = 2 (index 0, 1 are active). We click index 1 (active). It goes down. 
    // Now only index 0 is active. So count = 1. -> Correct.
    
    // If it's currently inactive (index >= bottomActiveCount)
    // We want to activate it and all above it, meaning bottomActiveCount becomes `index + 1`.
    // E.g. bottomActiveCount = 1 (index 0 is active). We click index 2 (inactive). It goes up.
    // Now index 0, 1, 2 are active. So count = 3. -> Correct.

    let newCount;
    if (index < bottomActiveCount) {
      newCount = index;
    } else {
      newCount = index + 1;
    }

    onChange({
      ...rodState,
      bottomActiveCount: newCount
    });
  };

  return (
    <div className="rod-container">
      <div className="rod-line"></div>
      
      <div className="beads-top">
        <Bead isTop={true} isActive={topActive} onClick={handleTopClick} />
      </div>
      
      <div className="beads-bottom">
        {[0, 1, 2, 3].map((index) => (
          <Bead 
            key={index} 
            isTop={false} 
            isActive={index < bottomActiveCount} 
            onClick={() => handleBottomClick(index)} 
          />
        ))}
      </div>
    </div>
  );
};

export default Rod;
