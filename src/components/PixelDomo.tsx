import { useMemo, type ReactNode } from 'react';

interface PixelDomoProps {
  frame: 'walk1' | 'walk2' | 'knock1' | 'knock2' | 'wave1' | 'wave2';
  size?: number;
  className?: string;
}

export const PixelDomo = ({ frame, size = 120, className = '' }: PixelDomoProps) => {
  // Detailed 32x32 Color Palette mapping
  const colorMap: Record<string, string> = {
    'k': '#111213', // Deep charcoal outline/black fur
    'w': '#FFFFFF', // Pure white fur
    's': '#E2E8F0', // Soft shading grey
    'p': '#FF8DA1', // Soft pink cheeks
    'b': '#4E8E5E', // Green bamboo leaf accent
    'y': '#F59E0B', // Golden bell/accent
  };

  const frames: Record<string, string[]> = {
    walk1: [
      "................................",
      "..........kkkkkk................",
      "........kkkkwwwwkkkk............",
      ".......kkkkwwwwwwwwk............",
      "......kkkkwwwwwwwwwwk...........",
      ".....kwwwkkwwwwwwwwk............",
      "....kwwwkkkkwwwwwwwk............",
      "....kwwwwwwwwwkkwwwk............",
      "....kwwwwwwwwkkkwwwk............",
      "....kwwwwwwwwwwwwwwk............",
      ".....kwwwwwwwwwwwwk.............",
      "......kkwwwwwwwwkk..............",
      "........kkkkkkkk................",
      ".........kkkkkkk................",
      "........kkkkkkkkk...............",
      ".......kkkkkkkkkkk..............",
      "......kkkkkkkkkkkkk.............",
      "......kkkkkkwwwkkkk.............",
      ".....kkkkkkwwwkkkk..............",
      ".....kkkkkkkkkkkkk..............",
      ".....kkkk.....kkkk..............",
      ".....kkkk.....kkkk..............",
      "......kk.......kk..............."
    ],
    walk2: [
      "................................",
      "..........kkkkkk................",
      "........kkkkwwwwkkkk............",
      ".......kkkkwwwwwwwwk............",
      "......kkkkwwwwwwwwwwk...........",
      ".....kwwwkkwwwwwwwwk............",
      "....kwwwkkkkwwwwwwwk............",
      "....kwwwwwwwwwkkwwwk............",
      "....kwwwwwwwwkkkwwwk............",
      "....kwwwwwwwwwwwwwwk............",
      ".....kwwwwwwwwwwwwk.............",
      "......kkwwwwwwwwkk..............",
      "........kkkkkkkk................",
      ".........kkkkkkk................",
      "........kkkkkkkkk...............",
      ".......kkkkkkkkkkk..............",
      "......kkkkkkkkkkkkk.............",
      "......kkkkkkwwwkkkk.............",
      "......kkkkkkwwwkkkk.k...........",
      "......kkkkkkkkkkkkkk............",
      "......kkkk.....kkkk.............",
      "......kkkk......kk..............",
      ".......kk......................."
    ],
    knock1: [
      "................................",
      "..........kkkkkkkk..............",
      "........kkkkwwwwkkkk............",
      ".......kkkkwwwwwwwwkk...........",
      "......kkkkwwwwwwwwwwkk..........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      "......kwwwwwwwwwwwwwwk..........",
      ".......kkwwwwwwwwwwkk...........",
      ".........kkkkkkkkkk.............",
      "..........kkkkkkkk..............",
      "........kkkkkkkkkkkk............",
      ".......kkkkkwwwwkkkkk...........",
      "......kkkkkkwwwwkkkkkk..........",
      "......kkkkkkwwwwkkkkkk..........",
      "......kkkkkkwwwwkkkkkk....kk....",
      "......kkkkkkwwwwkkkkkk...kkkk...",
      ".......kkkkkkkkkkkkkk....kk.....",
      "........kkkk....kkkk............",
      "........kkkk....kkkk............",
      ".........kk......kk............."
    ],
    knock2: [
      "................................",
      "..........kkkkkkkk..............",
      "........kkkkwwwwkkkk............",
      ".......kkkkwwwwwwwwkk...........",
      "......kkkkwwwwwwwwwwkk..........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      "......kwwwwwwwwwwwwwwk..........",
      ".......kkwwwwwwwwwwkk...........",
      ".........kkkkkkkkkk.............",
      "..........kkkkkkkk..............",
      "........kkkkkkkkkkkk............",
      ".......kkkkkwwwwkkkkk...........",
      "......kkkkkkwwwwkkkkkk....kk....",
      "......kkkkkkwwwwkkkkkk...kkkk...",
      "......kkkkkkwwwwkkkkkk....kk....",
      "......kkkkkkwwwwkkkkkk..........",
      ".......kkkkkkkkkkkkkk............",
      "........kkkk....kkkk............",
      "........kkkk....kkkk............",
      ".........kk......kk............."
    ],
    wave1: [
      "................................",
      ".........kkkk..kkkk.............",
      "........kkkkkkkkkkkk............",
      ".......kwwwwwwwwwwwwk...........",
      "......kwwwwwwwwwwwwwwk..........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwkkkwwwwwwkkkwwk.........",
      ".....kwwkkkkwwwwkkkkwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwppppwwppppwwwk.........",
      ".....kwwwwwwwwkkwwwwwwk.........",
      "......kwwwwwwwwwwwwwwk..........",
      ".......kkwwwwwwwwwwkk...........",
      ".........kkkkkkkkkk.............",
      "..........kkkkkkkk..............",
      "........kkkkkkkkkkkk............",
      ".......kkkkkwwwwkkkkk...........",
      "......kkkkkkwwwwkkkkkk..........",
      "......kkkkkkwwwwkkkkkk..........",
      "......kkkkkkwwwwkkkkkk..........",
      ".......kkkkkkkkkkkkkk...........",
      "........kkkk....kkkk............",
      "........kkkk....kkkk............",
      ".........kk......kk............."
    ],
    wave2: [
      "..........................kk....",
      ".........kkkk..kkkk......kkkk...",
      "........kkkkkkkkkkkk......kk....",
      ".......kwwwwwwwwwwwwk...........",
      "......kwwwwwwwwwwwwwwk..........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwkkkwwwwwwkkkwwk.........",
      ".....kwwkkkkwwwwkkkkwwk.........",
      ".....kwwwwwwwwwwwwwwwwk.........",
      ".....kwwwppppwwppppwwwk.........",
      ".....kwwwwwwwwkkwwwwwwk.........",
      "......kwwwwwwwwwwwwwwk..........",
      ".......kkwwwwwwwwwwkk...........",
      ".........kkkkkkkkkk.............",
      "..........kkkkkkkk..............",
      "........kkkkkkkkkkkk............",
      ".......kkkkkwwwwkkkkk...........",
      "......kkkkkkwwwwkkkkkk..........",
      "......kkkkkkwwwwkkkkkk..........",
      "......kkkkkkwwwwkkkk............",
      ".......kkkkkkkkkk...............",
      "........kkkk....................",
      "........kkkk....................",
      ".........kk....................."
    ]
  };

  const currentFrame = frames[frame] || frames.walk1;
  const rows = currentFrame.length;
  const cols = currentFrame[0].length;

  const rects = useMemo(() => {
    const list: ReactNode[] = [];
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
