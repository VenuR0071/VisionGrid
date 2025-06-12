import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Transformer } from 'react-konva';

const RegionSelection = ({ imageData, onRegionSelection }) => {
  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);

  const handleLineClick = (e) => {
    setSelectedLine(e.target);
  };

  const handleLineMove = (e) => {
    const line = e.target;
    line.points(e.target.points());
  };

  const handleDrawLine = (e) => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const points = e.evt.points.map((p) => [p.x, p.y]);
    const newLine = new Konva.Line({
      stroke: 'red',
      strokeWidth: 5,
      globalCompositeOperation: 'source-over',
      points,
      closed: true,
      draggable: true,
    });

    newLine.on('click', handleLineClick);
    newLine.on('dragmove', handleLineMove);
    layer.add(newLine);
    setLines([...lines, newLine]);
  };

  const handleSubmit = () => {
    const coordinates = lines.flatMap((line) => line.points());
    onRegionSelection(coordinates);
  };

  return (
    <div>
      <Stage ref={stageRef} width={500} height={500}>
        <Layer ref={layerRef}>
          <Line
            points={[0, 0, 500, 0, 500, 500, 0, 500, 0, 0]}
            stroke="black"
            strokeWidth={2}
            closed
          />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points()}
              stroke="red"
              strokeWidth={5}
              closed
              draggable
              onDragStart={handleLineClick}
              onDragMove={handleLineMove}
            />
          ))}
          {selectedLine && <Transformer boundBoxFunc={(oldBox, newBox) => newBox} />}
        </Layer>
      </Stage>
      <button onClick={handleSubmit}>Submit Region</button>
    </div>
  );
};

export default RegionSelection;