import { useEffect, useRef } from "react";

class Star {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.radius = Math.random() * 1.3 + 0.5;
    this.speed = Math.random() * 0.4 + 0.1;
  }

  move(canvasHeight, canvasWidth) {
    this.y += this.speed;
    if (this.y > canvasHeight) {
      this.y = 0;
      this.x = Math.random() * canvasWidth;
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(0, 255, 225, 0.7)";
    context.fill();
  }
}

export default function StarBackground() {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = (count = 120) => {
      starsRef.current = [];
      for (let i = 0; i < count; i++) {
        starsRef.current.push(new Star(canvas.width, canvas.height));
      }
    };

    const animateStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      starsRef.current.forEach((star) => {
        star.move(canvas.height, canvas.width);
        star.draw(ctx);
      });
      requestAnimationFrame(animateStars);
    };

    resizeCanvas();
    initStars();
    animateStars();

    const handleResize = () => {
      resizeCanvas();
      initStars();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="star-canvas"
    />
  );
}
