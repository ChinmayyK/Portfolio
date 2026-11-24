// How BlockVault's redaction proof sees a chunk, drawn small: 16 blocks stand in for the real 256.
// An illustration of the circuit's statement, not a screenshot of the product.

const N = 16;
const MASKED = new Set([4, 5, 6, 11]);
const BLOCK = 54, GAP = 10, X0 = 150, ROW_A = 150, ROW_B = 380;
const x = (i: number) => X0 + i * (BLOCK + GAP);
const END = x(N - 1) + BLOCK;

function Bytes({ i, y }: { i: number; y: number }) {
  // a few short strokes, so a block reads as data
  return (
    <g stroke="currentColor" strokeOpacity=".28" strokeWidth="3" strokeLinecap="round">
      {[0, 1, 2].map((r) => <line key={r} x1={x(i) + 12} x2={x(i) + 12 + ((i * 7 + r * 11) % 22) + 8} y1={y + 16 + r * 11} y2={y + 16 + r * 11} />)}
    </g>
  );
}

export default function RedactionIllustration({ labels = true }: { labels?: boolean }) {
  return (
    <svg className="redaction-svg" viewBox="0 0 1300 620" role="img" aria-label="Illustration: an original chunk and its redacted copy. Masked blocks differ, every other block is unchanged, and each version hashes to its own Merkle root.">
      {labels && (
        <g className="rd-label">
          <text x={X0} y={ROW_A - 22}>Original chunk</text>
          <text x={X0} y={ROW_B + BLOCK + 42}>Redacted copy</text>
          <text x={X0 - 22} y={(ROW_A + ROW_B + BLOCK) / 2 + 6} textAnchor="end">mask</text>
        </g>
      )}
      {Array.from({ length: N }, (_, i) => {
        const masked = MASKED.has(i);
        const mid = (ROW_A + BLOCK + ROW_B) / 2;
        return (
          <g key={i}>
            <rect className={masked ? "rd-secret" : "rd-block"} x={x(i)} y={ROW_A} width={BLOCK} height={BLOCK} rx="6" />
            <Bytes i={i} y={ROW_A} />
            <rect className={masked ? "rd-blacked" : "rd-block"} x={x(i)} y={ROW_B} width={BLOCK} height={BLOCK} rx="6" />
            {!masked && <Bytes i={i} y={ROW_B} />}
            {masked
              ? <text className="rd-bit is-on" x={x(i) + BLOCK / 2} y={mid + 8} textAnchor="middle">1</text>
              : <>
                  <line className="rd-eq" x1={x(i) + BLOCK / 2} x2={x(i) + BLOCK / 2} y1={ROW_A + BLOCK + 10} y2={mid - 24} />
                  <text className="rd-bit" x={x(i) + BLOCK / 2} y={mid + 8} textAnchor="middle">0</text>
                  <line className="rd-eq" x1={x(i) + BLOCK / 2} x2={x(i) + BLOCK / 2} y1={mid + 24} y2={ROW_B - 10} />
                </>}
          </g>
        );
      })}

      {/* each row folds into its Merkle root */}
      {[ROW_A, ROW_B].map((y, k) => (
        <g key={y}>
          <path className="rd-fold" d={`M${END + 14} ${y + BLOCK / 2} H${END + 60}`} />
          <circle className="rd-root" cx={END + 92} cy={y + BLOCK / 2} r="30" />
          <text className="rd-root-t" x={END + 92} y={y + BLOCK / 2 + 7} textAnchor="middle">{k ? "R′" : "R"}</text>
        </g>
      ))}
      {labels && (
        <g className="rd-label">
          <text x={END + 92} y={ROW_A - 22} textAnchor="middle">root</text>
          <text x={END + 92} y={ROW_B + BLOCK + 42} textAnchor="middle">root</text>
        </g>
      )}
    </svg>
  );
}
