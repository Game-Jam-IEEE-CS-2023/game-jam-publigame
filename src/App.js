import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faFlag,faClock } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useRef } from 'react';
import AudioPlayer from 'react-audio-player';

const columnas = 25;
const filas = 12;

const ChessBoard = () => {
  const urlMusica = 'https://soundcloud.com/sapiz-cloe/sets/musica-de-videojuegos-battle?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing';

  const cantidadBombas = (1 / 100) * filas * columnas;
  const [celdaAbierta, setCeldaAbierta] = useState(Array(filas * columnas).fill(false));
  const [banderaPuesta, setBanderaPuesta] = useState(Array(filas * columnas).fill(false));
  const [bombas, setBombas] = useState([]);
  const [posicionJugador, setPosicionJugador] = useState({ fila: 0, columna: 0 });
  const juegoIniciado = useRef(false);
  const juegoTerminado = useRef(false);
  const [tiempoRestante, setTiempoRestante] = useState(100); // 5 minutos en segundos
  const [primerMovimiento, setPrimerMovimiento] = useState(false);
  const [mensajeTiempoAgotado, setMensajeTiempoAgotado] = useState(null);
  const [mensajePerdida, setMensajePerdida] = useState(null);
  const [juegoPausado, setJuegoPausado] = useState(false);
  const [historialJuegos, setHistorialJuegos] = useState([]);

  const estiloTiempo = {
    position: 'relative',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderRadius: '5px',
    margin: '20px auto',
    width: '200px',
    backgroundColor: '#333',
    color: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  };

 

  const estiloIconoTemporizador = {
    marginRight: '10px',
  };

  useEffect(() => {
    if (juegoIniciado.current && !juegoTerminado.current && tiempoRestante > 0) {
      const intervalo = setInterval(() => {
        setTiempoRestante((prevTiempo) => prevTiempo - 1);
      }, 1000);

      // Limpieza del intervalo cuando el componente se desmonta o el juego termina
      return () => clearInterval(intervalo);
    } else if (tiempoRestante === 0) {
      setMensajeTiempoAgotado('¡Tiempo agotado! ¡Has perdido!');
      
      juegoTerminado.current = true;
    }
  }, [juegoIniciado.current, juegoTerminado.current, tiempoRestante]);



  const obtenerEstiloTiempo = () => {
    const porcentajeRestante = (tiempoRestante / 100) * 100;

    if (porcentajeRestante > 50) {
      return 'tiempo-verde';
    } else if (porcentajeRestante > 20) {
      return 'tiempo-amarillo';
    } else if (porcentajeRestante > 10) {
      return 'tiempo-naranja';
    } else {
      return 'tiempo-rojo';
    }
  };


  useEffect(() => {
    if (!juegoIniciado.current) {
      const generarBombasAleatorias = () => {
        const posicionesAleatorias = [];
        while (posicionesAleatorias.length < cantidadBombas) {
          const filaAleatoria = Math.floor(Math.random() * filas);
          const columnaAleatoria = Math.floor(Math.random() * columnas);
          const posicion = `${filaAleatoria}-${columnaAleatoria}`;
          if (!posicionesAleatorias.includes(posicion)) {
            posicionesAleatorias.push(posicion);
          }
        }
        return posicionesAleatorias;
      };

      const bombasGeneradas = generarBombasAleatorias();

      const probabilidadUltimasCeldasAbiertas = Math.random();
      let numeroUltimasCeldasAbiertas = 0;

      if (probabilidadUltimasCeldasAbiertas <= 0.5) {
        numeroUltimasCeldasAbiertas = 6;
      } else if (probabilidadUltimasCeldasAbiertas <= 0.75) {
        numeroUltimasCeldasAbiertas = 7;
      } else {
        numeroUltimasCeldasAbiertas = 8;
      }

      const totalCeldas = filas * columnas;
      let celdasAbiertas = 0;

      setCeldaAbierta((prevCeldaAbierta) => {
        const nuevaCeldaAbierta = [...prevCeldaAbierta];
        for (let i = totalCeldas - 1; i >= 0; i--) {
          if (celdasAbiertas < numeroUltimasCeldasAbiertas) {
            const fila = Math.floor(i / columnas);
            const columna = i % columnas;
            if (!bombasGeneradas.includes(`${fila}-${columna}`)) {
              nuevaCeldaAbierta[i] = true;
              celdasAbiertas++;
            }
          }
        }
        return nuevaCeldaAbierta;
      });

      setBombas(bombasGeneradas);
      setPosicionJugador({ fila: filas - 1, columna: Math.floor(columnas / 2) }); // Posicionar al jugador en la última fila
      juegoIniciado.current = true;

    }
  }, [cantidadBombas]);

useEffect(() => {
  const manejarPresionTecla = (evento) => {
    if (juegoTerminado.current) {
      return;
    }
    if (!primerMovimiento) {
      // Iniciar el contador de tiempo en el primer movimiento
      setPrimerMovimiento(true);
    }

    const { key } = evento;
    setPosicionJugador((prevPosicion) => {
      let newRow = prevPosicion.fila;
      let newCol = prevPosicion.columna;

      switch (key) {
        case 'ArrowUp':
          newRow = Math.max(0, newRow - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(filas - 1, newRow + 1);
          break;
        case 'ArrowLeft':
          newCol = Math.max(0, newCol - 1);
          break;
        case 'ArrowRight':
          newCol = Math.min(columnas - 1, newCol + 1);
          break;
        default:
          break;
      }
      
      if (bombas.includes(`${newRow}-${newCol}`)) {
        setMensajePerdida('¡Boom! Has encontrado una bomba y has perdido el juego. 😢');
        juegoTerminado.current = true;
        // Tratar la pérdida del juego aquí
      } else {
        if (newRow === 0) {
          // El jugador ha llegado a la parte superior del tablero, ganó el juego
          setMensajePerdida('¡Felicidades! Saliste del bosque 🥇🥇🥇. 🎉');
          juegoTerminado.current = true;
        } else {
          return { fila: newRow, columna: newCol };
        }
      }
    });
  };

  window.addEventListener('keydown', manejarPresionTecla);
  return () => {
    window.removeEventListener('keydown', manejarPresionTecla);
  };
}, [bombas, juegoTerminado,primerMovimiento]);
  
  const manejarClicCelda = (indice, clicDerecho) => {
    if (celdaAbierta[indice] || juegoTerminado.current) {
      return;
    }

    const nuevaBanderaPuesta = [...banderaPuesta];
    if (clicDerecho) {
      nuevaBanderaPuesta[indice] = !banderaPuesta[indice];
      setBanderaPuesta(nuevaBanderaPuesta);
    } else {
      if (nuevaBanderaPuesta[indice]) {
        nuevaBanderaPuesta[indice] = false;
        setBanderaPuesta(nuevaBanderaPuesta);
      } else {
        const nuevaCeldaAbierta = [...celdaAbierta];
        nuevaCeldaAbierta[indice] = true;
        setCeldaAbierta(nuevaCeldaAbierta);

        if (bombas.includes(`${Math.floor(indice / columnas)}-${indice % columnas}`)) {
          setMensajePerdida('¡Boom! Has encontrado una bomba y has perdido el juego. 😢');
          juegoTerminado.current = true;
          return;
        }

        if (contarBombasAdyacentes(Math.floor(indice / columnas), indice % columnas) === 0) {
          const celdasPorAbrir = [{ fila: Math.floor(indice / columnas), columna: indice % columnas }];

          while (celdasPorAbrir.length > 0) {
            const { fila, columna } = celdasPorAbrir.pop();

            const direcciones = [
              [-1, -1], [-1, 0], [-1, 1],
              [0, -1], [0, 1],
              [1, -1], [1, 0], [1, 1]
            ];

            for (const [df, dc] of direcciones) {
              const nuevaFila = fila + df;
              const nuevaColumna = columna + dc;
              const nuevoIndice = nuevaFila * columnas + nuevaColumna;

              if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas &&
                !nuevaCeldaAbierta[nuevoIndice] && !banderaPuesta[nuevoIndice]) {
                nuevaCeldaAbierta[nuevoIndice] = true;
                setCeldaAbierta(nuevaCeldaAbierta);

                if (contarBombasAdyacentes(nuevaFila, nuevaColumna) === 0) {
                  celdasPorAbrir.push({ fila: nuevaFila, columna: nuevaColumna });
                }
              }
            }
          }
        }
      }
    }
  };

  const manejarDobleClicCelda = (indice) => {
    if (!celdaAbierta[indice] || juegoTerminado.current) {
      return;
    }

    const bombasAdyacentes = contarBombasAdyacentes(Math.floor(indice / columnas), indice % columnas);
    const banderasAdyacentes = contarBanderasAdyacentes(Math.floor(indice / columnas), indice % columnas);

    if (bombasAdyacentes > 0 && bombasAdyacentes === banderasAdyacentes) {
      const nuevaCeldaAbierta = [...celdaAbierta];
      revelarCeldasAdyacentes(Math.floor(indice / columnas), indice % columnas, nuevaCeldaAbierta);

      setCeldaAbierta(nuevaCeldaAbierta);
        // Verificar si alguna de las celdas reveladas contiene una bomba
    if (nuevaCeldaAbierta.some((value, index) => value && bombas.includes(`${Math.floor(index / columnas)}-${index % columnas}`))) {
      setMensajePerdida('¡Boom! Has encontrado una bomba y has perdido el juego. 😢');
      juegoTerminado.current = true;
      return;
    }
    }
  };

  const contarBombasAdyacentes = (fila, columna) => {
    const direcciones = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    let contador = 0;

    for (const [df, dc] of direcciones) {
      const nuevaFila = fila + df;
      const nuevaColumna = columna + dc;
      if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas) {
        if (bombas.includes(`${nuevaFila}-${nuevaColumna}`)) {
          contador++;
        }
      }
    }

    return contador;
  };

  const contarBanderasAdyacentes = (fila, columna) => {
    const direcciones = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    let contador = 0;

    for (const [df, dc] of direcciones) {
      const nuevaFila = fila + df;
      const nuevaColumna = columna + dc;
      if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas) {
        if (banderaPuesta[nuevaFila * columnas + nuevaColumna]) {
          contador++;
        }
      }
    }

    return contador;
  };

  const revelarCeldasAdyacentes = (fila, columna, nuevaCeldaAbierta) => {
    const direcciones = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [df, dc] of direcciones) {
      const nuevaFila = fila + df;
      const nuevaColumna = columna + dc;
      const nuevoIndice = nuevaFila * columnas + nuevaColumna;

      if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas &&
        !nuevaCeldaAbierta[nuevoIndice] && !banderaPuesta[nuevoIndice]) {
        nuevaCeldaAbierta[nuevoIndice] = true;
        if (contarBombasAdyacentes(nuevaFila, nuevaColumna) === 0) {
          revelarCeldasAdyacentes(nuevaFila, nuevaColumna, nuevaCeldaAbierta);
        }
      }
    }
  };

  const iniciarNuevoJuego = () => {
    setJuegoPausado(false);
    setHistorialJuegos([]);
    // ... (resto de la lógica de reiniciar el juego)
  };

  const celdas = [];
  for (let fila = 0; fila < filas; fila++) {
    for (let columna = 0; columna < columnas; columna++) {
      const indice = fila * columnas + columna;
      const celdaAbiertaActual = celdaAbierta[indice];
      const banderaPuestaActual = banderaPuesta[indice];
      const esPosicionJugador = posicionJugador && posicionJugador.fila === fila && posicionJugador.columna === columna; 
      const simbolo = bombas.includes(`${fila}-${columna}`) ? faBomb : '';
      const numero = contarBombasAdyacentes(fila, columna);
  
      const estiloCelda = {
        backgroundColor: celdaAbiertaActual ? '#e2e2e2' : '#bafbba',
        border: '2px solid black',
        position: 'relative',
        alignContent:'center',
        textAlign:'center',
        
      };
  
      if (esPosicionJugador) {
        estiloCelda.zIndex = 2;
      }
  
      celdas.push(
        <div
          key={`${fila}-${columna}`}
          className={`celda ${banderaPuestaActual ? 'bandera' : ''} ${esPosicionJugador ? 'jugador' : ''}`}
          style={estiloCelda}
          onClick={() => manejarClicCelda(indice, false)}
          onDoubleClick={() => manejarDobleClicCelda(indice)}
          onContextMenu={(evento) => {
            evento.preventDefault();
            manejarClicCelda(indice, true);
          }}
        >
          {/* Contenedor para el jugador */}
          {esPosicionJugador && (
  <div className="jugador-container" style={{ position: 'absolute', top: 0, left: 0 }}>
    {/* Utiliza la etiqueta img para la imagen del jugador */}
    <img
      src="https://e7.pngegg.com/pngimages/844/566/png-clipart-goku-gohan-dragon-ball-z-ultimate-battle-22-vegeta-super-saiya-son-game-cartoon.png"  // Reemplaza con la ruta de tu imagen
      alt="Jugador"
      style={{ width: '49px', height: '49px' }}  // Ajusta el tamaño según tus necesidades
    />
  </div>
)}
  
          <span>
            {banderaPuestaActual ? (
              <FontAwesomeIcon icon={faFlag} />
            ) : celdaAbiertaActual ? (
              simbolo !== '' ? (
                <FontAwesomeIcon icon={simbolo} />
              ) : numero > 0 ? (
                numero
              ) : (
                ''
              )
            ) : (
              ' '
            )}
          </span>
        </div>
      );
    }
  }

