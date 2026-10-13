const Bead = ({ isTop, isActive, onClick }) => {
  const beadClass = `bead ${isTop ? 'top-bead' : 'bottom-bead'} ${isActive ? 'active' : ''}`;
  
  return (
    <div className={beadClass} onClick={onClick}></div>
  );
};

export default Bead;
