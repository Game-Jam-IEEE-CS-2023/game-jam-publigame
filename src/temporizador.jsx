import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const TemporizadorContenedor = styled.div`
  font-family: 'Arial', sans-serif;
  text-align: center;
  margin: 50px;
`;

const AnimacionCirculo = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
`;

const CirculoExterior = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${AnimacionCirculo} 0.5s ease-in-out;
`;

const TextoTemporizador = styled.div`
  font-size: 24px;
  color: #fff;
`;

const Temporizador = () => {
  const [tiempoRestante, setTiempoRestante] = useState(60);

  useEffect(() => {
    let temporizadorInterval;

    if (tiempoRestante > 0) {
      temporizadorInterval = setInterval(() => {
        setTiempoRestante((prevTiempo) => prevTiempo - 1);
      }, 1000);
    } else {
      clearInterval(temporizadorInterval);
      // Lógica adicional cuando el temporizador llega a cero
    }

    return () => clearInterval(temporizadorInterval);
  }, [tiempoRestante]);

  return (
    <TemporizadorContenedor>
      <CirculoExterior>
        <TextoTemporizador>{tiempoRestante}s</TextoTemporizador>
      </CirculoExterior>
    </TemporizadorContenedor>
  );
};

export default Temporizador;
