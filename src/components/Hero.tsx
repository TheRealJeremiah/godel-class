/** Hand-drawn-ish ouroboros: a snake of code eating its own tail. */
export function Hero() {
  // A ring centred on (300, 140), radius 100, with a gap on the left for the head.
  // It runs clockwise from the neck (upper left) all the way round to the tail (lower left).
  const body = 'M 206 105.8 A 100 100 0 1 1 206 174.2'
  const code = 'function g(x){for(const p of allProofs())if(proves(p,`¬halts(${x},${x})`))return} · g(g)'
  return (
    <svg className="hero" viewBox="0 0 600 270" role="img" aria-label="A snake made of code, eating its own tail">
      <defs>
        <path id="snake-path" d={body} />
      </defs>
      <path d="M 90 250 q 20 -6 40 0 t 40 0 M 430 252 q 20 -6 40 0 t 40 0" className="ink thin no-fill" />
      {/* body: dark outline, then pale fill */}
      <path d={body} className="ink no-fill" strokeWidth="42" />
      <path d={body} className="snake-fill no-fill" strokeWidth="36" />
      <text className="snake-code">
        <textPath href="#snake-path" startOffset="1%">
          {code}
        </textPath>
      </text>
      {/* tail tip, disappearing into the mouth */}
      <path d="M 188 172 L 206 196 L 224 172 Z" className="snake-fill ink" strokeWidth="3" strokeLinejoin="round" />
      {/* head */}
      <g transform="translate(206 138)">
        <ellipse cx="0" cy="0" rx="30" ry="40" className="snake-fill ink" strokeWidth="3" />
        <circle cx="-11" cy="-12" r="7.5" className="eye" />
        <circle cx="-12" cy="-10" r="3.2" className="pupil" />
        <circle cx="11" cy="-12" r="7.5" className="eye" />
        <circle cx="10" cy="-10" r="3.2" className="pupil" />
        <path d="M -16 22 q 16 14 32 0" className="ink" fill="none" strokeWidth="3" strokeLinecap="round" />
        <circle cx="-5" cy="6" r="1.6" className="pupil" />
        <circle cx="5" cy="6" r="1.6" className="pupil" />
      </g>
      {/* thought bubble */}
      <g className="bubble">
        <circle cx="150" cy="84" r="4" className="paper ink" strokeWidth="2" />
        <circle cx="132" cy="66" r="6.5" className="paper ink" strokeWidth="2" />
        <rect x="20" y="16" width="150" height="36" rx="18" className="paper ink" strokeWidth="2.5" />
        <text x="95" y="40" textAnchor="middle" className="bubble-text">
          do I halt? 🤔
        </text>
      </g>
      <text x="300" y="151" textAnchor="middle" className="center-mark">
        ⊬ G
      </text>
    </svg>
  )
}