return (
  <div className='todo' style={{
    backgroundImage: 'url(https://img.freepik.com/vector-premium/fondo-pixelado_634779-89.jpg?w=1800)',
    backgroundSize: 'cover',  // Ajusta el tamaño de la imagen para cubrir el área completa
    backgroundPosition: 'center',  // Centra la imagen
    backgroundRepeat: 'no-repeat'  // Evita que la imagen se repita
  }}>
  {/* Reproductor de audio */}
  <AudioPlayer
  src={urlMusica}
  autoPlay={true}
  controls
  style={{ display: 'none' }}
/>


  {/* Contador de tiempo mejorado con estilo dinámico */}
  <div style={{
    paddingTop:'40px',
  }}>
  <div className={`tiempo ${obtenerEstiloTiempo()}`} style={estiloTiempo}>
  <FontAwesomeIcon icon={faClock} style={estiloIconoTemporizador} />
  <span> Tiempo restante: {Math.floor(tiempoRestante / 60)}:{tiempoRestante % 60 < 10 ? '0' : ''}{tiempoRestante % 60}</span>
</div></div>
    {/* Tablero de ajedrez */}
    <div className="tablero-ajedrez" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columnas}, 50px)`,
      gridTemplateRows: `repeat(${filas}, 50px)`,
      paddingTop: '10px', 
  paddingBottom: '50px',
  alignContent:'center',
  paddingLeft:'10%',
    }}>
       {celdas}
    </div>
    <span className="mensaje-tiempo-agotado">{mensajeTiempoAgotado}</span>
  
  {/* Contenedor para el mensaje de pérdida */}
  {mensajePerdida && (
        <div
          className="contenedor-mensaje-perdida"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            color: '#fff',
            fontSize: '1.5rem',
          }}
        >
          <span className="mensaje-perdida">{mensajePerdida}</span>
        </div>
        )}
        <div>
        <button onClick={() => setJuegoPausado(!juegoPausado)}>
          {juegoPausado ? 'Continuar' : 'Pausar'}
        </button>
        <button onClick={iniciarNuevoJuego}>Iniciar Nuevo Juego</button>
      </div>
      {/* ... (otros elementos) */}
      <div>
        <h2>Historial de Juegos</h2>
        <ul>
          {historialJuegos.map((historial, index) => (
            <li key={index}>{historial}</li>
          ))}
        </ul>
      </div>
  </div>
);
        }

export default ChessBoard;