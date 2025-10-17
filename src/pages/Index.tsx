import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Fly {
  id: number;
  x: number;
  y: number;
  caught: boolean;
}

interface HighScore {
  score: number;
  date: string;
}

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [flies, setFlies] = useState<Fly[]>([]);
  const [catchAnimation, setCatchAnimation] = useState<{ x: number; y: number } | null>(null);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showScores, setShowScores] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedScores = localStorage.getItem('frogGameScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft]);

  useEffect(() => {
    if (gameStarted) {
      const spawnInterval = setInterval(() => {
        spawnFly();
      }, 1500);
      return () => clearInterval(spawnInterval);
    }
  }, [gameStarted]);

  const spawnFly = () => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const newFly: Fly = {
      id: Date.now(),
      x: Math.random() * (gameArea.width - 60),
      y: Math.random() * (gameArea.height - 60),
      caught: false,
    };
    
    setFlies((prev) => [...prev, newFly]);

    setTimeout(() => {
      setFlies((prev) => prev.filter((f) => f.id !== newFly.id));
    }, 4000);
  };

  const catchFly = (fly: Fly) => {
    if (fly.caught) return;

    setFlies((prev) =>
      prev.map((f) => (f.id === fly.id ? { ...f, caught: true } : f))
    );
    
    setScore((prev) => prev + 10);
    setCatchAnimation({ x: fly.x, y: fly.y });

    setTimeout(() => {
      setFlies((prev) => prev.filter((f) => f.id !== fly.id));
      setCatchAnimation(null);
    }, 400);

    toast({
      title: '+10 очков! 🎯',
      duration: 1000,
    });
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setFlies([]);
    setShowScores(false);
  };

  const endGame = () => {
    setGameStarted(false);
    
    const newScore: HighScore = {
      score,
      date: new Date().toLocaleDateString('ru-RU'),
    };
    
    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setHighScores(updatedScores);
    localStorage.setItem('frogGameScores', JSON.stringify(updatedScores));

    toast({
      title: '🎮 Игра окончена!',
      description: `Твой счёт: ${score} очков`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-green-50 to-green-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold text-green-600 mb-2 font-playful">
            🐸 Лягушка-Ловушка
          </h1>
          <p className="text-xl md:text-2xl text-green-700 font-medium">
            Лови мух языком и набирай очки!
          </p>
        </div>

        {!gameStarted && !showScores && (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="flex justify-center mb-8">
              <img 
                src="https://cdn.poehali.dev/projects/b1f2e5b5-4088-4130-8f34-8c68b3ce47f1/files/15519118-13d9-4daa-a138-822d5fd8fd6d.jpg"
                alt="Frog"
                className="w-64 h-64 object-contain animate-bounce-custom"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={startGame}
                size="lg"
                className="text-2xl px-8 py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Icon name="Play" className="mr-2" size={28} />
                Начать игру
              </Button>
              
              <Button 
                onClick={() => setShowScores(true)}
                size="lg"
                variant="secondary"
                className="text-2xl px-8 py-6 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Icon name="Trophy" className="mr-2" size={28} />
                Рекорды
              </Button>
            </div>

            <Card className="max-w-md mx-auto bg-white/80 backdrop-blur border-4 border-green-300">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center justify-center gap-2">
                  <Icon name="Info" size={24} />
                  Как играть
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>Кликай на мух, чтобы поймать их</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-2xl">⏱️</span>
                  <span>У тебя есть 30 секунд</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-2xl">🏆</span>
                  <span>Каждая муха = 10 очков</span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {showScores && !gameStarted && (
          <div className="animate-scale-in">
            <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur border-4 border-purple-300">
              <CardHeader>
                <CardTitle className="text-3xl text-purple-700 flex items-center justify-center gap-3">
                  <Icon name="Trophy" size={32} />
                  Таблица рекордов
                </CardTitle>
              </CardHeader>
              <CardContent>
                {highScores.length === 0 ? (
                  <p className="text-center text-gray-500 text-lg py-8">
                    Пока нет рекордов. Сыграй первым! 🎮
                  </p>
                ) : (
                  <div className="space-y-3">
                    {highScores.map((record, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200 hover:scale-105 transition-transform"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-bold text-purple-600 font-playful">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="text-2xl font-bold text-purple-800">
                              {record.score} очков
                            </p>
                            <p className="text-sm text-purple-600">{record.date}</p>
                          </div>
                        </div>
                        {index === 0 && <span className="text-4xl">🏆</span>}
                        {index === 1 && <span className="text-4xl">🥈</span>}
                        {index === 2 && <span className="text-4xl">🥉</span>}
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  onClick={() => setShowScores(false)}
                  className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white text-xl py-6"
                  size="lg"
                >
                  <Icon name="ArrowLeft" className="mr-2" />
                  Назад
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gameStarted && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/80 backdrop-blur p-4 rounded-2xl border-4 border-green-300">
              <div className="flex items-center gap-4">
                <div className="text-center bg-green-500 text-white px-6 py-3 rounded-xl">
                  <p className="text-sm font-medium">Счёт</p>
                  <p className="text-3xl font-bold font-playful">{score}</p>
                </div>
                <div className="text-center bg-orange-500 text-white px-6 py-3 rounded-xl">
                  <p className="text-sm font-medium">Время</p>
                  <p className="text-3xl font-bold font-playful">{timeLeft}с</p>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setGameStarted(false);
                  setFlies([]);
                }}
                variant="destructive"
                className="text-lg px-6 py-6"
              >
                <Icon name="X" className="mr-2" />
                Завершить
              </Button>
            </div>

            <div 
              ref={gameAreaRef}
              className="relative bg-gradient-to-b from-sky-200 to-green-200 rounded-3xl border-4 border-green-400 overflow-hidden shadow-2xl"
              style={{ height: '500px' }}
            >
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <img 
                  src="https://cdn.poehali.dev/projects/b1f2e5b5-4088-4130-8f34-8c68b3ce47f1/files/15519118-13d9-4daa-a138-822d5fd8fd6d.jpg"
                  alt="Frog"
                  className="w-32 h-32 object-contain"
                />
              </div>

              {flies.map((fly) => (
                <div
                  key={fly.id}
                  className="absolute cursor-pointer hover:scale-125 transition-transform"
                  style={{ left: fly.x, top: fly.y }}
                  onClick={() => catchFly(fly)}
                >
                  {!fly.caught && (
                    <img 
                      src="https://cdn.poehali.dev/projects/b1f2e5b5-4088-4130-8f34-8c68b3ce47f1/files/d6629e15-8b48-4fbe-a05d-a0da4dcb4e11.jpg"
                      alt="Fly"
                      className="w-12 h-12 object-contain animate-fly-move"
                    />
                  )}
                </div>
              ))}

              {catchAnimation && (
                <div
                  className="absolute pointer-events-none"
                  style={{ left: catchAnimation.x, top: catchAnimation.y }}
                >
                  <div className="relative">
                    <div className="absolute w-1 h-24 bg-pink-500 origin-bottom animate-tongue-catch" 
                         style={{ left: '50%', bottom: 0, transform: 'translateX(-50%)' }} 
                    />
                    <span className="text-4xl animate-sparkle">✨</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
