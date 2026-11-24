// Architecture diagrams, built from HTML so they stay readable at any width and to screen readers.

export function LinkAllDiagram() {
  const shells = [
    ["macOS", "Swift · SwiftUI", "C-FFI · Unix socket"],
    ["Android", "Kotlin · Compose", "JNI"],
    ["Windows", "C# · WinUI 3", "C-FFI · named pipe"],
    ["Linux", "Rust · GTK 4", "Unix socket"],
  ];
  return (
    <figure className="dg" aria-label="Link All architecture">
      <ul className="dg-row dg-row--4">
        {shells.map(([os, ui, bind]) => (
          <li key={os} className="dg-node">
            <span className="dg-name">{os}</span>
            <span className="dg-sub">{ui}</span>
            <span className="dg-wire"><span className="dg-bind">{bind}</span></span>
          </li>
        ))}
      </ul>
      <div className="dg-node dg-node--core">
        <span className="dg-name">linkall-core</span>
        <span className="dg-sub">Rust · discovery · pairing · sessions · transfer · clipboard</span>
      </div>
      <div className="dg-link"><span className="dg-bind">mDNS discovery, then X25519 · HKDF-SHA256 · AES-256-GCM over the local network</span></div>
      <div className="dg-node dg-node--peer">
        <span className="dg-name">Another device</span>
        <span className="dg-sub">The same core, behind its own native app</span>
      </div>
      <figcaption className="t-small">One core, four native shells, each bound the way its platform prefers.</figcaption>
    </figure>
  );
}

export function FleetDiagram() {
  return (
    <figure className="dg" aria-label="FleetDesk architecture, simplified">
      <ul className="dg-row dg-row--2">
        <li className="dg-node"><span className="dg-name">Web app</span><span className="dg-sub">React · employees and admins</span><span className="dg-wire"><span className="dg-bind">REST · Socket.IO</span></span></li>
        <li className="dg-node"><span className="dg-name">Mobile app</span><span className="dg-sub">React Native · Expo · employees and drivers</span><span className="dg-wire"><span className="dg-bind">REST · Socket.IO</span></span></li>
      </ul>
      <div className="dg-node dg-node--core">
        <span className="dg-name">API</span>
        <span className="dg-sub">NestJS · bookings, approvals, dispatch, trips · shared domain types</span>
      </div>
      <ul className="dg-row dg-row--3 dg-row--below">
        <li className="dg-node"><span className="dg-wire dg-wire--up" /><span className="dg-name">PostgreSQL</span><span className="dg-sub">through Prisma · row locks for dispatch</span></li>
        <li className="dg-node"><span className="dg-wire dg-wire--up" /><span className="dg-name">Redis</span><span className="dg-sub">Socket.IO adapter for the live map</span></li>
        <li className="dg-node"><span className="dg-wire dg-wire--up" /><span className="dg-name">BullMQ</span><span className="dg-sub">retries push notifications</span></li>
      </ul>
      <figcaption className="t-small">Simplified, and limited to what is on my résumé.</figcaption>
    </figure>
  );
}

export function BlockVaultDiagram() {
  return (
    <figure className="dg" aria-label="BlockVault architecture">
      <ul className="dg-row dg-row--2">
        <li className="dg-node"><span className="dg-name">Web app</span><span className="dg-sub">React · encrypts files in a Web Worker</span><span className="dg-wire"><span className="dg-bind">REST</span></span></li>
        <li className="dg-node"><span className="dg-name">Wallet</span><span className="dg-sub">signs in by signing a one-time nonce</span><span className="dg-wire"><span className="dg-bind">signature</span></span></li>
      </ul>
      <div className="dg-node dg-node--core">
        <span className="dg-name">API and workers</span>
        <span className="dg-sub">Flask · Celery · MongoDB · Redis · files in MinIO</span>
      </div>
      <ul className="dg-row dg-row--3 dg-row--below">
        <li className="dg-node"><span className="dg-wire dg-wire--up" /><span className="dg-name">Redactor</span><span className="dg-sub">FastAPI · Presidio · spaCy · OCR</span></li>
        <li className="dg-node"><span className="dg-wire dg-wire--up" /><span className="dg-name">Crypto service</span><span className="dg-sub">Rust · AES-256-GCM · Argon2id</span></li>
        <li className="dg-node"><span className="dg-wire dg-wire--up" /><span className="dg-name">Proofs and anchoring</span><span className="dg-sub">Circom · snarkjs · IPFS · Solidity registry</span></li>
      </ul>
      <figcaption className="t-small">The API hands heavy or sensitive work to small services and background workers.</figcaption>
    </figure>
  );
}
