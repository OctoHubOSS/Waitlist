export default function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(88, 166, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(35, 134, 54, 0.2) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(88, 166, 255, 0.1) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(88, 166, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />
    </div>
  );
}
