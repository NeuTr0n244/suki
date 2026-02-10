'use client';

export default function SparkleDecoration() {
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 8 + 8,
    delay: Math.random() * 5,
    duration: Math.random() * 5 + 10,
    opacity: Math.random() * 0.2 + 0.1,
    color: Math.random() > 0.5 ? '#c084fc' : '#f472b6',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute sparkle-float"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            backgroundColor: sparkle.color,
            opacity: sparkle.opacity,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
            borderRadius: '50%',
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`,
          }}
        />
      ))}
    </div>
  );
}
