import { useMemo } from 'react';

interface PixelDomoProps {
  frame: 'walk1' | 'walk2' | 'knock1' | 'knock2' | 'wave1' | 'wave2';
  size?: number;
  className?: string;
}

export const PixelDomo = ({ frame, size = 120, className = '' }: PixelDomoProps) => {
  const colorMap: Record<string, string> = {
    'K': '#18191B',
    'W': '#ECEBE9',
    'P': '#FF7597',
  };

  const frames: Record<string, string[]> = {
    walk1: [
      "....KKKKKK..........",
      "...KWWWWWWK.........",
      "..KWWWWWWWWK........",
      ".KWWKWWWWWWK........",
      ".KWWKKWWWWK.........",
      ".KWWWWWWWWK.........",
      "..KWWWWWWK..........",
      "...KKKKKK...........",
      "....KKKK............",
      "...KWWWWK...........",
      "..KWWWWWWK..........",
      "..KWWWWWWK.K........",
      "..KWWWWWWKK.........",
      "...KKKKKK...........",
      "....K..K............",
      "....K..K............",
      "....KK.KK..........."
    ],
    walk2: [
      "....KKKKKK..........",
      "...KWWWWWWK.........",
      "..KWWWWWWWWK........",
      ".KWWKWWWWWWK........",
      ".KWWKKWWWWK.........",
      ".KWWWWWWWWK.........",
      "..KWWWWWWK..........",
      "...KKKKKK...........",
      "....KKKK............",
      "...KWWWWK...........",
      "..KWWWWWWK..........",
      "..KWWWWWWK..........",
      "..KWWWWWWK.K........",
      "...KKKKKK.K.........",
      "....KK..KK..........",
      "....K....K..........",
      "....K....KK........."
    ],
    knock1: [
      "......KKKKKK........",
      "....KKWWWWWWKK......",
      "...KWWWWWWWWWWK.....",
      "..KWWWWWWWWWWWWK....",
      "..KWWWWWWWWWWWWK....",
      "..KWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWK.....",
      "....KKKKKKKKKK......",
      ".....KWWWWWWK.......",
      "....KWWWWWWWWK......",
      "...KWWWWWWWWWWK.....",
      "...KWWWWWWWWWWK..KK.",
      "...KWWWWWWWWWWK.K.K.",
      "....KKKKKKKKKK...KK.",
      ".....K......K.......",
      ".....K......K.......",
      "....KK.....KK......."
    ],
    knock2: [
      "......KKKKKK........",
      "....KKWWWWWWKK......",
      "...KWWWWWWWWWWK.....",
      "..KWWWWWWWWWWWWK....",
      "..KWWWWWWWWWWWWK....",
      "..KWWWWWWWWWWWWK....",
      "...KWWWWWWWWWWK.....",
      "....KKKKKKKKKK......",
      ".....KWWWWWWK.......",
      "....KWWWWWWWWK..KK..",
      "...KWWWWWWWWWWKK.K..",
      "...KWWWWWWWWWWK..K..",
      "...KWWWWWWWWWWK.....",
      "....KKKKKKKKKK......",
      ".....K......K.......",
      ".....K......K.......",
      "....KK.....KK......."
    ],
    wave1: [
      "......KKKKKK........",
      "....KKWWWWWWKK......",
      "...KWWWWWWWWWWK.....",
      "..KWWKWWWWWWKWWK....",
      ".KWWKKWWWWWWKKWWK...",
      ".KWWWWWWWWWWWWWWK...",
      ".KWWWPWWWWWWPWWWK...",
      "..KWWWWWWWWWWWWK....",
      "...KKKKKKKKKKKK.....",
      "....KWWWWWWWWK......",
      "...KWWWWWWWWWWK.....",
      "..KKWWWWWWWWWWKK....",
      "..K.KWWWWWWWWK.K....",
      "....KKKKKKKKKK......",
      ".....K......K.......",
      ".....K......K.......",
      "....KK.....KK......."
    ],
    wave2: [
      "......KKKKKK...KK...",
      "....KKWWWWWWKK.K.K..",
      "...KWWWWWWWWWWKK....",
      "..KWWKWWWWWWKWWK....",
      ".KWWKKWWWWWWKKWWK...",
      ".KWWWWWWWWWWWWWWK...",
      ".KWWWPWWWWWWPWWWK...",
      "..KWWWWWWWWWWWWK....",
      "...KKKKKKKKKKKK.....",
      "....KWWWWWWWWK......",
      "...KWWWWWWWWWWK.....",
      "..K.KWWWWWWWWKK.....",
      "..KK.KWWWWWWK.......",
      ".....KKKKKKKK.......",
      ".....K......K.......",
      ".....K......K.......",
      "....KK.....KK......."
    ]
  };

  const currentFrame = frames[frame] || frames.walk1;
  const rows = currentFrame.length;
  const cols = currentFrame[0].length;

  const rects = useMemo(() => {
    const list: JSX.Element[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = currentFrame[r][c];
        if (char && char !== '.' && colorMap[char]) {
          list.push(
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1.05}
              height={1.05}
              fill={colorMap[char]}
            />
          );
        }
      }
    }
    return list;
  }, [frame, currentFrame]);

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={size}
      className={`select-none pointer-events-none drop-shadow-md ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {rects}
    </svg>
  );
};
