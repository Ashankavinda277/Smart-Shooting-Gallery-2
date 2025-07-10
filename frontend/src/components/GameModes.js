// Removed duplicate GameModes component. Use pages/GameModesPage.js instead.


const GameModesWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background-image: url('https://images.pexels.com/photos/6092077/pexels-photo-6092077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'); /* Replace with actual image URL */
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  background: rgb(0, 0, 0); /* Dark overlay for better text visibility */
  padding: 2rem;
  text-align: center;
  color: white;
  border-radius: 10px;
`;

const ModesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 40px 0;
`;

const ModeButton = styled.button`
  width: 200px;
  padding: 15px;
  margin: 0 auto;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(to right, #27ae60, #219a52);
  color: white;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const BackButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #2c3e50;
  color: white;
  cursor: pointer;

  &:hover {
    background: #34495e;
  }
`;

export default GameModes;